import { useNavigate } from "react-router";
import { FilePenLineIcon, PlusIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ROUTES } from "@/constants";
import { useDrafts } from "@/features/drafts/hooks";
import { formatInitials } from "@/lib/format/text";

export function NavDrafts() {
  const navigate = useNavigate();
  const { data: drafts = [], isLoading } = useDrafts();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        Drafts
        <SidebarGroupAction
          aria-label="Create draft"
          onClick={() => navigate(ROUTES.DRAFT_NEW)}
        >
          <PlusIcon className="size-3.5! cursor-pointer" />
        </SidebarGroupAction>
      </SidebarGroupLabel>

      {isLoading && (
        <div className="space-y-1 px-2">
          {[1, 2].map((item) => (
            <Skeleton key={item} className="h-8 rounded-md" />
          ))}
        </div>
      )}

      <SidebarMenu className="space-y-0.5">
        {!isLoading && drafts.length === 0 && (
          <SidebarMenuItem>
            <SidebarMenuButton
              disabled
              className="text-sidebar-foreground/60 hover:text-sidebar-foreground"
            >
              <FilePenLineIcon />
              <span>No drafts yet</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}

        {drafts.map((draft) => {
          const name = draft.projectInfo.name || "Untitled draft";
          const color = draft.projectInfo.color || "#2563eb";

          return (
            <SidebarMenuItem key={draft.id}>
              <SidebarMenuButton
                onClick={() => navigate(ROUTES.DRAFT_DETAIL(draft.id))}
                className="text-sidebar-foreground/70 hover:text-sidebar-foreground cursor-pointer"
                tooltip={name}
              >
                <span
                  className="flex size-4 shrink-0 items-center justify-center rounded text-[10px] font-bold leading-none text-white"
                  style={{ backgroundColor: color }}
                >
                  {formatInitials(name).charAt(0)}
                </span>
                <span className="truncate">{name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}

        {!isLoading && drafts.length > 0 && (
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => navigate(ROUTES.DRAFT_NEW)}
              className="text-sidebar-foreground/70 hover:text-sidebar-foreground cursor-pointer"
            >
              <FilePenLineIcon />
              <span>Create draft</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
