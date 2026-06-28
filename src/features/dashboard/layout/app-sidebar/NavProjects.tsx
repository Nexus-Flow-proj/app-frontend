import { Link, useNavigate } from "react-router";
import {
  ChevronRightIcon,
  MoreHorizontalIcon,
  PlusIcon,
  Settings2Icon,
  Wand2Icon,
  KanbanIcon,
  StickyNoteIcon,
  UsersRoundIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
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
import { useAuthStore } from "@/store";
import { UserRole } from "@/types/enums";
import { ROUTES } from "@/constants";
import { formatInitials } from "@/lib/format/text";
import type { ProjectListItem } from "@/features/project/types";

interface NavProjectsProps {
  projects: ProjectListItem[];
  isLoading?: boolean;
}

export function NavProjects({ projects, isLoading = false }: NavProjectsProps) {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAppAdmin = user?.role === UserRole.ADMIN;

  if (isLoading) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Projects</SidebarGroupLabel>
        <div className="px-2 space-y-1">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-8 rounded-md bg-sidebar-accent/40 animate-pulse"
            />
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
          const canManageProject =
            isAppAdmin || (!!project.adminId && project.adminId === user?.id);

          return (
            <Collapsible
              key={project.id}
              asChild
              className="group/project-collapsible"
            >
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={project.name}>
                  <div>
                    <span
                      className="flex size-4 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white leading-none"
                      style={{ backgroundColor: projectColor }}
                    >
                      {formatInitials(project.name).charAt(0)}
                    </span>
                    <Link
                      to={ROUTES.PROJECT_OVERVIEW(project.id)}
                      className="min-w-0 flex-1 truncate"
                    >
                      {project.name}
                    </Link>
                    <CollapsibleTrigger asChild>
                      <Button
                        type="button"
                        variant="transparent"
                        size="icon-xs"
                        className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-sm text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        aria-label={`Toggle ${project.name} navigation`}
                      >
                        <ChevronRightIcon className="size-3.5 transition-transform group-data-[state=open]/project-collapsible:rotate-90" />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </SidebarMenuButton>

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
                      onClick={() => navigate(ROUTES.BOARDS(project.id))}
                    >
                      <KanbanIcon className="text-muted-foreground" />
                      <span>Team Board</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate(ROUTES.MY_WORKSPACE(project.id))}
                    >
                      <StickyNoteIcon className="text-muted-foreground" />
                      <span>My Workspace</span>
                    </DropdownMenuItem>
                    {canManageProject && (
                      <>
                        <DropdownMenuItem
                          onClick={() => navigate(ROUTES.WORKSHOP(project.id))}
                        >
                          <Wand2Icon className="text-muted-foreground" />
                          <span>Main Workshop</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(ROUTES.PROJECT_MEMBERS(project.id))
                          }
                        >
                          <UsersRoundIcon className="text-muted-foreground" />
                          <span>Members</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(ROUTES.PROJECT_SETTINGS(project.id))
                          }
                        >
                          <Settings2Icon className="text-muted-foreground" />
                          <span>Settings</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    {!canManageProject && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(ROUTES.PROJECT_MEMBERS(project.id))
                          }
                        >
                          <UsersRoundIcon className="text-muted-foreground" />
                          <span>Members</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(ROUTES.PROJECT_SETTINGS(project.id))
                          }
                        >
                          <Settings2Icon className="text-muted-foreground" />
                          <span>Settings</span>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <CollapsibleContent>
                  <SidebarMenuSub>
                    {canManageProject && (
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <button
                            onClick={() =>
                              navigate(ROUTES.WORKSHOP(project.id))
                            }
                            className="w-full text-left"
                          >
                            <Wand2Icon className="size-3.5" />
                            <span>Workshop</span>
                          </button>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    )}
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <button
                          onClick={() => navigate(ROUTES.BOARDS(project.id))}
                          className="w-full text-left"
                        >
                          <KanbanIcon className="size-3.5" />
                          <span>Team Board</span>
                        </button>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <button
                          onClick={() =>
                            navigate(ROUTES.MY_WORKSPACE(project.id))
                          }
                          className="w-full text-left"
                        >
                          <StickyNoteIcon className="size-3.5" />
                          <span>My Workspace</span>
                        </button>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <button
                          onClick={() =>
                            navigate(ROUTES.PROJECT_MEMBERS(project.id))
                          }
                          className="w-full text-left"
                        >
                          <UsersRoundIcon className="size-3.5" />
                          <span>Members</span>
                        </button>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <button
                          onClick={() =>
                            navigate(ROUTES.PROJECT_SETTINGS(project.id))
                          }
                          className="w-full text-left"
                        >
                          <Settings2Icon className="size-3.5" />
                          <span>Settings</span>
                        </button>
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
