import { useParams } from "react-router";
import { Loader2, AlertCircle } from "lucide-react";
import { useInvitePreview } from "../hooks";
import { InvitePreviewCard } from "../components/InvitePreviewCard";

export default function InviteAcceptPage() {
  const { token = "" } = useParams<{ token: string }>();
  const { data: preview, isLoading, isError } = useInvitePreview(token);

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          You&apos;ve been invited
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Join your team on Nexus-Flow
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin text-indigo-500" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="size-5 shrink-0 text-red-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">
              Invalid invite link
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              This invite may have expired or already been used.
            </p>
          </div>
        </div>
      )}

      {/* Invite preview */}
      {preview && <InvitePreviewCard token={token} preview={preview} />}
    </>
  );
}
