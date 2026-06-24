import type { ComponentProps } from "react";
import { Link } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMain } from "./NavMain";
import { NavProjects } from "./NavProjects";
import { NavSecondary } from "./NavSecondary";
import { NavUser } from "./NavUser";
import { SearchForm } from "./SearchForm";
import { MOCK_PROJECTS } from "../../mock";
import { NAV_MAIN, NAV_SECONDARY } from "../../constants/navItems";
import Logo from "@/components/shared/Logo";

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
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
                <Logo />
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
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
