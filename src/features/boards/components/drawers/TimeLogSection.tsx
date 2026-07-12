import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Clock, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { TimeLog } from "../../types";

interface NewTimeLogData {
  durationMin: number;
  loggedDate: string;
  note?: string;
}

interface TimeLogSectionProps {
  timeLogs: TimeLog[];
  isLoading?: boolean;
  isSubmitting?: boolean;
  isDeleting?: boolean;
  onAddTimeLog: (data: NewTimeLogData) => void;
  onDeleteTimeLog: (timeLogId: string) => void;
}

function getTodayDateInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0 && remainingMinutes > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  return `${minutes}m`;
}

export function TimeLogSection({
  timeLogs,
  isLoading,
  isSubmitting,
  isDeleting,
  onAddTimeLog,
  onDeleteTimeLog,
}: TimeLogSectionProps) {
  const [minutes, setMinutes] = useState("");
  const [loggedDate, setLoggedDate] = useState(getTodayDateInputValue);
  const [note, setNote] = useState("");

  const totalMinutes = useMemo(
    () => timeLogs.reduce((total, log) => total + log.minutes, 0),
    [timeLogs],
  );

  const submit = () => {
    const durationMin = Number(minutes);
    const trimmedNote = note.trim();

    if (!Number.isFinite(durationMin) || durationMin <= 0 || isSubmitting) {
      return;
    }

    onAddTimeLog({
      durationMin,
      loggedDate,
      note: trimmedNote || undefined,
    });
    setMinutes("");
    setNote("");
    setLoggedDate(getTodayDateInputValue());
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Time logs
        </p>
        {totalMinutes > 0 && (
          <span className="text-xs text-muted-foreground">
            {formatMinutes(totalMinutes)} total
          </span>
        )}
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading time logs...</p>
        ) : timeLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No time logged yet.
          </p>
        ) : (
          timeLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/40 px-3 py-2"
            >
              <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Clock className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="text-sm font-medium text-foreground">
                    {formatMinutes(log.minutes)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    by {log.user?.name ?? "Unknown user"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(log.loggedAt), "MMM d, yyyy")}
                  </span>
                </div>
                {log.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {log.description}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                disabled={isDeleting}
                onClick={() => onDeleteTimeLog(log.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>

      <div className="space-y-2 rounded-lg border border-border bg-background/50 p-3">
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            min={1}
            step={1}
            value={minutes}
            onChange={(event) => setMinutes(event.target.value)}
            placeholder="Minutes"
            className="h-8 text-sm"
          />
          <Input
            type="date"
            value={loggedDate}
            onChange={(event) => setLoggedDate(event.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <Textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Optional note"
          rows={2}
          className="resize-none text-sm"
        />
        <Button
          type="button"
          size="sm"
          className="h-8 w-full gap-1.5"
          disabled={!minutes || Number(minutes) <= 0 || isSubmitting}
          onClick={submit}
        >
          <Plus className="size-3.5" />
          Add time
        </Button>
      </div>
    </div>
  );
}
