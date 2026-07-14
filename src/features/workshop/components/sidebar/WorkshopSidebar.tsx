import { useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Layers3,
  Link2,
  ListTodo,
  Search,
  StickyNote,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { CanvasObject, SectionFrameData } from "../../types";
import type { DraftChange } from "../../utils/workshopPlan";
import {
  type FeatureTreeGroup,
  useWorkshopSidebar,
} from "../../hooks/useWorkshopSidebar";
import ObjectListItem from "./ObjectListItem";
import StatChip from "./StatChip";

interface WorkshopSidebarProps {
  collapsed: boolean;
  onCollapse: () => void;
  onExpand: () => void;
}

interface FeatureGroupProps {
  group: FeatureTreeGroup;
  selectedObjectId: Nullable<string>;
  getChange: (object: CanvasObject) => DraftChange;
  onSelect: (id: string) => void;
}

function FeatureGroup({
  group,
  selectedObjectId,
  getChange,
  onSelect,
}: FeatureGroupProps) {
  const [open, setOpen] = useState(true);
  const data = group.feature.data as SectionFrameData;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          onClick={() => onSelect(group.feature.id)}
          className={cn(
            "h-9 w-full justify-start gap-2 px-2 text-xs font-medium",
            selectedObjectId === group.feature.id
              ? "bg-primary/10 text-primary hover:bg-primary/15"
              : "hover:bg-accent",
          )}
        >
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 shrink-0 transition-transform",
              !open && "-rotate-90",
            )}
          />
          <Layers3 className="h-3.5 w-3.5 shrink-0 text-violet-500" />
          <span className="min-w-0 flex-1 truncate text-left">{data.title}</span>
          <span className="text-[10px] tabular-nums text-muted-foreground">
            {group.tasks.length}
          </span>
          {group.change !== "UNCHANGED" ? (
            <Badge
              variant={group.change === "ADDED" ? "default" : "secondary"}
              className="h-4 px-1.5 text-[9px]"
            >
              {group.change === "ADDED" ? "New" : "Edited"}
            </Badge>
          ) : null}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-0.5">
        {group.tasks.length > 0 ? (
          group.tasks.map((task) => (
            <ObjectListItem
              key={task.id}
              obj={task}
              isSelected={selectedObjectId === task.id}
              change={getChange(task)}
              onClick={() => onSelect(task.id)}
            />
          ))
        ) : (
          <p className="py-2 pl-8 text-[11px] text-muted-foreground">
            No tasks in this feature
          </p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

function WorkshopSidebar({
  collapsed,
  onCollapse,
  onExpand,
}: WorkshopSidebarProps) {
  const {
    search,
    featureGroups,
    notes,
    selectedObjectId,
    isEditing,
    featureCount,
    taskCount,
    noteCount,
    connectionCount,
    draftSummary,
    getChange,
    setSearch,
    selectObject,
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

  const totalDraftChanges =
    draftSummary.added +
    draftSummary.modified +
    draftSummary.deleted +
    (draftSummary.orderChanged ? 1 : 0);

  return (
    <div className="flex h-full w-full min-w-0 flex-col overflow-hidden border-r border-border bg-card">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              Project plan
            </span>
            <Badge variant={isEditing ? "default" : "secondary"}>
              {isEditing ? "Draft" : "Published"}
            </Badge>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Features become board columns
          </p>
        </div>
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

      <div className="flex items-center gap-2 border-b border-border px-4 pb-3">
        <StatChip
          icon={<Layers3 className="h-3 w-3" />}
          count={featureCount}
          label="Features"
          color="text-violet-500"
        />
        <StatChip
          icon={<StickyNote className="h-3 w-3" />}
          count={noteCount}
          label="Notes"
          color="text-amber-500"
        />
        <StatChip
          icon={<ListTodo className="h-3 w-3" />}
          count={taskCount}
          label="Tasks"
          color="text-primary"
        />
        <StatChip
          icon={<Link2 className="h-3 w-3" />}
          count={connectionCount}
          label="Order"
          color="text-sky-500"
        />
      </div>

      {isEditing && totalDraftChanges > 0 ? (
        <div className="mx-3 mt-3 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-[11px] text-violet-900 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-100">
          <p className="font-semibold">Draft changes</p>
          <p className="mt-0.5 text-violet-700 dark:text-violet-300">
            {draftSummary.added} added · {draftSummary.modified} edited · {draftSummary.deleted} removed
          </p>
          {draftSummary.orderChanged ? (
            <p className="mt-0.5 text-violet-700 dark:text-violet-300">
              Feature order updated
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="px-4 py-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search features, tasks, and notes"
            className="h-8 pl-8 pr-8 text-xs"
          />
          {search ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSearch("")}
              className="absolute right-0.5 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
              aria-label="Clear plan search"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          ) : null}
        </div>
      </div>

      <Separator />

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-0.5 p-2">
          {featureGroups.length === 0 && notes.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              No plan items found
            </p>
          ) : (
            featureGroups.map((group) => (
              <FeatureGroup
                key={group.feature.id}
                group={group}
                selectedObjectId={selectedObjectId}
                getChange={getChange}
                onSelect={selectObject}
              />
            ))
          )}

          {notes.length > 0 ? (
            <div className="mt-3 border-t border-border/70 pt-2">
              <div className="flex items-center gap-2 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <StickyNote className="h-3.5 w-3.5 text-amber-500" />
                Canvas notes
              </div>
              {notes.map((note) => (
                <ObjectListItem
                  key={note.id}
                  obj={note}
                  isSelected={selectedObjectId === note.id}
                  change={getChange(note)}
                  onClick={() => selectObject(note.id)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </ScrollArea>
    </div>
  );
}

export default WorkshopSidebar;
