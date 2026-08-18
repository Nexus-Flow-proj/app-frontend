import {
  ChevronLeft,
  ChevronRight,
  Frame,
  Search,
  SquareDashedMousePointer,
  StickyNote,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CanvasObjectType } from "@/types/enums";
import { STATUS_CONFIG } from "../../constants";
import { useWorkshopSidebar } from "../../hooks/useWorkshopSidebar";
import ObjectListItem from "./ObjectListItem";
import StatChip from "./StatChip";

interface WorkshopSidebarProps {
  collapsed: boolean;
  onCollapse: () => void;
  onExpand: () => void;
}

function WorkshopSidebar({
  collapsed,
  onCollapse,
  onExpand,
}: WorkshopSidebarProps) {
  const {
    search,
    typeFilter,
    statusFilter,
    filtered,
    selectedObjectId,
    taskCount,
    stickyCount,
    frameCount,
    setSearch,
    setTypeFilter,
    setStatusFilter,
    selectObject,
    openObjectDetails,
  } = useWorkshopSidebar();

  if (collapsed) {
    return (
      <div className="flex h-full w-full flex-col items-center border-r border-sidebar-border bg-sidebar py-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground"
          onClick={onExpand}
          aria-label="Expand workshop sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden w-full min-w-0 flex-col border-r border-border bg-card">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-semibold text-foreground">Canvas</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground"
          onClick={onCollapse}
          aria-label="Collapse workshop sidebar"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-3 border-b border-border px-4 pb-3">
        <StatChip
          icon={<SquareDashedMousePointer className="h-3 w-3" />}
          count={taskCount}
          label="Tasks"
          color="text-primary"
        />
        <StatChip
          icon={<StickyNote className="h-3 w-3" />}
          count={stickyCount}
          label="Notes"
          color="text-amber-500"
        />
        <StatChip
          icon={<Frame className="h-3 w-3" />}
          count={frameCount}
          label="Frames"
          color="text-blue-500"
        />
      </div>

      <div className="px-4 py-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search objects..."
            className="h-8 pl-8 pr-7 text-xs"
          />
          {search && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSearch("")}
              className="absolute right-0.5 top-1/2 size-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-2 px-4 pb-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-7 flex-1 text-xs">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All types</SelectItem>
            <SelectItem value={CanvasObjectType.TASK_CARD}>
              Task cards
            </SelectItem>
            <SelectItem value={CanvasObjectType.STICKY_NOTE}>
              Sticky notes
            </SelectItem>
            <SelectItem value={CanvasObjectType.SECTION_FRAME}>
              Sections
            </SelectItem>
            <SelectItem value={CanvasObjectType.TEXT_BOX}>
              Text boxes
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-7 flex-1 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All status</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <ScrollArea className="h-full flex-1 min-h-0">
        <div className="flex flex-col gap-0.5 p-2">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              No objects found
            </p>
          ) : (
            filtered.map((obj) => (
              <ObjectListItem
                key={obj.id}
                obj={obj}
                isSelected={selectedObjectId === obj.id}
                onClick={() => selectObject(obj.id)}
                onDoubleClick={() => openObjectDetails(obj.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default WorkshopSidebar;
