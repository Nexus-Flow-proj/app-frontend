import { ArrowLeft, Pin, PinOff } from "lucide-react";
import { usePinnedMessages, usePinMessage } from "../hooks";
import { useProjectStore } from "@/store/projectStore";
import { useChatStore } from "@/store/chatStore";
import { formatChatTimestamp } from "../utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatPinnedDrawerProps {
  projectId: string;
}

export function ChatPinnedDrawer({ projectId }: ChatPinnedDrawerProps) {
  const isPinnedDrawerOpen = useChatStore((state) => state.isPinnedDrawerOpen);
  const setIsPinnedDrawerOpen = useChatStore(
    (state) => state.setIsPinnedDrawerOpen,
  );
  const { data: pinnedMessages, isLoading } = usePinnedMessages(projectId);
  const pinMutation = usePinMessage(projectId);
  const canPin = useProjectStore((state) => state.hasPermission("chat.pin"));

  if (!isPinnedDrawerOpen) return null;

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-background animate-in slide-in-from-right duration-200">
      <header className="flex items-center gap-2 border-b px-3 py-2.5 bg-muted/20">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => setIsPinnedDrawerOpen(false)}
          aria-label="Back to chat"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <Pin className="size-3.5 text-primary" />
          <h3 className="text-xs font-semibold">Pinned Messages</h3>
          <span className="text-[10px] text-muted-foreground">
            ({pinnedMessages?.length ?? 0})
          </span>
        </div>
      </header>

      <ScrollArea className="flex-1 p-3">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : !pinnedMessages || pinnedMessages.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground space-y-2">
            <Pin className="size-8 mx-auto opacity-30" />
            <p className="text-xs">No pinned messages yet.</p>
            <p className="text-[11px] text-muted-foreground/70">
              Pin important announcements or updates for quick access.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {pinnedMessages.map((msg) => (
              <div
                key={msg.id}
                className="rounded-xl border border-border/80 bg-muted/30 p-2.5 space-y-1.5 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-foreground truncate max-w-[150px]">
                    {msg.sender.firstName} {msg.sender.lastName}
                  </span>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <span className="text-[10px]">
                      {formatChatTimestamp(msg.createdAt)}
                    </span>
                    {canPin ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-5 text-muted-foreground hover:text-foreground"
                        onClick={() =>
                          pinMutation.mutate({
                            messageId: msg.id,
                            dto: { pinned: false },
                          })
                        }
                        aria-label="Unpin message"
                      >
                        <PinOff className="size-3" />
                      </Button>
                    ) : null}
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {msg.content || "[Attachment]"}
                </p>

                {msg.pinnedBy ? (
                  <p className="text-[10px] text-muted-foreground">
                    Pinned by {msg.pinnedBy.firstName} {msg.pinnedBy.lastName}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
