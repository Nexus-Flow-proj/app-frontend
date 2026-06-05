import { type ComponentPropsWithoutRef, type ReactNode } from "react";
import { NavLink } from "react-router";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export interface NavSecondaryItem {
  title: string;
  url: string;
  icon: ReactNode;
}

interface NavSecondaryProps extends ComponentPropsWithoutRef<
  typeof SidebarGroup
> {
  items: NavSecondaryItem[];
}

export function NavSecondary({ items, ...props }: NavSecondaryProps) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild size="sm">
                <NavLink
                  to={item.url}
                  className={({ isActive }) =>
                    isActive
                      ? "text-sidebar-accent-foreground bg-sidebar-accent"
                      : ""
                  }
                >
                  {item.icon}
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
