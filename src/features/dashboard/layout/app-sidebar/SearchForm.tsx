import type { ComponentProps } from "react";
import { SearchIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { SidebarInput } from "@/components/ui/sidebar";

export function SearchForm({ ...props }: ComponentProps<"form">) {
  return (
    <form {...props}>
      <div className="relative">
        <Label htmlFor="sidebar-search" className="sr-only">
          Search
        </Label>
        <SidebarInput
          id="sidebar-search"
          placeholder="Search projects, tasks..."
          className="h-8 pl-7"
        />
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 select-none opacity-50" />
      </div>
    </form>
  );
}
