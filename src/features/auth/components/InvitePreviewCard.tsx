import { Users, Loader2, AlertCircle } from "lucide-react";
import { formatDate, formatInitials } from "@/lib/format";
import { useInviteAccept } from "../hooks";
import type { InvitePreview } from "@/types";

interface InvitePreviewCardProps {
  token: string;
  preview: InvitePreview;
}

export function InvitePreviewCard({ token, preview }: InvitePreviewCardProps) {
  const { mutate: acceptInvite, isPending } = useInviteAccept();

  const isExpired = new Date(preview.expiresAt) < new Date();

  return (
    <div className="space-y-6">
      {/* Project info */}
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-lg text-white text-lg font-bold"
          style={{ backgroundColor: preview.project.color }}
        >
          {formatInitials(preview.project.name)}
        </div>
        <div>
          <p className="font-semibold text-slate-900">{preview.project.name}</p>
          {preview.project.description && (
            <p className="text-sm text-slate-500 line-clamp-1">
              {preview.project.description}
            </p>
          )}
        </div>
      </div>

      {/* Invited by */}
      <div className="flex items-center gap-3 text-sm text-slate-600">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-medium text-xs">
          {preview.invitedBy.avatar ? (
            <img
              src={preview.invitedBy.avatar}
              alt={preview.invitedBy.name}
              className="size-8 rounded-full object-cover"
            />
          ) : (
            formatInitials(preview.invitedBy.name)
          )}
        </div>
        <span>
          <strong className="text-slate-900">{preview.invitedBy.name}</strong>{" "}
          invited you as{" "}
          <strong className="text-slate-900">{preview.role}</strong>
        </span>
      </div>

      {/* Expiry */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Users className="size-3.5" />
        Invite expires {formatDate(preview.expiresAt)}
      </div>

      {isExpired ? (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          <AlertCircle className="size-4 shrink-0" />
          This invite link has expired. Ask the project admin to resend it.
        </div>
      ) : (
        <button
          onClick={() => acceptInvite(token)}
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {isPending ? "Joining…" : "Accept & join project"}
        </button>
      )}
    </div>
  );
}
