import { useNavigate } from "react-router";
import {
  Bell,
  BellOff,
  ClipboardList,
  UserMinus,
  RefreshCw,
  CalendarClock,
  CheckCircle2,
  MessageSquare,
  Mail,
  UserCheck,
  UserX,
  AlertTriangle,
  LogOut,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useInfiniteNotifications } from "../hooks/useInfiniteNotifications";
import { useReadAllNotifications } from "../hooks/useReadAllNotifications";
import type { Notification } from "@/types";
import type { NotificationType } from "@/types/enums";

function getNotificationStyles(type: NotificationType) {
  switch (type) {
    case "TASK_ASSIGNED":
      return {
        icon: ClipboardList,
        iconBg: "bg-blue-100 dark:bg-blue-900/30",
        iconColor: "text-blue-600 dark:text-blue-400",
      };
    case "TASK_UNASSIGNED":
      return {
        icon: UserMinus,
        iconBg: "bg-gray-100 dark:bg-gray-800/30",
        iconColor: "text-gray-600 dark:text-gray-400",
      };
    case "TASK_UPDATED":
      return {
        icon: RefreshCw,
        iconBg: "bg-amber-100 dark:bg-amber-900/30",
        iconColor: "text-amber-600 dark:text-amber-400",
      };
    case "TASK_DUE_SOON":
      return {
        icon: CalendarClock,
        iconBg: "bg-rose-100 dark:bg-rose-900/30",
        iconColor: "text-rose-600 dark:text-rose-400",
      };
    case "TASK_COMPLETED":
      return {
        icon: CheckCircle2,
        iconBg: "bg-green-100 dark:bg-green-900/30",
        iconColor: "text-green-600 dark:text-green-400",
      };
    case "COMMENT_ADDED":
      return {
        icon: MessageSquare,
        iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
        iconColor: "text-indigo-600 dark:text-indigo-400",
      };
    case "INVITATION_RECEIVED":
      return {
        icon: Mail,
        iconBg: "bg-purple-100 dark:bg-purple-900/30",
        iconColor: "text-purple-600 dark:text-purple-400",
      };
    case "INVITATION_ACCEPTED":
      return {
        icon: UserCheck,
        iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
        iconColor: "text-emerald-600 dark:text-emerald-400",
      };
    case "INVITATION_REJECTED":
      return {
        icon: UserX,
        iconBg: "bg-red-100 dark:bg-red-900/30",
        iconColor: "text-red-600 dark:text-red-400",
      };
    case "INVITATION_CANCELLED":
    case "INVITE_EXPIRED":
      return {
        icon: AlertTriangle,
        iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
        iconColor: "text-yellow-600 dark:text-yellow-400",
      };
    case "REMOVED_FROM_PROJECT":
      return {
        icon: LogOut,
        iconBg: "bg-red-100 dark:bg-red-900/30",
        iconColor: "text-red-600 dark:text-red-400",
      };
    default:
      return {
        icon: Bell,
        iconBg: "bg-primary-50 dark:bg-primary-950/30",
        iconColor: "text-primary",
      };
  }
}

function getInitials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function NotificationCenter() {
  const navigate = useNavigate();
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteNotifications();

  const readAllMutation = useReadAllNotifications();

  const unreadCount = data?.unreadCount ?? 0;
  const notifications = data?.notifications ?? [];

  const handleOpenChange = (open: boolean) => {
    if (open && unreadCount > 0) {
      readAllMutation.mutate(undefined);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    const projectId = notification.metadata?.projectId;
    const taskId = notification.metadata?.taskId;
    const type = notification.type;

    if (projectId) {
      if (type.startsWith("INVITATION_")) {
        navigate(`/projects/${projectId}`);
      } else {
        const search = taskId ? `?task=${taskId}` : "";
        navigate(`/projects/${projectId}/boards${search}`);
      }
    } else {
      navigate("/dashboard");
    }
  };

  const relativeTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return "";
    }
  };

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          aria-label="Open notifications"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <Badge
              variant="default"
              size="xs"
              shape="circle"
              className="absolute -top-1.5 -right-1.5 animate-in zoom-in duration-200 border-2 border-sidebar font-semibold select-none flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[380px] p-0 flex flex-col overflow-hidden max-h-[500px]"
      >
        {/* Header */}
        <div className="flex items-center px-4 py-3 border-b border-border bg-muted/10 shrink-0">
          <span className="font-semibold text-sm">Notifications</span>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <Skeleton className="h-3 w-[70%]" />
                    <Skeleton className="h-3.5 w-[90%]" />
                    <Skeleton className="h-2.5 w-[40%]" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="py-8 text-center px-4">
              <p className="text-sm text-destructive font-medium">
                Failed to load notifications
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Please try reloading the page.
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="rounded-full bg-muted p-3 mb-3 text-muted-foreground">
                <BellOff className="size-6" />
              </div>
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
                We'll let you know when task updates or comments occur.
              </p>
            </div>
          ) : (
            <div className="py-1">
              {notifications.map((notification) => {
                const styles = getNotificationStyles(notification.type);
                const Icon = styles.icon;
                return (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-border/40 last:border-0 focus:bg-accent/50 ${!notification.isRead ? "bg-primary-50/20 dark:bg-primary-950/5" : ""
                      }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="relative shrink-0 mt-0.5">
                      {notification.actor ? (
                        <Avatar size="sm">
                          <AvatarImage
                            src={notification.actor.avatar}
                            alt={notification.actor.name}
                          />
                          <AvatarFallback className="text-[10px]">
                            {getInitials(notification.actor.name)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className={`size-8 rounded-full flex items-center justify-center ${styles.iconBg} ${styles.iconColor}`}>
                          <Icon className="size-4" />
                        </div>
                      )}
                      {notification.actor && (
                        <div className={`absolute -bottom-1 -right-1 size-4 rounded-full flex items-center justify-center border border-card ring-1 ring-border ${styles.iconBg} ${styles.iconColor}`}>
                          <Icon className="size-2.5" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-foreground line-clamp-1">
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="size-2 rounded-full bg-primary shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 break-words">
                        {notification.message}
                      </p>
                      <span className="text-[10px] text-muted-foreground/80 mt-1 block">
                        {relativeTime(notification.createdAt)}
                      </span>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer / Load More */}
        {hasNextPage && (
          <DropdownMenuItem
            className="flex justify-center p-1.5 bg-muted/5 border-t border-border shrink-0 hover:bg-accent focus:bg-accent"
            onSelect={(e) => e.preventDefault()}
          >
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground hover:text-foreground py-1.5 h-auto justify-center"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                fetchNextPage();
              }}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load more"
              )}
            </Button>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
