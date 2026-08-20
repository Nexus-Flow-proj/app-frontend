export function ProfileHeader() {
  return (
    <header className="flex items-start gap-3">
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
