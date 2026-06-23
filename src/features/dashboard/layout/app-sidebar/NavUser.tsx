import {
  BadgeCheckIcon,
  BellIcon,
  ChevronsUpDownIcon,
  LogOutIcon,
  SparklesIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/authStore";
import { MOCK_USER } from "../../mock";
import NavUserInfo from "./NavUserInfo";

export function NavUser() {
  const user = useAuthStore((s) => s.user) ?? MOCK_USER;
  const logout = useAuthStore((s) => s.logout);

  const plan: string = "Free"; // Replace with actual plan logic if available

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <NavUserInfo
                avatarUrl={user.avatar}
                email={user.email}
                name={`${user.firstName} ${user.lastName}`}
              />
              <ChevronsUpDownIcon />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="bg-sidebar-accent border-sidebar-accent-foreground text-sidebar-accent-foreground ">
            <DropdownMenuLabel>
              <div className="flex items-center gap-2 text-left text-sm">
                <NavUserInfo
                  avatarUrl={user.avatar}
                  email={user.email}
                  name={`${user.firstName} ${user.lastName}`}
                />
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem disabled={plan !== "Free"}>
                <SparklesIcon />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheckIcon />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellIcon />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={logout} variant="destructive">
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
