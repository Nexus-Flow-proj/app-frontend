import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, ChevronDown, Sparkles, Terminal } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

interface AIThinkingBubbleProps {
  streamedText: string;
}

const DEFAULT_STAGES = [
  "Thinking...",
  "Analyzing project requirements...",
  "Structuring delivery phases...",
  "Drafting agile task cards...",
  "Arranging visual canvas board...",
];

/**
 * Parses incoming progress strings into discrete, readable thought steps
 * even if joined without newlines or with ellipses.
 */
function parseThoughtSteps(raw: string): string[] {
  if (!raw) return [];
  const lines = raw.split(/\r?\n/);
  const result: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const sentences = trimmed
      .split(/(?<=\.\.\.?|\.\s)\s+(?=[A-Z0-9])/g)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (sentences.length > 1) {
      result.push(...sentences);
    } else {
      result.push(trimmed);
    }
  }

  return result;
}

/**
 * Derives a clean, user-friendly high-level headline from the active step.
 */
function formatHeadline(step: string): string {
  if (!step) return "Thinking...";

  const featureMatch = step.match(/planning feature:\s*(.+?)(?:\.\.|\.\.\.|$)/i);
  if (featureMatch?.[1]) {
    return `Planning: ${featureMatch[1].trim()}`;
  }

  if (/generating tasks/i.test(step)) {
    const countMatch = step.match(/\((\d+)\s+planned so far\)/i);
    return countMatch
      ? `Drafting tasks (${countMatch[1]} planned)`
      : "Drafting agile tasks & criteria...";
  }

  if (/analyzing/i.test(step)) {
    return "Analyzing requirements & context...";
  }

  if (/arranging|canvas|layout/i.test(step)) {
    return "Arranging visual canvas layout...";
  }

  return step.length > 42 ? `${step.slice(0, 42)}...` : step;
}

export function AIThinkingBubble({ streamedText }: AIThinkingBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Live timer for elapsed reasoning seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cycle fallback stages if no streamed text is received yet
  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % DEFAULT_STAGES.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  // Parse all steps
  const steps = useMemo(() => parseThoughtSteps(streamedText), [streamedText]);

  // Derive current status headline
  const activeHeadline = useMemo(() => {
    if (steps.length > 0) {
      return formatHeadline(steps[steps.length - 1]);
    }
    return DEFAULT_STAGES[stageIndex];
  }, [steps, stageIndex]);

  // Auto-scroll when new steps arrive or when expanded
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isOpen, steps.length]);

  return (
    <div className="w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <div className="overflow-hidden rounded-2xl border border-primary/25 bg-muted/40 shadow-md backdrop-blur-md transition-all duration-200 hover:border-primary/40">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left transition-colors hover:bg-muted/60"
              aria-label={isOpen ? "Hide reasoning details" : "Show reasoning details"}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="relative flex size-7 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary shadow-sm ring-1 ring-primary/20">
                  <Sparkles className="size-3.5 animate-pulse text-primary" />
                  <span className="absolute -inset-0.5 animate-ping rounded-xl bg-primary/20 opacity-30" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-xs font-semibold text-foreground">
                      {activeHeadline}
                    </p>
                    <Badge
                      variant="secondary"
                      className="h-4 border border-primary/20 bg-background/80 px-1.5 text-[10px] font-medium text-primary"
                    >
                      {seconds}s
                    </Badge>
                  </div>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {isOpen ? "Collapse thought process" : "Click to view live thought process"}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border/60 bg-background/50 px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground">
                <span className="text-[11px] font-medium">
                  {isOpen ? "Hide" : `Thoughts (${steps.length || 1})`}
                </span>
                <ChevronDown
                  className={`size-3.5 text-muted-foreground transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-primary" : ""
                  }`}
                />
              </div>
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="border-t border-border/60 bg-background/70 p-3">
              <div className="mb-2 flex items-center justify-between text-[10px] font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5 font-mono text-primary">
                  <Terminal className="size-3" />
                  Reasoning Stream
                </span>
                <span>{steps.length} {steps.length === 1 ? "step" : "steps"}</span>
              </div>

              <div
                ref={scrollRef}
                className="max-h-52 space-y-1.5 overflow-y-auto rounded-xl border border-border/50 bg-muted/40 p-2.5 font-mono text-[11px] leading-relaxed scrollbar-thin"
              >
                {steps.length === 0 ? (
                  <div className="flex items-center gap-2 py-1 text-muted-foreground">
                    <span className="size-1.5 animate-ping rounded-full bg-primary" />
                    <span>Synthesizing project brief & context...</span>
                  </div>
                ) : (
                  steps.map((step, idx) => {
                    const isLatest = idx === steps.length - 1;
                    return (
                      <div
                        key={`${step}-${idx}`}
                        className={`flex items-start gap-2 rounded-lg px-2 py-1 transition-colors ${
                          isLatest
                            ? "border border-primary/20 bg-primary/10 font-medium text-foreground"
                            : "text-muted-foreground/80 hover:text-foreground/90"
                        }`}
                      >
                        <span className="mt-0.5 flex size-3.5 shrink-0 items-center justify-center">
                          {isLatest ? (
                            <span className="size-2 animate-pulse rounded-full bg-primary ring-2 ring-primary/30" />
                          ) : (
                            <CheckCircle2 className="size-3 text-muted-foreground/50" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1 break-all">{step}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
}
