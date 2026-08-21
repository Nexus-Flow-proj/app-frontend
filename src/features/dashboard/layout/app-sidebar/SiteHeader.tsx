import { useLocation, useParams } from "react-router";
import { PanelLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
// import { SearchForm } from "./SearchForm";
import { buildBreadcrumbs } from "../../utils/buildBreadcrumbs";
import DarkModeToggle from "@/components/shared/ModeToggle";
import { Separator } from "@/components/ui/separator";
import MyBreadcrumb from "@/components/shared/MyBreadcrumb";
import { NotificationCenter } from "@/features/notifications/components/NotificationCenter";
import { useProject } from "@/features/project/hooks";

export function SiteHeader() {
  const { pathname } = useLocation();
  const { id: projectId } = useParams();
  const { toggleSidebar, state } = useSidebar();
  const routeProjectId = pathname.startsWith("/projects/")
    ? projectId
    : undefined;
  const { data: project } = useProject(routeProjectId);

  const isSidebarOpen = state === "expanded";
  const breadcrumbs = buildBreadcrumbs(pathname, {
    projectId: routeProjectId,
    projectName: project?.name,
  });

  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b bg-sidebar">
      <div
        className={`flex h-(--header-height) w-full items-center px-4 ${isSidebarOpen ? "gap-2" : "gap-1"}`}
      >
        <Button
          variant={"link"}
          size="icon-sm"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className={`text-foreground ${!isSidebarOpen && "pr-2"}`}
        >
          <PanelLeftIcon />
        </Button>

        <Separator
          orientation="vertical"
          className="mr-2.5 h-full -translate-x-px"
        />
        <MyBreadcrumb breadcrumbs={breadcrumbs} />
        <div className="ml-auto flex items-center gap-2">
          {/* <SearchForm className="hidden md:block w-56" /> */}
          <NotificationCenter />
          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
}
