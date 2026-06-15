import { Link, useLocation } from "react-router";
import { PanelLeftIcon, BellIcon, PlusIcon } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { SearchForm } from "./SearchForm";
import { ROUTES } from "@/constants";
import { useUnreadCount } from "@/hooks/useNotifications";
import { buildBreadcrumbs } from "../../utils/buildBreadcrumbs";
import DarkModeToggle from "@/components/shared/ModeToggle";

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const { pathname } = useLocation();
  const { data: notifData } = useUnreadCount();
  const unread = notifData?.count ?? 0;

  const breadcrumbs = buildBreadcrumbs(pathname);

  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b bg-background">
      <div
        className="flex h-(--header-height) w-full items-center gap-2 px-4"
        // style={{ "--header-height": "3.5rem" } as CSSProperties}
      >
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <PanelLeftIcon />
        </Button>
        {/* <Separator orientation="vertical" className="mr-2 h-full" /> */}

        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <span key={idx} className="flex items-center gap-1.5">
                  <BreadcrumbItem>
                    {isLast || !crumb.href ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={crumb.href}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </span>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex items-center gap-2">
          <SearchForm className="hidden md:block w-56" />

          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex gap-1.5"
            asChild
          >
            <Link to={ROUTES.PROJECT_NEW}>
              <PlusIcon className="size-3.5" />
              New project
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative h-8 w-8"
            aria-label="Notifications"
          >
            <BellIcon className="size-4" />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 flex size-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Button>

          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
}
