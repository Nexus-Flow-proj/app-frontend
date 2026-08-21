import { useMemo } from "react";
import { useChatStore } from "@/store/chatStore";

export function ChatTypingIndicator() {
  const typingUsersMap = useChatStore((state) => state.typingUsers);
  const typingUsers = useMemo(
    () => Object.values(typingUsersMap),
    [typingUsersMap],
  );

  if (typingUsers.length === 0) return null;

  const names = typingUsers.map((u) => u.userName);
  let text: string;
  if (names.length === 1) {
    text = `${names[0]} is typing…`;
  } else if (names.length === 2) {
    text = `${names[0]} and ${names[1]} are typing…`;
  } else {
    text = `${names[0]} and ${names.length - 1} others are typing…`;
  }

  return (
    <div className="flex items-center gap-2 px-4 py-1 text-[11px] text-muted-foreground animate-in fade-in">
      <div className="flex items-center gap-0.5">
        <span className="size-1.5 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.3s]" />
        <span className="size-1.5 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.15s]" />
        <span className="size-1.5 rounded-full bg-primary/70 animate-bounce" />
      </div>
      <span className="truncate">{text}</span>
    </div>
  );
}
