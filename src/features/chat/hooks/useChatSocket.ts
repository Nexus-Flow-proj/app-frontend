import { useCallback, useEffect, useRef } from "react";
import { socket } from "@/lib/socket/socket-client";
import { SOCKET_EVENTS } from "@/lib/socket/constants/socket-events";
import { TYPING_DEBOUNCE_MS, TYPING_STOP_TIMEOUT_MS } from "../constants";

export function useChatSocket(projectId?: string) {
  const isTypingRef = useRef<boolean>(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEmitTimeRef = useRef<number>(0);

  const emitTyping = useCallback(
    (isTyping: boolean) => {
      if (!projectId || !socket.connected) return;
      socket.emit(SOCKET_EVENTS.CHAT.TYPING, {
        projectId,
        isTyping,
      });
      isTypingRef.current = isTyping;
    },
    [projectId],
  );

  const handleUserKeystroke = useCallback(() => {
    if (!projectId) return;

    const now = Date.now();
    // Throttle positive isTyping emit to server
    if (
      !isTypingRef.current ||
      now - lastEmitTimeRef.current > TYPING_DEBOUNCE_MS
    ) {
      emitTyping(true);
      lastEmitTimeRef.current = now;
    }

    // Reset timeout for when user stops typing
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      emitTyping(false);
    }, TYPING_STOP_TIMEOUT_MS);
  }, [emitTyping, projectId]);

  const handleBlur = useCallback(() => {
    if (isTypingRef.current) {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      emitTyping(false);
    }
  }, [emitTyping]);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      if (isTypingRef.current && projectId) {
        emitTyping(false);
      }
    };
  }, [emitTyping, projectId]);

  return {
    handleUserKeystroke,
    handleBlur,
  };
}
