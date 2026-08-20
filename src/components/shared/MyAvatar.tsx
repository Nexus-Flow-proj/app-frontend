import { useNavigate } from "react-router";
import { ROUTES } from "@/constants";
import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "../ui/avatar";

interface MyAvatarProps {
  name: string;
  avatarUrl?: string;
  isActive?: boolean;
  className?: string;
  classNameAvatar?: string;
  size?: "sm" | "lg";
  userId?: string;
}

function MyAvatar({
  name,
  avatarUrl,
  isActive,
  className,
  classNameAvatar,
  size,
  userId,
}: MyAvatarProps) {
  const navigate = useNavigate();
  const currentUserId = useAuthStore((s) => s.user?.id);

  const charactersName = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const avatarNode = (
    <Avatar size={size || "default"} className={className}>
      <AvatarImage src={avatarUrl} alt={name} />
      <AvatarFallback className={classNameAvatar}>
        {charactersName}
      </AvatarFallback>
      {isActive && <AvatarBadge className="bg-green-600 dark:bg-green-800" />}
    </Avatar>
  );

  if (!userId) {
    return avatarNode;
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
      className="cursor-pointer outline-none ring-offset-background transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring rounded-full"
      title={isCurrentUser ? "View my profile" : `View ${name}'s profile`}
    >
      {avatarNode}
    </button>
  );
}

export default MyAvatar;
