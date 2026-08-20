import { LayoutDashboardIcon, LifeBuoyIcon, SendIcon } from "lucide-react";
import type { NavSecondaryItem } from "../layout/app-sidebar/NavSecondary";
import type { NavMainItem } from "../types/appSidebar";

export const NAV_MAIN: NavMainItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboardIcon,
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
