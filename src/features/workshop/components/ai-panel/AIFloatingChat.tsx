import { useEffect, useRef, useState } from "react";
import {
  Bot,
  LoaderCircle,
  MessageCircle,
  Minus,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import type { AiGenerationStatus, AiMessage } from "../../types";

interface AIFloatingChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messages: AiMessage[];
  streamedText: string;
  status: AiGenerationStatus | null;
  error: string | null;
  isGenerating: boolean;
  isDirty: boolean;
  onGenerate: (prompt: string) => void;
  isCompleted: boolean;
}

const STARTER_PROMPTS = [
  "Turn this brief into clear delivery phases and actionable tasks.",
  "Review the plan for missing risks, dependencies, and acceptance criteria.",
  "Simplify the plan into a realistic first release.",
];

interface GeneratedPlan {
  project_name?: string;
  project_description?: string;
  projectSummary?: string;
  assumptions?: string[];
  features?: Array<{
    feature_name?: string;
    feature_description?: string;
    priority?: string;
    tasks?: Array<{ task_name?: string }>;
  }>;
}

function parseGeneratedPlan(content: string): GeneratedPlan | null {
  try {
    const value: unknown = JSON.parse(content);
    if (!value || typeof value !== "object" || !("features" in value))
      return null;
    return value as GeneratedPlan;
  } catch {
    return null;
  }
}

function AssistantMessage({ content }: { content: string }) {
  const plan = parseGeneratedPlan(content);
  if (!plan) return <p className="whitespace-pre-wrap">{content}</p>;

  const taskCount =
    plan.features?.reduce(
      (total, feature) => total + (feature.tasks?.length ?? 0),
      0,
    ) ?? 0;
  return (
    <div className="space-y-3">
      <div>
        <p className="font-semibold">
          {plan.project_name || "Your project plan is ready"}
        </p>
        {plan.project_description ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {plan.project_description}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="secondary">{plan.features?.length ?? 0} sections</Badge>
        <Badge variant="secondary">{taskCount} tasks</Badge>
      </div>
      {plan.features?.map((feature, index) => (
        <div
          key={`${feature.feature_name ?? "feature"}-${index}`}
          className="rounded-xl border bg-background/70 p-3"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium leading-5">
              {feature.feature_name || `Section ${index + 1}`}
            </p>
            {feature.priority ? (
              <Badge variant="outline" className="shrink-0 text-[10px]">
                {feature.priority}
              </Badge>
            ) : null}
          </div>
          {feature.feature_description ? (
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {feature.feature_description}
            </p>
          ) : null}
          <p className="mt-2 text-xs font-medium text-primary">
            {feature.tasks?.length ?? 0} tasks placed on canvas
          </p>
        </div>
      ))}
      <p className="text-xs text-muted-foreground">
        The generated sections and tasks are available on the canvas.
      </p>
    </div>
  );
}

export function AIFloatingChat({
  open,
  onOpenChange,
  messages,
  streamedText,
  status,
  error,
  isGenerating,
  isDirty,
  onGenerate,
  isCompleted,
}: AIFloatingChatProps) {
  const [prompt, setPrompt] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, open, streamedText]);

  function submit() {
    const value = prompt.trim();
    if (!value || isGenerating || isDirty) return;
    onGenerate(value);
    setPrompt("");
  }

  return (
    <>
      {open ? (
        <section
          aria-label="AI planning chat"
          className="fixed bottom-20 right-3 z-50 flex h-[min(640px,calc(100vh-6.5rem))] w-[min(420px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl sm:right-5"
        >
          <header className="flex items-center gap-3 border-b bg-muted/25 px-4 py-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-semibold">
                AI planning partner
              </h2>
              <p className="truncate text-xs text-muted-foreground">
                Refine the workshop without leaving the canvas.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => onOpenChange(false)}
              aria-label="Minimize AI chat"
            >
              <Minus className="size-4" />
            </Button>
          </header>

          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-4 p-5">
              {messages.length === 0 ? (
                <div className="rounded-2xl border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Bot className="size-4 text-primary" /> Start with your goal
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    The backend will use your saved draft context, generate a
                    structured plan, and place it directly on the canvas.
                  </p>
                  <div className="mt-4 space-y-2">
                    {STARTER_PROMPTS.map((starter) => (
                      <Button
                        key={starter}
                        type="button"
                        variant="outline"
                        className="h-auto w-full justify-start whitespace-normal px-3 py-2 text-left text-xs"
                        onClick={() => setPrompt(starter)}
                      >
                        {starter}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : null}

              {messages.map((message, index) => (
                <div
                  key={message.id ?? `${message.role}-${index}`}
                  className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    {message.role === "user" ? (
                      <UserRound className="size-4" />
                    ) : (
                      <Bot className="size-4 text-primary" />
                    )}
                  </span>
                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                  >
                    {message.role === "assistant" ? (
                      <AssistantMessage content={message.content} />
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {isGenerating ? (
                <div className="flex gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <LoaderCircle className="size-4 animate-spin text-primary" />
                  </span>
                  <div className="max-w-[82%] rounded-2xl bg-muted px-3.5 py-2.5 text-sm leading-6">
                    {streamedText || "Building and arranging your workshop…"}
                  </div>
                </div>
              ) : null}

              {status === "FAILED" ? (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  {error ||
                    "Generation failed. Your saved canvas was not changed."}
                </div>
              ) : null}
              <div ref={endRef} />
            </div>
          </ScrollArea>
          {!isCompleted && (
            <div className="border-t bg-background p-3.5">
              {isDirty ? (
                <Badge
                  variant="outline"
                  className="mb-2 border-amber-500/40 text-amber-600"
                >
                  Save canvas changes before asking AI
                </Badge>
              ) : null}

              <div className="relative">
                <Textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      submit();
                    }
                  }}
                  disabled={isGenerating || isDirty}
                  placeholder="Ask AI to generate or refine the plan…"
                  className="min-h-24 resize-none pr-12"
                />
                <Button
                  type="button"
                  size="icon"
                  className="absolute bottom-2 right-2"
                  disabled={!prompt.trim() || isGenerating || isDirty}
                  onClick={submit}
                  aria-label="Send prompt"
                >
                  {isGenerating ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <Send />
                  )}
                </Button>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Enter to send · Shift + Enter for a new line
              </p>
            </div>
          )}
        </section>
      ) : null}

      <Button
        type="button"
        size="icon"
        className="fixed bottom-5 right-4 z-50 size-12 rounded-full shadow-xl transition-transform hover:scale-105 sm:right-5"
        onClick={() => onOpenChange(!open)}
        aria-label={open ? "Close AI planning chat" : "Open AI planning chat"}
        aria-expanded={open}
      >
        {isGenerating ? (
          <LoaderCircle className="size-5 animate-spin" />
        ) : (
          <MessageCircle className="size-5" />
        )}
        {status === "FAILED" ? (
          <span className="absolute right-0 top-0 size-3 rounded-full border-2 border-background bg-destructive" />
        ) : null}
      </Button>
    </>
  );
}
