import { ExternalLink, RefreshCw } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { MyEmpty } from "@/components/shared/feedback/MyEmpty";
import { usePaymentHistory } from "../hooks/usePaymentHistory";
import type { PaymentDto, PaymentStatus } from "../types";

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  switch (status) {
    case "SUCCEEDED":
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Paid
        </span>
      );
    case "PENDING":
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
          <span className="size-1.5 rounded-full bg-amber-500" />
          Processing
        </span>
      );
    case "FAILED":
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-destructive font-medium">
          <span className="size-1.5 rounded-full bg-destructive" />
          Failed
        </span>
      );
    case "REFUNDED":
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-muted-foreground" />
          Refunded
        </span>
      );
    default:
      return <span className="text-xs text-muted-foreground">{status}</span>;
  }
}

export function PaymentHistoryTable() {
  const { data: paymentsResponse, isLoading, error, refetch, isRefetching } =
    usePaymentHistory();

  const payments: PaymentDto[] = paymentsResponse ?? [];

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-9 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border/70 p-6 text-center text-xs text-muted-foreground">
        <p className="mb-2.5">Failed to load invoice history.</p>
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-7"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RefreshCw className={`mr-1.5 size-3 ${isRefetching ? "animate-spin" : ""}`} />
          Retry
        </Button>
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <MyEmpty
        title="No billing history"
        description="Your verified invoices and receipts will appear here once you upgrade or make a payment."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border/70">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/70">
            <TableHead className="text-xs font-medium text-muted-foreground">Date</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Amount</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Status</TableHead>
            <TableHead className="text-right text-xs font-medium text-muted-foreground">Documents</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => {
            const formattedDate = (() => {
              try {
                return format(parseISO(payment.createdAt), "MMM d, yyyy");
              } catch {
                return payment.createdAt;
              }
            })();

            const formattedAmount = (payment.amountCents / 100).toLocaleString(
              "en-US",
              {
                style: "currency",
                currency: (payment.currency || "usd").toUpperCase(),
              },
            );

            return (
              <TableRow key={payment.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20">
                <TableCell className="text-xs font-medium text-foreground">
                  {formattedDate}
                </TableCell>
                <TableCell className="text-xs font-mono text-foreground/90">
                  {formattedAmount}
                </TableCell>
                <TableCell>
                  <PaymentStatusBadge status={payment.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-3">
                    {payment.invoiceUrl && (
                      <a
                        href={payment.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <span>Invoice</span>
                        <ExternalLink className="size-2.5 opacity-60" />
                      </a>
                    )}
                    {payment.receiptUrl && (
                      <a
                        href={payment.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <span>Receipt</span>
                        <ExternalLink className="size-2.5 opacity-60" />
                      </a>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
