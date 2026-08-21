import { TaskPriority } from "@/types/enums";
import type {
  ProjectMemberSummary,
  ProjectRoleDefinition,
} from "@/features/project/types";
import type { User } from "@/types/models/user";

/**
 * Generic trend direction used by any stat card that shows
 * a "up 3 from last week" style delta.
 */
export type TrendDirection = "up" | "down" | "neutral";

/**
 * The name of the lucide-react icon to render for a given stat.
 * Kept as a string (not a component) so this type stays serializable
 * and safe to receive straight from an API response.
 */



export type DashboardStatIcon =
  | "folder"
  | "list-checks"
  | "check-circle"
  | "clock";

export interface DashboardStatTrend {
  direction: TrendDirection;
  label: string; // e.g. "1 this month", "3 from last week"
}

export interface DashboardStat {
  id: string;
  label: string; // "Total Projects"
  value: number;
  icon: DashboardStatIcon;
  trend: DashboardStatTrend;
}

export interface TaskProgressPoint {
  day: string; // "Mon" | "Tue" | ...
  completed: number;
}

export type TaskProgressRange = "last_7_days" | "last_30_days" | "this_month";

export interface UpcomingDeadline {
  id: string;
  taskId: string;
  title: string;
  projectId: string;
  projectName: string;
  dueDate: string; // ISO date
  priority: TaskPriority;
}

export interface FocusItem {
  id: string;
  taskId: string;
  title: string;
  projectName: string;
  time: string; // display time, e.g. "10:00 AM"
  completed: boolean;
}

export interface RecentActivityItem {
  id: string;
  actor: Pick<User, "id" | "name" | "avatar">;
  message: string; // "completed Login Page UI"
  projectName: string;
  createdAt: string; // ISO date, rendered as "2m ago" on the client
}

export interface RecentProjectSummary {
  id: string;
  name: string;
  role?: string | ProjectRoleDefinition | null;
  roleLabel?: string | null;
  roleName?: string | null;
  currentMember?: ProjectMemberSummary | null;
  isAdmin?: boolean;
  progress: number; // 0-100
  color: string;
}

/**
 * GET /dashboard/summary
 * Everything that does NOT depend on the task-progress range and does NOT
 * change from checking off a focus item. Loads once, independent of the
 * other two endpoints below.
 */
export interface DashboardSummary {
  stats: DashboardStat[];
  upcomingDeadlines: UpcomingDeadline[];
  recentActivity: RecentActivityItem[];
  recentProjects: RecentProjectSummary[];
}

/**
 * GET /dashboard/ai/summary
 * AI-generated daily guidance that interprets dashboard signals and recommends
 * the highest-value next action for the user.
 */
export interface DashboardAiSummary {
  headline: string;
  quickInsight: string;
  focusRecommendation: string;
}

/**
 * GET /dashboard/task-progress?range=...
 * Its own endpoint so switching the range only reloads this chart, not the
 * whole page.
 */
export interface TaskProgressData {
  range: TaskProgressRange;
  points: TaskProgressPoint[];
}

/**
 * GET /dashboard/todays-focus
 * PATCH /dashboard/todays-focus/:taskId
 * Its own endpoint so toggling a focus item only invalidates this list, not
 * the whole dashboard.
 */
export type TodaysFocusData = FocusItem[];
