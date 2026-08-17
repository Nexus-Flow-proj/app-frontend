import React from "react";
import { useNavigate } from "react-router";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

interface UserLinkProps {
  userId?: string;
  name?: string;
  className?: string;
  children?: React.ReactNode;
}

export function UserLink({ userId, name, className, children }: UserLinkProps) {
  const navigate = useNavigate();
  const currentUserId = useAuthStore((s) => s.user?.id);

  if (!userId) {
    return <span className={className}>{children || name || ""}</span>;
  }

  const isCurrentUser = currentUserId && userId === currentUserId;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (isCurrentUser) {
          navigate(ROUTES.PROFILE);
        } else {
          navigate(ROUTES.USER_PROFILE(userId));
        }
      }}
      className={cn(
        "cursor-pointer hover:underline focus:outline-none inline font-medium text-left",
        className,
      )}
      title={isCurrentUser ? "View my profile" : `View ${name ?? "user"}'s profile`}
    >
      {children || name}
    </button>
  );
}

export default UserLink;
