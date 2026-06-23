import MyAvatar from "@/components/shared/MyAvatar";

interface NavUserInfoProps {
  name: string;
  email: string;
  avatarUrl?: string;
}

function NavUserInfo({ name, email, avatarUrl }: NavUserInfoProps) {
  return (
    <>
      <MyAvatar
        name={name}
        avatarUrl={avatarUrl}
        classNameAvatar="rounded-lg bg-primary-200 text-primary-700 font-semibold text-xs"
      />

      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{name}</span>
        <span className="truncate text-xs text-muted-foreground">{email}</span>
      </div>
    </>
  );
}

export default NavUserInfo;
