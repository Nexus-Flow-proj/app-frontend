import type { ComponentProps } from "react";
import { Link } from "react-router";
import {
  LayoutDashboardIcon,
  LifeBuoyIcon,
  SendIcon,
  LayersIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/store";
import { UserRole } from "@/types/enums";
import { NavMain, type NavMainItem } from "./NavMain";
import { NavProjects } from "./NavProjects";
import { NavSecondary, type NavSecondaryItem } from "./NavSecondary";
import { NavUser } from "./NavUser";
import { SearchForm } from "./SearchForm";
import { MOCK_PROJECTS, MOCK_USER } from "../../mock";

// Static navigation items
const NAV_MAIN: NavMainItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <LayoutDashboardIcon />,
  },
];

const NAV_SECONDARY: NavSecondaryItem[] = [
  {
    title: "Support",
    url: "#",
    icon: <LifeBuoyIcon />,
  },
  {
    title: "Feedback",
    url: "#",
    icon: <SendIcon />,
  },
];

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((s) => s.user) ?? MOCK_USER;
  const logout = useAuthStore((s) => s.logout);

  const projects = MOCK_PROJECTS;
  const projectsLoading = false;

  return (
    <Sidebar
      collapsible="icon"
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-500/40">
                  <LayersIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold tracking-tight">
                    Nexus<span className="text-indigo-500">-Flow</span>
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.role === UserRole.ADMIN ? "Admin" : "Team Member"}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="md:hidden group-data-[collapsible=icon]:hidden">
          <SearchForm />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={NAV_MAIN} label="Navigation" />
        <NavProjects projects={projects} isLoading={projectsLoading} />
        <NavSecondary items={NAV_SECONDARY} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} onLogout={logout} />
      </SidebarFooter>
    </Sidebar>
  );
}
