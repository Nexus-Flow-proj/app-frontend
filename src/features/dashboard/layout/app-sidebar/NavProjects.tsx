import { Link, useLocation, useNavigate } from "react-router";
import {
  CalendarDaysIcon,
  ChevronRightIcon,
  FolderKanbanIcon,
  KanbanIcon,
  MailCheckIcon,
  MoreHorizontalIcon,
  Settings2Icon,
  ShieldCheckIcon,
  StickyNoteIcon,
  UsersRoundIcon,
  Wand2Icon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SidebarGroup,
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
import { ROUTES } from "@/constants";
import { formatInitials } from "@/lib/format/text";
import { useProjectStore } from "@/store";
import type { ProjectListItem } from "@/features/project/types";
import {
  canChangeMemberRoles,
  canInviteMembers,
  canManageProjectSettings,
  canManageRoles,
  canReadBoard,
  canReadWorkshop,
  canRemoveMembers,
} from "@/features/project/utils/rolePermissions";

interface NavProjectsProps {
  projects: ProjectListItem[];
  isLoading?: boolean;
}

export function NavProjects({ projects, isLoading = false }: NavProjectsProps) {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const setActiveProject = useProjectStore((s) => s.setActiveProject);

  function openProject(project: ProjectListItem, to: string) {
    setActiveProject(project);
    navigate(to);
  }

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
      </SidebarGroupLabel>
      <SidebarMenu className="space-y-0.5">
        {projects.length === 0 && (
          <SidebarMenuItem>
            <SidebarMenuButton
              disabled
              className="text-sidebar-foreground/60 hover:text-sidebar-foreground"
            >
              <FolderKanbanIcon />
              <span>No projects yet</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}

        {projects.map((project) => {
          const projectColor = project.color ?? "#2563eb";
          const currentRole = project.currentMember?.role ?? null;
          const canOpenBoard = currentRole ? canReadBoard(currentRole) : false;
          const canOpenWorkshop = currentRole
            ? canReadWorkshop(currentRole)
            : false;
          const canManageSettings = currentRole
            ? canManageProjectSettings(currentRole)
            : false;
          const canManageMembers = currentRole
            ? canInviteMembers(currentRole) ||
              canRemoveMembers(currentRole) ||
              canChangeMemberRoles(currentRole)
            : false;
          const canManageProjectRoles = currentRole
            ? canManageRoles(currentRole)
            : false;
          const hasSettingsAccess =
            canManageSettings || canManageMembers || canManageProjectRoles;
          const overviewPath = ROUTES.PROJECT_OVERVIEW(project.id);
          const settingsPath = ROUTES.PROJECT_SETTINGS(project.id);
          const invitesPath = ROUTES.PROJECT_INVITES(project.id);
          const rolesPath = ROUTES.PROJECT_ROLES(project.id);
          const isSettingsActive =
            pathname === settingsPath ||
            pathname === invitesPath ||
            pathname === rolesPath;

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
                      className="flex size-4 shrink-0 items-center justify-center rounded text-[10px] font-bold leading-none text-white"
                      style={{ backgroundColor: projectColor }}
                    >
                      {formatInitials(project.name).charAt(0)}
                    </span>
                    <Link
                      to={overviewPath}
                      onClick={() => setActiveProject(project)}
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
                    {canOpenBoard && (
                      <DropdownMenuItem
                        onClick={() =>
                          openProject(project, ROUTES.BOARDS(project.id))
                        }
                      >
                        <KanbanIcon className="text-muted-foreground" />
                        <span>Team Board</span>
                      </DropdownMenuItem>
                    )}
                    {canOpenBoard && (
                      <DropdownMenuItem
                        onClick={() =>
                          openProject(project, ROUTES.CALENDAR(project.id))
                        }
                      >
                        <CalendarDaysIcon className="text-muted-foreground" />
                        <span>Calendar</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() =>
                        openProject(project, ROUTES.MY_WORKSPACE(project.id))
                      }
                    >
                      <StickyNoteIcon className="text-muted-foreground" />
                      <span>My Workspace</span>
                    </DropdownMenuItem>
                    {canOpenWorkshop && (
                      <DropdownMenuItem
                        onClick={() =>
                          openProject(project, ROUTES.WORKSHOP(project.id))
                        }
                      >
                        <Wand2Icon className="text-muted-foreground" />
                        <span>Main Workshop</span>
                      </DropdownMenuItem>
                    )}
                    {hasSettingsAccess && (
                      <>
                        <DropdownMenuSeparator />
                        {canManageMembers && (
                          <DropdownMenuItem
                            onClick={() =>
                              openProject(
                                project,
                                ROUTES.PROJECT_MEMBERS(project.id),
                              )
                            }
                          >
                            <UsersRoundIcon className="text-muted-foreground" />
                            <span>Members</span>
                          </DropdownMenuItem>
                        )}
                        {canManageSettings && (
                          <DropdownMenuItem
                            onClick={() => openProject(project, settingsPath)}
                          >
                            <Settings2Icon className="text-muted-foreground" />
                            <span>Settings</span>
                          </DropdownMenuItem>
                        )}
                        {canManageProjectRoles && (
                          <DropdownMenuItem
                            onClick={() => openProject(project, rolesPath)}
                          >
                            <ShieldCheckIcon className="text-muted-foreground" />
                            <span>Manage roles</span>
                          </DropdownMenuItem>
                        )}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <CollapsibleContent>
                  <SidebarMenuSub>
                    {canOpenWorkshop && (
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname === ROUTES.WORKSHOP(project.id)}
                        >
                          <Link
                            to={ROUTES.WORKSHOP(project.id)}
                            onClick={() => setActiveProject(project)}
                          >
                            <Wand2Icon className="size-3.5" />
                            <span>Workshop</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    )}
                    {canOpenBoard && (
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname === ROUTES.BOARDS(project.id)}
                        >
                          <Link
                            to={ROUTES.BOARDS(project.id)}
                            onClick={() => setActiveProject(project)}
                          >
                            <KanbanIcon className="size-3.5" />
                            <span>Team Board</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    )}
                    {canOpenBoard && (
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname === ROUTES.CALENDAR(project.id)}
                        >
                          <Link
                            to={ROUTES.CALENDAR(project.id)}
                            onClick={() => setActiveProject(project)}
                          >
                            <CalendarDaysIcon className="size-3.5" />
                            <span>Calendar</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    )}
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        asChild
                        isActive={pathname === ROUTES.MY_WORKSPACE(project.id)}
                      >
                        <Link
                          to={ROUTES.MY_WORKSPACE(project.id)}
                          onClick={() => setActiveProject(project)}
                        >
                          <StickyNoteIcon className="size-3.5" />
                          <span>My Workspace</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    {canManageMembers && (
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={
                            pathname === ROUTES.PROJECT_MEMBERS(project.id)
                          }
                        >
                          <Link
                            to={ROUTES.PROJECT_MEMBERS(project.id)}
                            onClick={() => setActiveProject(project)}
                          >
                            <UsersRoundIcon className="size-3.5" />
                            <span>Members</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    )}
                    {hasSettingsAccess && (
                      <Collapsible
                        key={`${project.id}-settings-${isSettingsActive ? "active" : "idle"}`}
                        asChild
                        defaultOpen={isSettingsActive}
                        className="group/settings-collapsible"
                      >
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <div>
                              <Settings2Icon className="size-3.5" />
                              <Link
                                to={settingsPath}
                                onClick={() => setActiveProject(project)}
                                className="min-w-0 flex-1 truncate"
                              >
                                Settings
                              </Link>
                              <CollapsibleTrigger asChild>
                                <Button
                                  type="button"
                                  variant="transparent"
                                  size="icon-xs"
                                  className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-sm text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                  aria-label={`Toggle ${project.name} settings navigation`}
                                >
                                  <ChevronRightIcon className="size-3.5 transition-transform group-data-[state=open]/settings-collapsible:rotate-90" />
                                </Button>
                              </CollapsibleTrigger>
                            </div>
                          </SidebarMenuSubButton>
                          <CollapsibleContent>
                            <SidebarMenuSub className="mx-2 mt-1 gap-0.5 py-0">
                              {canManageSettings && (
                                <SidebarMenuSubItem>
                                  <SidebarMenuSubButton
                                    asChild
                                    size="sm"
                                    isActive={pathname === settingsPath}
                                  >
                                    <Link
                                      to={settingsPath}
                                      onClick={() => setActiveProject(project)}
                                    >
                                      <FolderKanbanIcon className="size-3.5" />
                                      <span>Update details</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              )}
                              {canManageMembers && (
                                <SidebarMenuSubItem>
                                  <SidebarMenuSubButton
                                    asChild
                                    size="sm"
                                    isActive={pathname === invitesPath}
                                  >
                                    <Link
                                      to={invitesPath}
                                      onClick={() => setActiveProject(project)}
                                    >
                                      <MailCheckIcon className="size-3.5" />
                                      <span>Invites</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              )}
                              {canManageProjectRoles && (
                                <SidebarMenuSubItem>
                                  <SidebarMenuSubButton
                                    asChild
                                    size="sm"
                                    isActive={pathname === rolesPath}
                                  >
                                    <Link
                                      to={rolesPath}
                                      onClick={() => setActiveProject(project)}
                                    >
                                      <ShieldCheckIcon className="size-3.5" />
                                      <span>Manage roles</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              )}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuSubItem>
                      </Collapsible>
                    )}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
