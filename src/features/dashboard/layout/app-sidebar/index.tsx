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
import { NavDrafts } from "./NavDrafts";
import { NavProjects } from "./NavProjects";
import { NavSecondary } from "./NavSecondary";
import { NavUser } from "./NavUser";
import { SearchForm } from "./SearchForm";
import { NAV_MAIN, NAV_SECONDARY } from "../../constants/navItems";
import Logo from "@/components/shared/logo/Logo";
import { useProjects } from "@/features/project/hooks";

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const { data: projects = [], isLoading: projectsLoading } = useProjects();

  return (
    <Sidebar
      collapsible="icon"
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]! z-49"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="h-18 justify-center hover:bg-transparent active:bg-transparent group-data-[collapsible=icon]:size-9! group-data-[collapsible=icon]:p-2! group-data-[collapsible=icon]:hover:bg-sidebar-accent group-data-[collapsible=icon]:active:bg-sidebar-accent"
            >
              <Link to="/dashboard">
                <Logo
                  textClassName="text-center text-primary group-data-[collapsible=icon]:hidden"
                  markClassName="flex-none  !size-22 group-data-[collapsible=icon]:!size-9"
                />
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
        <NavDrafts />
        <NavProjects projects={projects} isLoading={projectsLoading} />
        <NavSecondary items={NAV_SECONDARY} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
