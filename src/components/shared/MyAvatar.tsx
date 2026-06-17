import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "../ui/avatar";

interface MyAvatarProps {
  name: string;
  avatarUrl?: string;
  isActive?: boolean;
}

function MyAvatar({ name, avatarUrl, isActive }: MyAvatarProps) {
  const charactersName = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Avatar size="sm">
      <AvatarImage src={avatarUrl} alt={name} />
      <AvatarFallback>{charactersName}</AvatarFallback>
      {isActive && <AvatarBadge className="bg-green-600 dark:bg-green-800" />}
    </Avatar>
  );
}

export default MyAvatar;
