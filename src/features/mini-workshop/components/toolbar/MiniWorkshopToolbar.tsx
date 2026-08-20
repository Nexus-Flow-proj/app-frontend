import {
  BringToFront, Circle, Diamond, Eraser, Frame, Hand, ImagePlus, LayoutTemplate,
  MousePointer2, PenLine, Redo2, Search, Square, StickyNote, Type, Undo2,
  Workflow, Squircle, Triangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { MiniShapeKind, MiniTool } from "../../types";

interface MiniWorkshopToolbarProps {
  tool: MiniTool;
  activeShape: MiniShapeKind;
  canUndo: boolean;
  canRedo: boolean;
  onTool: (tool: MiniTool) => void;
  onShape: (shape: MiniShapeKind) => void;
  onTemplates: () => void;
  onImage: () => void;
  onSearch: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

const tools: Array<{ tool: MiniTool; label: string; shortcut: string; icon: typeof MousePointer2 }> = [
  { tool: "select", label: "Select", shortcut: "V", icon: MousePointer2 },
  { tool: "pan", label: "Pan", shortcut: "H", icon: Hand },
  { tool: "freehand", label: "Freehand", shortcut: "P", icon: PenLine },
  { tool: "eraser", label: "Erase stroke", shortcut: "E", icon: Eraser },
  { tool: "connector", label: "Connector", shortcut: "C", icon: Workflow },
  { tool: "text", label: "Text", shortcut: "T", icon: Type },
  { tool: "sticky", label: "Sticky note", shortcut: "N", icon: StickyNote },
  { tool: "frame", label: "Frame", shortcut: "F", icon: Frame },
  { tool: "task", label: "Task", shortcut: "K", icon: BringToFront },
];

const shapeIcons: Record<MiniShapeKind, typeof Square> = {
  rectangle: Square,
  "rounded-rectangle": Squircle,
  ellipse: Circle,
  diamond: Diamond,
  triangle: Triangle,
};

function ToolButton({ active, disabled, label, shortcut, icon: Icon, onClick }: { active?: boolean; disabled?: boolean; label: string; shortcut?: string; icon: typeof MousePointer2; onClick: () => void }) {
  return <Tooltip><TooltipTrigger asChild><Button type="button" size="icon" disabled={disabled} variant={active ? "default" : "ghost"} className={active ? "bg-violet-600 text-white hover:bg-violet-600" : "text-muted-foreground"} aria-label={label} onClick={onClick}><Icon className="size-4" /></Button></TooltipTrigger><TooltipContent>{label}{shortcut ? ` · ${shortcut}` : ""}</TooltipContent></Tooltip>;
}

export function MiniWorkshopToolbar(props: MiniWorkshopToolbarProps) {
  const ActiveShapeIcon = shapeIcons[props.activeShape];

  return <div className="absolute bottom-5 left-1/2 z-20 flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-2xl border border-violet-500/20 bg-background/95 p-1.5 shadow-2xl shadow-violet-950/10 [scrollbar-width:none] backdrop-blur [&::-webkit-scrollbar]:hidden">
    {tools.slice(0, 4).map(({ tool, label, shortcut, icon }) => <ToolButton key={tool} active={props.tool === tool} label={label} shortcut={shortcut} icon={icon} onClick={() => props.onTool(tool)} />)}
    <DropdownMenu><Tooltip><TooltipTrigger asChild><DropdownMenuTrigger asChild><Button type="button" size="icon" variant={props.tool === "shape" ? "default" : "ghost"} aria-label="Shapes"><ActiveShapeIcon className="size-4" /></Button></DropdownMenuTrigger></TooltipTrigger><TooltipContent>Shapes · S</TooltipContent></Tooltip><DropdownMenuContent align="center">
      <DropdownMenuItem onSelect={() => props.onShape("rectangle")}><Square />Rectangle</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => props.onShape("rounded-rectangle")}><Squircle />Rounded rectangle</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => props.onShape("ellipse")}><Circle />Ellipse</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => props.onShape("diamond")}><Diamond />Diamond</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => props.onShape("triangle")}><Triangle />Triangle</DropdownMenuItem>
    </DropdownMenuContent></DropdownMenu>
    {tools.slice(4).map(({ tool, label, shortcut, icon }) => <ToolButton key={tool} active={props.tool === tool} label={label} shortcut={shortcut} icon={icon} onClick={() => props.onTool(tool)} />)}
    <ToolButton label="Image" shortcut="I" icon={ImagePlus} onClick={props.onImage} />
    <ToolButton label="Templates" icon={LayoutTemplate} onClick={props.onTemplates} />
    <ToolButton label="Search canvas" shortcut="Ctrl K" icon={Search} onClick={props.onSearch} />
    <Separator orientation="vertical" className="mx-1 h-7" />
    <ToolButton label="Undo" shortcut="Ctrl Z" icon={Undo2} disabled={!props.canUndo} onClick={props.onUndo} />
    <ToolButton label="Redo" shortcut="Ctrl Shift Z" icon={Redo2} disabled={!props.canRedo} onClick={props.onRedo} />
  </div>;
}
