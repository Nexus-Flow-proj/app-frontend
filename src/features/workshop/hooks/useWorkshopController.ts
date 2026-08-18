import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { QUERY_KEYS, ROUTES } from "@/constants";
import { useDraft } from "@/features/drafts/hooks/useDraft";
import { SocketManager } from "@/lib/socket/socket-manager";
import { SOCKET_EVENTS } from "@/lib/socket/constants/socket-events";
import type { ApiError } from "@/types";
import { workshopService } from "../services";
import { useWorkshopStore } from "../store/workshopStore";
import type {
  AiGenerationEvent,
  AiGenerationStatus,
  WorkshopCanvasResponseDto,
} from "../types";
import { fromWorkshopDto, toSaveWorkshopDto } from "../utils/workshopMappers";
import { useBlocker } from "react-router";

function errorText(error: ApiError | null | undefined) {
  const message = error?.message;
  return Array.isArray(message)
    ? message.join(". ")
    : (message ?? "Something went wrong");
}

export function useWorkshopController(draftId: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const draftQuery = useDraft(draftId);
  const loadCanvas = useWorkshopStore((state) => state.loadCanvas);
  const resetCanvas = useWorkshopStore((state) => state.resetCanvas);
  const markClean = useWorkshopStore((state) => state.markClean);
  const isDirty = useWorkshopStore((state) => state.isDirty);
  const canvasId = useWorkshopStore((state) => state.canvasId);
  const [isAiOpen, setAiOpen] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] =
    useState<AiGenerationStatus | null>(null);
  const [streamedText, setStreamedText] = useState("");
  const [generationError, setGenerationError] = useState<string | null>(null);
  const handledCompletedRef = useRef<string | null>(null);
  const generationIdRef = useRef<string | null>(null);

  const canvasQuery = useQuery({
    queryKey: QUERY_KEYS.drafts.workshop(draftId),
    queryFn: () => workshopService.getCanvas(draftId),
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
  });

  const isLocalTerminal =
    generationStatus === "COMPLETED" || generationStatus === "FAILED";

  const messagesQuery = useQuery({
    queryKey: [...QUERY_KEYS.drafts.detail(draftId), "ai-messages"],
    queryFn: () => workshopService.getMessages(draftId),
    select: (response) => response.data,
    staleTime: 5_000,
    refetchInterval: isLocalTerminal ? false : 2_000,
  });
  const refetchCanvas = canvasQuery.refetch;
  const refetchMessages = messagesQuery.refetch;

  const applyWorkshop = useCallback(
    (dto: WorkshopCanvasResponseDto) => {
      const canvas = fromWorkshopDto(dto);
      loadCanvas(canvas.id, canvas.objects, canvas.viewport);
    },
    [loadCanvas],
  );

  useBlocker(({ currentLocation, nextLocation }) => {
    if (currentLocation.pathname === nextLocation.pathname) return false;
    return isDirty;
  });

  useEffect(() => {
    resetCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId]);

  useEffect(() => {
    if (canvasQuery.data?.data && !isDirty) {
      applyWorkshop(canvasQuery.data.data);
      return;
    }
    if (
      (canvasQuery.error as ApiError | null)?.statusCode === 404 &&
      !isDirty
    ) {
      resetCanvas();
    }
  }, [
    draftId,
    applyWorkshop,
    canvasQuery.data,
    canvasQuery.error,
    isDirty,
    resetCanvas,
  ]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const state = useWorkshopStore.getState();
      return workshopService.saveCanvas(
        draftId,
        toSaveWorkshopDto({
          viewport: state.viewport,
          objects: state.objects,
        }),
      );
    },
    onSuccess: (response) => {
      if (response.data?.id) {
        applyWorkshop(response.data);
        queryClient.setQueryData(QUERY_KEYS.drafts.workshop(draftId), response);
      } else {
        markClean();
      }
      toast.success(response.message || "Workshop saved");
    },
    onError: (error: ApiError) => toast.error(errorText(error)),
  });

  const generateMutation = useMutation({
    mutationFn: (prompt: string) =>
      workshopService.generatePlan(draftId, prompt),
    onMutate: () => {
      handledCompletedRef.current = null;
      generationIdRef.current = null;
      setGenerationStatus("PENDING");
      setGenerationError(null);
      setStreamedText("");
    },
    onSuccess: (response) => {
      const jobId = response.data.generationId ?? response.data.id;
      if (!jobId) {
        setGenerationStatus("FAILED");
        setGenerationError("The generation response did not include a job ID.");
        return;
      }
      generationIdRef.current = jobId;
      setGenerationId(jobId);
      setGenerationStatus(response.data.status);
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.drafts.detail(draftId), "ai-messages"],
      });
    },
    onError: (error: ApiError) => {
      setGenerationStatus("FAILED");
      setGenerationError(errorText(error));
    },
  });

  const handleAIGenerationComplete = useCallback(
    async (
      completedJobId?: string,
      socketWorkshop?: WorkshopCanvasResponseDto,
    ) => {
      const targetId = completedJobId ?? generationIdRef.current;
      if (
        handledCompletedRef.current &&
        handledCompletedRef.current === targetId
      ) {
        return;
      }
      if (targetId) {
        handledCompletedRef.current = targetId;
      }

      setGenerationStatus("COMPLETED");
      setStreamedText("");

      try {
        if (socketWorkshop) {
          applyWorkshop(socketWorkshop);
          queryClient.setQueryData(QUERY_KEYS.drafts.workshop(draftId), {
            success: true,
            message: "Workshop generated",
            statusCode: 200,
            data: socketWorkshop,
          });
        } else {
          const workshopRes = await workshopService.getCanvas(draftId);
          if (workshopRes.data) {
            applyWorkshop(workshopRes.data);
            queryClient.setQueryData(
              QUERY_KEYS.drafts.workshop(draftId),
              workshopRes,
            );
          }
        }
      } catch (err) {
        console.error("Failed to load workshop canvas after generation:", err);
      }

      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.drafts.detail(draftId), "ai-messages"],
      });
    },
    [applyWorkshop, draftId, queryClient],
  );

  const handleGenerationEvent = useCallback(
    (event: AiGenerationEvent) => {
      const eventId = event.generationId ?? event.id;
      const currentGenId = generationIdRef.current;
      if (currentGenId && eventId !== currentGenId) return;
      if (!currentGenId && eventId) {
        generationIdRef.current = eventId;
        setGenerationId(eventId);
      }
      if (event.status) {
        setGenerationStatus(event.status);
      }
      const progress = event.progressMessage ?? event.stage;
      if (progress) {
        setStreamedText((current) =>
          current ? `${current}\n${progress}` : progress,
        );
      }
      if (event.error || event.errorMessage) {
        setGenerationError(event.error ?? event.errorMessage ?? null);
      }
      if (event.status === "COMPLETED") {
        void handleAIGenerationComplete(eventId, event.workshop);
      }
    },
    [handleAIGenerationComplete],
  );

  useEffect(() => {
    const manager = SocketManager.getInstance();
    const cleanups = [
      manager.on(SOCKET_EVENTS.AI.GENERATION_CREATED, handleGenerationEvent),
      manager.on(SOCKET_EVENTS.AI.GENERATION_STARTED, handleGenerationEvent),
      manager.on(SOCKET_EVENTS.AI.GENERATION_PROGRESS, handleGenerationEvent),
      manager.on(SOCKET_EVENTS.AI.GENERATION_COMPLETED, handleGenerationEvent),
      manager.on(SOCKET_EVENTS.AI.GENERATION_FAILED, handleGenerationEvent),
      manager.onConnect(() => {
        if (!useWorkshopStore.getState().isDirty) void refetchCanvas();
        void refetchMessages();
      }),
    ];
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [handleGenerationEvent, refetchCanvas, refetchMessages]);

  const generationQuery = useQuery({
    queryKey: ["ai-generation", generationId],
    queryFn: () => workshopService.getGeneration(generationId ?? ""),
    enabled:
      !!generationId &&
      generationStatus !== "COMPLETED" &&
      generationStatus !== "FAILED",
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      return status === "COMPLETED" || status === "FAILED" ? false : 2_500;
    },
    select: (response) => response.data,
  });

  useEffect(() => {
    if (!generationQuery.data || !generationId) return;
    if (generationQuery.data.status === "COMPLETED") {
      void handleAIGenerationComplete(generationId, undefined);
    }
  }, [generationQuery.data, generationId, handleAIGenerationComplete]);

  // Watch for assistant response in messages query: if the message for the active generation
  // has arrived, generation is guaranteed complete.
  useEffect(() => {
    const currentId = generationIdRef.current;
    if (!currentId || generationStatus === "COMPLETED") return;
    const messages = messagesQuery.data;
    if (!messages || messages.length === 0) return;

    const hasCompletedMessage = messages.some(
      (m) => m.role === "assistant" && m.generationJobId === currentId,
    );
    if (hasCompletedMessage) {
      void handleAIGenerationComplete(currentId, undefined);
    }
  }, [messagesQuery.data, generationStatus, handleAIGenerationComplete]);

  const submitMutation = useMutation({
    mutationFn: () => workshopService.submitDraft(draftId),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects.all });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.drafts.all });
      toast.success(response.message || "Project created");
      resetCanvas();
      navigate(ROUTES.PROJECT_OVERVIEW(response.data.projectId), {
        replace: true,
      });
    },
    onError: (error: ApiError | Error) =>
      toast.error(error instanceof Error ? error.message : errorText(error)),
  });

  // useEffect(() => {
  //   const warn = (event: BeforeUnloadEvent) => {
  //     if (!useWorkshopStore.getState().isDirty) return;
  //     event.preventDefault();
  //   };
  //   window.addEventListener("beforeunload", warn);
  //   return () => window.removeEventListener("beforeunload", warn);
  // }, []);

  // Check if messages already has the assistant response for the active generation
  const hasAssistantResponse =
    !!generationId &&
    !!messagesQuery.data?.some(
      (m) => m.role === "assistant" && m.generationJobId === generationId,
    );

  const effectiveIsTerminal = isLocalTerminal || hasAssistantResponse;
  const effectiveGenerationStatus = effectiveIsTerminal
    ? generationStatus === "FAILED"
      ? "FAILED"
      : "COMPLETED"
    : (generationQuery.data?.status ?? generationStatus);
  const effectiveGenerationError =
    generationQuery.data?.errorMessage ??
    generationQuery.data?.error ??
    generationError;
  const isGenerating =
    !effectiveIsTerminal &&
    (effectiveGenerationStatus === "PENDING" ||
      effectiveGenerationStatus === "PROCESSING" ||
      generateMutation.isPending);
  const canSubmit =
    !isDirty && !!canvasId && !isGenerating && !saveMutation.isPending;

  return {
    draft: draftQuery.data,
    canvasQuery,
    messages: messagesQuery.data ?? [],
    messagesQuery,
    isAiOpen,
    setAiOpen,
    generationId,
    generationStatus: effectiveGenerationStatus,
    generationError: effectiveGenerationError,
    streamedText,
    isGenerating,
    isDirty,
    canSubmit,
    save: () => saveMutation.mutate(),
    isSaving: saveMutation.isPending,
    generate: (prompt: string) => {
      if (isDirty) {
        toast.error("Save your canvas before asking AI to revise it.");
        return;
      }
      generateMutation.mutate(prompt);
    },
    submit: () => submitMutation.mutate(),
    isSubmitting: submitMutation.isPending,
  };
}
