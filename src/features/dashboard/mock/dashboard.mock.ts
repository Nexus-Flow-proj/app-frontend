import { MemberRole, TaskPriority } from "@/types/enums";
import { MOCK_PROJECTS, MOCK_USER } from "./index"; 
import type { DashboardData } from "@/features/dashboard/types";

export const MOCK_DASHBOARD_DATA: DashboardData = {
  stats: [
    {
      id: "stat-total-projects",
      label: "Total Projects",
      value: MOCK_PROJECTS.length,
      icon: "folder",
      trend: { direction: "up", label: "1 this month" },
    },
    {
      id: "stat-my-tasks",
      label: "My Tasks",
      value: 18,
      icon: "list-checks",
      trend: { direction: "up", label: "3 from last week" },
    },
    {
      id: "stat-completed",
      label: "Completed",
      value: 12,
      icon: "check-circle",
      trend: { direction: "up", label: "20% from last week" },
    },
    {
      id: "stat-due-today",
      label: "Due Today",
      value: 4,
      icon: "clock",
      trend: { direction: "down", label: "1 from yesterday" },
    },
  ],

  taskProgress: {
    range: "last_7_days",
    points: [
      { day: "Mon", completed: 8 },
      { day: "Tue", completed: 11 },
      { day: "Wed", completed: 14 },
      { day: "Thu", completed: 9 },
      { day: "Fri", completed: 21 },
      { day: "Sat", completed: 16 },
      { day: "Sun", completed: 19 },
    ],
  },

  upcomingDeadlines: [
    {
      id: "deadline-1",
      taskId: "task-1",
      title: "Login Page UI",
      projectId: MOCK_PROJECTS[0].id,
      projectName: MOCK_PROJECTS[0].name,
      dueDate: addDays(1),
      priority: TaskPriority.HIGH,
    },
    {
      id: "deadline-2",
      taskId: "task-2",
      title: "Dashboard Analytics",
      projectId: MOCK_PROJECTS[0].id,
      projectName: MOCK_PROJECTS[0].name,
      dueDate: addDays(4),
      priority: TaskPriority.MEDIUM,
    },
    {
      id: "deadline-3",
      taskId: "task-3",
      title: "Payment Integration",
      projectId: MOCK_PROJECTS[1].id,
      projectName: MOCK_PROJECTS[1].name,
      dueDate: addDays(7),
      priority: TaskPriority.HIGH,
    },
    {
      id: "deadline-4",
      taskId: "task-4",
      title: "User Documentation",
      projectId: MOCK_PROJECTS[0].id,
      projectName: MOCK_PROJECTS[0].name,
      dueDate: addDays(10),
      priority: TaskPriority.LOW,
    },
    {
      id: "deadline-5",
      taskId: "task-5",
      title: "User Documentation",
      projectId: MOCK_PROJECTS[0].id,
      projectName: MOCK_PROJECTS[0].name,
      dueDate: addDays(10),
      priority: TaskPriority.LOW,
    },
  ],

  todaysFocus: [
    {
      id: "focus-1",
      taskId: "task-5",
      title: "Review login page design",
      projectName: MOCK_PROJECTS[0].name,
      time: "10:00 AM",
      completed: true,
    },
    {
      id: "focus-2",
      taskId: "task-6",
      title: "Fix API integration bug",
      projectName: MOCK_PROJECTS[1].name,
      time: "11:30 AM",
      completed: true,
    },
    {
      id: "focus-3",
      taskId: "task-7",
      title: "Update dashboard charts",
      projectName: MOCK_PROJECTS[0].name,
      time: "02:00 PM",
      completed: false,
    },
    {
      id: "focus-4",
      taskId: "task-8",
      title: "Team stand-up meeting",
      projectName: "General",
      time: "04:00 PM",
      completed: false,
    },
  ],

  recentActivity: [
    {
      id: "activity-1",
      actor: { id: MOCK_USER.id, name: "Ahmed", avatar: "" },
      message: "completed Login Page UI",
      projectName: MOCK_PROJECTS[0].name,
      createdAt: minutesAgo(2),
    },
    {
      id: "activity-2",
      actor: { id: "user-2", name: "Sara", avatar: "" },
      message: "added a comment on Dashboard Analytics",
      projectName: MOCK_PROJECTS[0].name,
      createdAt: minutesAgo(15),
    },
    {
      id: "activity-3",
      actor: { id: MOCK_USER.id, name: MOCK_USER.name, avatar: MOCK_USER.avatar },
      message: "moved Payment Integration",
      projectName: MOCK_PROJECTS[1].name,
      createdAt: hoursAgo(1),
    },
    {
      id: "activity-4",
      actor: { id: "user-3", name: "Omar", avatar: "" },
      message: "created a new task",
      projectName: "Design System",
      createdAt: hoursAgo(2),
    },
    {
      id: "activity-5",
      actor: { id: "user-3", name: "omnia", avatar: "" },
      message: "created a new task",
      projectName: "Design System",
      createdAt: hoursAgo(2),
    },
    {
      id: "activity-6",
      actor: { id: "user-3", name: "yara", avatar: "" },
      message: "created a new task",
      projectName: "Design System",
      createdAt: hoursAgo(2),
    },
  ],

  recentProjects: MOCK_PROJECTS.slice(0, 4).map((project, index) => ({
    id: project.id,
    name: project.name,
    role: index === 0 || index === 1 ? MemberRole.ADMIN : MemberRole.MEMBER,
    progress: Math.round(
      (project.completedTaskCount / Math.max(project.taskCount, 1)) * 100,
    ),
    color: project.color,
  })),
};

function addDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60_000).toISOString();
}