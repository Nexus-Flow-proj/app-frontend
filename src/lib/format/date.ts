import { format, isPast, isToday } from "date-fns";

interface DueDateInfo {
  result: string;
  dueSoon: boolean;
  overdue: boolean;
}

export function dueDateFormate(value: string): DueDateInfo {
  const date = new Date(value);
  const overdue = isPast(date) && !isToday(date);
  const dueSoon = isToday(date);

  return {
    result: overdue
      ? "Overdue"
      : isToday(date)
        ? "Today"
        : format(date, "MMM d"),
    dueSoon,
    overdue,
  };
}

export function dateformat(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
