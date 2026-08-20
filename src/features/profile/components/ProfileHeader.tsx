import { UserCircle } from "lucide-react";

export function ProfileHeader() {
  return (
    <header className="flex items-start gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <UserCircle className="size-5" />
      </span>
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-semibold tracking-normal text-foreground">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal information, avatar, and see your project
          memberships.
        </p>
      </div>
    </header>
  );
}
