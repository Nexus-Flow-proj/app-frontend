import { NavLink, useLocation } from "react-router";
import { ChevronRightIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import type { NavMainItem } from "../../types/appSidebar";

interface NavMainProps {
  items: NavMainItem[];
  label: string;
}

export function NavMain({ items, label }: NavMainProps) {
  const { pathname } = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasSubItems = Boolean(item.items?.length);
          const isGroupActive =
            item.url === pathname ||
            item.items?.some((subItem) => subItem.url === pathname);

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isGroupActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={!hasSubItems && isGroupActive}
                  asChild
                  tooltip={item.title}
                >
                  {hasSubItems ? (
                    <CollapsibleTrigger>
                      <item.icon />
                      <span className="truncate">{item.title}</span>
                      <ChevronRightIcon className="ml-auto size-3.5 shrink-0 text-sidebar-foreground/50 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      <span className="sr-only">Toggle {item.title}</span>
                    </CollapsibleTrigger>
                  ) : (
                    <NavLink to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  )}
                </SidebarMenuButton>

                {hasSubItems && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => {
                        const isSubItemActive = subItem.url === pathname;
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              isActive={isSubItemActive}
                              asChild
                            >
                              <NavLink to={subItem.url}>
                                <span>{subItem.title}</span>
                              </NavLink>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
