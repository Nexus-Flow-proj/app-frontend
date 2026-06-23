import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "../ui/avatar";

interface MyAvatarProps {
  name: string;
  avatarUrl?: string;
  isActive?: boolean;
  className?: string;
  classNameAvatar?: string;
  size?: "sm" | "lg";
}

function MyAvatar({
  name,
  avatarUrl,
  isActive,
  className,
  classNameAvatar,
  size,
}: MyAvatarProps) {
  const charactersName = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Avatar size={size || "default"} className={className}>
      <AvatarImage src={avatarUrl} alt={name} />
      <AvatarFallback className={classNameAvatar}>
        {charactersName}
      </AvatarFallback>
      {isActive && <AvatarBadge className="bg-green-600 dark:bg-green-800" />}
    </Avatar>
  );
}

export default MyAvatar;
