import type { ReactNode } from "react";

interface InvitationLayoutProps {
  children: ReactNode;
}

export function InvitationLayout({ children }: InvitationLayoutProps) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 px-4 py-8">
      <div className="w-full max-w-xl">{children}</div>
    </main>
  );
}
