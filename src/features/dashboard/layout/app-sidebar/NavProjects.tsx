import { Link, useNavigate } from "react-router";
import {
  ChevronRightIcon,
  LayoutDashboardIcon,
  MoreHorizontalIcon,
  PlusIcon,
  Settings2Icon,
  Wand2Icon,
  KanbanIcon,
  StickyNoteIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useProjectStore } from "@/store";
import { ROUTES } from "@/constants";
import { formatInitials } from "@/lib/format/text";
import type { Project } from "@/types";

interface NavProjectsProps {
  projects: Project[];
  isLoading?: boolean;
}

export function NavProjects({ projects, isLoading = false }: NavProjectsProps) {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const setActiveProject = useProjectStore((s) => s.setActiveProject);

  const openProject = (project: Project, to: string) => {
    setActiveProject(project);
    navigate(to);
  };

  if (isLoading) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Projects</SidebarGroupLabel>
        <div className="space-y-1 px-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-8 rounded-md" />
          ))}
        </div>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        Projects
        <SidebarGroupAction
          aria-label="Create project"
          onClick={() => navigate(ROUTES.PROJECT_NEW)}
        >
          <PlusIcon className="size-3.5!" />
        </SidebarGroupAction>
      </SidebarGroupLabel>
      <SidebarMenu className="space-y-0.5">
        {projects.length === 0 && (
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => navigate(ROUTES.PROJECT_NEW)}
              className="text-sidebar-foreground/60 hover:text-sidebar-foreground"
            >
              <PlusIcon />
              <span>Create your first project</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}

        {projects.map((project) => {
          const projectColor = project.color ?? "#2563eb";

          return (
            <Collapsible
              key={project.id}
              asChild
              className="group/project-collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={project.name}>
                    <span
                      className="flex size-4 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white leading-none"
                      style={{ backgroundColor: projectColor }}
                    >
                      {formatInitials(project.name).charAt(0)}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {project.name}
                    </span>
                    <ChevronRightIcon className="ml-auto size-3.5 transition-transform group-data-[state=open]/project-collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction
                      showOnHover
                      className="aria-expanded:bg-sidebar-accent"
                    >
                      <MoreHorizontalIcon />
                      <span className="sr-only">
                        More options for {project.name}
                      </span>
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-48 rounded-lg"
                    side={isMobile ? "bottom" : "right"}
                    align={isMobile ? "end" : "start"}
                  >
                    <DropdownMenuItem
                      onClick={() =>
                        openProject(project, ROUTES.BOARDS(project.id))
                      }
                    >
                      <KanbanIcon className="text-muted-foreground" />
                      <span>Team Board</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        openProject(project, ROUTES.MY_WORKSPACE(project.id))
                      }
                    >
                      <StickyNoteIcon className="text-muted-foreground" />
                      <span>My Workspace</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        openProject(project, ROUTES.WORKSHOP(project.id))
                      }
                    >
                      <Wand2Icon className="text-muted-foreground" />
                      <span>Main Workshop</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        openProject(
                          project,
                          ROUTES.PROJECT_SETTINGS(project.id),
                        )
                      }
                    >
                      <Settings2Icon className="text-muted-foreground" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link
                          to={ROUTES.PROJECT_OVERVIEW(project.id)}
                          onClick={() => setActiveProject(project)}
                        >
                          <LayoutDashboardIcon className="size-3.5" />
                          <span>Overview</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link
                          to={ROUTES.WORKSHOP(project.id)}
                          onClick={() => setActiveProject(project)}
                        >
                          <Wand2Icon className="size-3.5" />
                          <span>Workshop</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link
                          to={ROUTES.BOARDS(project.id)}
                          onClick={() => setActiveProject(project)}
                        >
                          <KanbanIcon className="size-3.5" />
                          <span>Team Board</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link
                          to={ROUTES.MY_WORKSPACE(project.id)}
                          onClick={() => setActiveProject(project)}
                        >
                          <StickyNoteIcon className="size-3.5" />
                          <span>My Workspace</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link
                          to={ROUTES.PROJECT_SETTINGS(project.id)}
                          onClick={() => setActiveProject(project)}
                        >
                          <Settings2Icon className="size-3.5" />
                          <span>Settings</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}

        {projects.length > 0 && (
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => navigate(ROUTES.PROJECT_NEW)}
              className="text-sidebar-foreground/60"
            >
              <PlusIcon />
              <span>New project</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
