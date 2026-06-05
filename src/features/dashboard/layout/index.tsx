import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "./app-sidebar/SiteHeader";
import { AppSidebar } from "./app-sidebar";
import { Outlet } from "react-router";

export const iframeHeight = "800px";

export const description = "A sidebar with a header and a search form.";

export default function DashboardLayout() {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4 bg-red-100">
              <Outlet />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
