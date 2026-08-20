import { AlertTriangle, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCancelSubscription } from "../hooks/useCancelSubscription";

interface CancelSubscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentPeriodEnd?: string | null;
  tierName?: string;
}

export function CancelSubscriptionDialog({
  isOpen,
  onClose,
  currentPeriodEnd,
  tierName = "Pro",
}: CancelSubscriptionDialogProps) {
  const { mutate: cancelSub, isPending } = useCancelSubscription();

  const formattedEndDate = currentPeriodEnd
    ? (() => {
        try {
          return format(parseISO(currentPeriodEnd), "MMMM d, yyyy");
        } catch {
          return "the end of your current billing period";
        }
      })()
    : "the end of your billing cycle";

  const handleConfirmCancel = () => {
    cancelSub(undefined, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2">
            <AlertTriangle className="size-6" />
          </div>
          <DialogTitle className="text-center">Cancel Subscription</DialogTitle>
          <DialogDescription className="text-center">
            Are you sure you want to cancel your <strong>{tierName}</strong> plan?
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm space-y-2 text-muted-foreground">
          <p>
            • You will retain full <strong>{tierName}</strong> access until{" "}
            <span className="font-semibold text-foreground">{formattedEndDate}</span>.
          </p>
          <p>
            • After that date, your account will downgrade to the <strong>Free</strong> tier.
          </p>
          <p>• Your existing projects and tasks will not be deleted.</p>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            Keep My Plan
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirmCancel}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              "Confirm Cancellation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
