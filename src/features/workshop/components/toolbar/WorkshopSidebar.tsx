// ============================================================
// features/workshop/components/toolbar/WorkshopSidebar.tsx
//
// Left collapsible panel showing:
//  - Object list (searchable, filterable by type + status)
//  - Click to select + pan-to object on canvas
//  - Canvas stats (object count by type)
// ============================================================

import { useState } from "react";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  StickyNote,
  Frame,
  SquareDashedMousePointer,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { useWorkshopStore } from "../../store/workshopStore";
import { STATUS_CONFIG } from "../../constants";
import { CanvasObjectType } from "@/types/enums";
import type {
  CanvasObject,
  SectionFrameData,
  StickyNoteData,
  TaskCardData,
} from "../../types";

export function WorkshopSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const objects = useWorkshopStore((s) => s.objects);
  const selectObject = useWorkshopStore((s) => s.selectObject);
  const selectedObjectId = useWorkshopStore((s) => s.selectedObjectId);

  // ── Filter objects ────────────────────────────────────────
  const filtered = objects.filter((obj) => {
    if (typeFilter !== "ALL" && obj.type !== typeFilter) return false;
    if (statusFilter !== "ALL" && obj.type === CanvasObjectType.TASK_CARD) {
      const d = obj.data as TaskCardData;
      if (d.status !== statusFilter) return false;
    }
    if (search) {
      const s = search.toLowerCase();
      const title =
        obj.type === CanvasObjectType.TASK_CARD
          ? (obj.data as TaskCardData).title
          : obj.type === CanvasObjectType.SECTION_FRAME
            ? (obj.data as SectionFrameData).title
            : ((obj.data as StickyNoteData).content ?? "");
      if (!title.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  // ── Stats ─────────────────────────────────────────────────
  const taskCount = objects.filter(
    (o) => o.type === CanvasObjectType.TASK_CARD,
  ).length;
  const stickyCount = objects.filter(
    (o) => o.type === CanvasObjectType.STICKY_NOTE,
  ).length;
  const frameCount = objects.filter(
    (o) => o.type === CanvasObjectType.SECTION_FRAME,
  ).length;

  if (collapsed) {
    return (
      <div className="flex w-8 flex-col items-center border-r border-border bg-card py-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground"
          onClick={() => setCollapsed(false)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-64 flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-semibold text-foreground">Canvas</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground"
          onClick={() => setCollapsed(true)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats row */}
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

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search objects…"
            className="h-8 pl-8 pr-7 text-xs"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
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
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-7 flex-1 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All status</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Object list */}
      <ScrollArea className="flex-1">
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
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────

function StatChip({
  icon,
  count,
  label,
  color,
}: {
  icon: React.ReactNode;
  count: number;
  label: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className={cn(
          "flex items-center gap-1 text-[11px] font-semibold",
          color,
        )}
      >
        {icon} {count}
      </span>
      <span className="text-[9px] text-muted-foreground">{label}</span>
    </div>
  );
}

function ObjectListItem({
  obj,
  isSelected,
  onClick,
}: {
  obj: CanvasObject;
  isSelected: boolean;
  onClick: () => void;
}) {
  const getTitle = (): string => {
    if (obj.type === CanvasObjectType.TASK_CARD)
      return (obj.data as TaskCardData).title;
    if (obj.type === CanvasObjectType.SECTION_FRAME)
      return (obj.data as SectionFrameData).title;
    return (obj.data as StickyNoteData).content?.slice(0, 40) ?? "Sticky note";
  };

  const getIcon = () => {
    if (obj.type === CanvasObjectType.TASK_CARD)
      return (
        <SquareDashedMousePointer className="h-3.5 w-3.5 shrink-0 text-primary" />
      );
    if (obj.type === CanvasObjectType.STICKY_NOTE)
      return <StickyNote className="h-3.5 w-3.5 shrink-0 text-amber-500" />;
    return <Frame className="h-3.5 w-3.5 shrink-0 text-blue-500" />;
  };

  const getStatus = () => {
    if (obj.type !== CanvasObjectType.TASK_CARD) return null;
    const d = obj.data as TaskCardData;
    const cfg = STATUS_CONFIG[d.status];
    return cfg ? (
      <span className="ml-auto text-[10px]" style={{ color: cfg.text }}>
        {cfg.label}
      </span>
    ) : null;
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
        isSelected
          ? "bg-primary/10 text-primary"
          : "text-foreground hover:bg-accent",
      )}
    >
      {getIcon()}
      <span className="flex-1 truncate">{getTitle()}</span>
      {getStatus()}
    </button>
  );
}
