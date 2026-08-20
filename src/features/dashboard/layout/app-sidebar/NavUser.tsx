import {
  BadgeCheckIcon,
  BellIcon,
  ChevronsUpDownIcon,
  CreditCardIcon,
  LogOutIcon,
  SparklesIcon,
  ZapIcon,
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
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";
import NavUserInfo from "./NavUserInfo";
import { useNavigate } from "react-router";
import { ROUTES } from "@/constants";
import { useLogout } from "@/features/auth/hooks";
import { useMyProfile } from "@/features/profile/hooks";
import { useMySubscription } from "@/features/subscriptions/hooks";
import { PlanBadge } from "@/features/subscriptions/components";

export function NavUser() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useMyProfile();
  const { data: subscription } = useMySubscription();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const planTier = subscription?.plan?.tier ?? "FREE";
  const isFree = planTier === "FREE";

  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <Skeleton className="size-8 rounded-lg" />
            <span className="grid flex-1 gap-1">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-3 w-32 rounded" />
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const firstName = profile?.firstName ?? user.firstName;
  const lastName = profile?.lastName ?? user.lastName;
  const name = `${firstName} ${lastName}`.trim();
  const email = profile?.email ?? user.email;
  const avatarUrl = profile?.avatarUrl ?? user.avatarUrl ?? user.avatar;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="bg-sidebar-accent hover:bg-background/30 hover:cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <NavUserInfo
                avatarUrl={avatarUrl ?? undefined}
                email={email}
                name={name}
              />
              <ChevronsUpDownIcon />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="bg-sidebar-accent border-sidebar-accent-foreground text-sidebar-accent-foreground min-w-56">
            <DropdownMenuLabel>
              <div className="flex items-center justify-between gap-2 text-left text-sm">
                <NavUserInfo
                  avatarUrl={avatarUrl ?? undefined}
                  email={email}
                  name={name}
                />
                <PlanBadge tier={planTier} size="sm" />
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              {isFree ? (
                <DropdownMenuItem
                  onClick={() => navigate(ROUTES.PRICING)}
                  className="cursor-pointer font-medium text-purple-600 dark:text-purple-400"
                >
                  <SparklesIcon className="text-purple-600 dark:text-purple-400" />
                  Upgrade to Pro
                </DropdownMenuItem>
              ) : planTier === "PRO" ? (
                <DropdownMenuItem
                  onClick={() => navigate(ROUTES.PRICING)}
                  className="cursor-pointer font-medium text-amber-600 dark:text-amber-400"
                >
                  <ZapIcon className="text-amber-600 dark:text-amber-400" />
                  Upgrade to Business
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => navigate(ROUTES.PRICING)}
                  className="cursor-pointer"
                >
                  <SparklesIcon />
                  Plan Details
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate(ROUTES.PROFILE)}>
                <BadgeCheckIcon />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(ROUTES.BILLING)}>
                <CreditCardIcon />
                Subscription & Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellIcon />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => logout()}
              disabled={isLoggingOut}
              variant="destructive"
            >
              <LogOutIcon />
              {isLoggingOut ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
