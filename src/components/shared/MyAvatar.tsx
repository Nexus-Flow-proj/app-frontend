import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "../ui/avatar";

interface MyAvatarProps {
  name: string;
  avatarUrl?: string;
}

function MyAvatar({ name, avatarUrl }: MyAvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Avatar size="sm">
      <AvatarImage src={avatarUrl} alt={name} />
      <AvatarFallback>{initials}</AvatarFallback>
      <AvatarBadge className="bg-green-600 dark:bg-green-800" />
    </Avatar>
  );
}

export default MyAvatar;
