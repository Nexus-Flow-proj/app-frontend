import {
  KanbanIcon,
  LayoutDashboardIcon,
  LifeBuoyIcon,
  SendIcon,
  Settings2Icon,
} from "lucide-react";
import type { NavSecondaryItem } from "../layout/app-sidebar/NavSecondary";
import type { NavMainItem } from "../types/appSidebar";

export const NAV_MAIN: NavMainItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Projects",
    url: "/projects",
    icon: KanbanIcon,
    items: [
      {
        title: "New project",
        url: "/projects/new",
      },
      {
        title: "Team board",
        url: "/projects/demo/boards",
      },
      {
        title: "Project settings",
        url: "/projects/demo/settings",
      },
    ],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings2Icon,
  },
];

export const NAV_SECONDARY: NavSecondaryItem[] = [
  {
    title: "Support",
    url: "#",
    icon: LifeBuoyIcon,
  },
  {
    title: "Feedback",
    url: "#",
    icon: SendIcon,
  },
];
