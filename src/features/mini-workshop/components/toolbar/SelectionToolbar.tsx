import { useMemo } from "react";
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignLeft,
  ArrowDownToLine,
  ArrowUpToLine,
  Bold,
  CircleDashed,
  Copy,
  Group,
  Lock,
  Route,
  Trash2,
  Type,
  Ungroup,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useMiniWorkshopStore } from "../../store/miniWorkshopStore";
import type { ConnectorRouting, MiniCanvasObject } from "../../types";

const FILLS = [
  { color: "#ffffff", className: "bg-white" },
  { color: "#ede9fe", className: "bg-violet-100" },
  { color: "#dbeafe", className: "bg-blue-100" },
  { color: "#dcfce7", className: "bg-green-100" },
  { color: "#fef3c7", className: "bg-amber-100" },
  { color: "#ffe4e6", className: "bg-rose-100" },
] as const;

const STROKES = [
  { color: "#64748b", className: "border-slate-500" },
  { color: "#8b5cf6", className: "border-violet-500" },
  { color: "#2563eb", className: "border-blue-600" },
  { color: "#16a34a", className: "border-green-600" },
  { color: "transparent", className: "border-transparent" },
] as const;

const FILL_CLASS_BY_COLOR: Record<string, string> = {
  "#ffffff": "bg-white",
  "#ede9fe": "bg-violet-100",
  "#dbeafe": "bg-blue-100",
  "#dcfce7": "bg-green-100",
  "#fef3c7": "bg-amber-100",
  "#ffe4e6": "bg-rose-100",
  transparent:
    "bg-[linear-gradient(135deg,transparent_42%,#94a3b8_43%,#94a3b8_57%,transparent_58%)]",
  "rgba(139, 92, 246, 0.04)": "bg-violet-100/50",
};

const STROKE_CLASS_BY_COLOR: Record<string, string> = {
  "#64748b": "border-slate-500",
  "#8b5cf6": "border-violet-500",
  "#2563eb": "border-blue-600",
  "#16a34a": "border-green-600",
  "#94a3b8": "border-slate-400",
  "#f59e0b": "border-amber-500",
  "#c4b5fd": "border-violet-300",
  "#cbd5e1": "border-slate-300",
  "#334155": "border-slate-700",
  transparent: "border-transparent",
};

function sharedValue<T>(values: T[]): T | null {
  return values.length && values.every((value) => value === values[0])
    ? values[0]
    : null;
}

function sharedDash(objects: MiniCanvasObject[]) {
  const values = objects.map((object) =>
    object.style.dash?.length ? "dashed" : "solid",
  );
  return sharedValue(values);
}

function Action({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: typeof Copy;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-8"
          aria-label={label}
          onClick={onClick}
        >
          <Icon className="size-3.5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

interface ColorPickerProps {
  label: "Fill" | "Stroke";
  value: string | null;
  onValueChange: (color: string) => void;
}

function ColorPicker({ label, value, onValueChange }: ColorPickerProps) {
  const isFill = label === "Fill";
  const options = isFill ? FILLS : STROKES;
  const fallback = isFill ? "#ffffff" : "#64748b";
  const activeValue = value ?? fallback;
  const swatchClass = isFill
    ? (FILL_CLASS_BY_COLOR[activeValue] ?? "bg-slate-200")
    : (STROKE_CLASS_BY_COLOR[activeValue] ?? "border-slate-400");
  const displayValue = value ?? "Mixed";

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-8"
              aria-label={`${label}: ${displayValue}`}
            >
              {!isFill && activeValue === "transparent" ? (
                <Ban className="size-4 text-muted-foreground" />
              ) : (
                <span
                  className={cn(
                    "size-4 rounded-full",
                    isFill ? "border" : "border-2 bg-background",
                    swatchClass,
                  )}
                />
              )}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{`${label}: ${displayValue}`}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="center" className="w-auto p-1.5">
        <DropdownMenuLabel>{`Choose ${label.toLowerCase()}`}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={value ?? ""}
          onValueChange={onValueChange}
          className="grid grid-cols-3 gap-1"
        >
          {options.map(({ color, className }) => (
            <DropdownMenuRadioItem
              key={color}
              value={color}
              aria-label={`${label} ${color}`}
              className="size-8 justify-center p-0"
            >
              {!isFill && color === "transparent" ? (
                <Ban className="size-4 text-muted-foreground" />
              ) : (
                <span
                  className={cn(
                    "size-4 rounded-full",
                    isFill ? "border" : "border-2 bg-background",
                    className,
                  )}
                />
              )}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SelectionToolbar() {
  const selected = useMiniWorkshopStore((state) => state.selectedIds);
  const objectsById = useMiniWorkshopStore((state) => state.objectsById);
  const connections = useMiniWorkshopStore((state) => state.connections);
  const connectorRouting = useMiniWorkshopStore(
    (state) => state.connectorRouting,
  );
  const updateStyle = useMiniWorkshopStore(
    (state) => state.updateSelectedStyle,
  );
  const duplicate = useMiniWorkshopStore((state) => state.duplicateSelected);
  const group = useMiniWorkshopStore((state) => state.groupSelected);
  const ungroup = useMiniWorkshopStore((state) => state.ungroupSelected);
  const align = useMiniWorkshopStore((state) => state.alignSelected);
  const reorder = useMiniWorkshopStore((state) => state.reorderSelected);
  const toggleLock = useMiniWorkshopStore((state) => state.toggleSelectedLock);
  const remove = useMiniWorkshopStore((state) => state.deleteSelected);
  const setRouting = useMiniWorkshopStore(
    (state) => state.updateConnectionRouting,
  );

  const selectionState = useMemo(() => {
    const objects = selected
      .map((id) => objectsById[id])
      .filter((object): object is MiniCanvasObject => Boolean(object));
    const selectedSet = new Set(selected);
    const linkedConnections = connections.filter(
      (connection) =>
        selectedSet.has(connection.sourceObjectId) ||
        selectedSet.has(connection.targetObjectId),
    );

    return {
      fill: sharedValue(objects.map((object) => object.style.fill)),
      stroke: sharedValue(objects.map((object) => object.style.stroke)),
      fontSize: sharedValue(
        objects.map((object) => object.style.fontSize ?? 18),
      ),
      fontWeight: sharedValue(
        objects.map((object) => object.style.fontWeight ?? 500),
      ),
      textAlign: sharedValue(
        objects.map((object) => object.style.textAlign ?? "left"),
      ),
      border: sharedDash(objects),
      routing: linkedConnections.length
        ? sharedValue(linkedConnections.map((connection) => connection.routing))
        : connectorRouting,
    };
  }, [connections, connectorRouting, objectsById, selected]);

  if (!selected.length) return null;

  const fontSizeLabel = selectionState.fontSize
    ? `${selectionState.fontSize} px`
    : "Mixed";
  const borderLabel =
    selectionState.border === "dashed"
      ? "Dashed"
      : selectionState.border === "solid"
        ? "Solid"
        : "Mixed";
  const routingLabel = selectionState.routing
    ? `${selectionState.routing[0].toUpperCase()}${selectionState.routing.slice(1)}`
    : "Mixed";

  return (
    <div className="absolute left-1/2 top-4 z-20 flex max-w-[calc(100%-2rem)] items-center gap-1 overflow-x-auto rounded-xl border bg-background/95 p-1.5 shadow-xl backdrop-blur -translate-x-1/2">
      <ColorPicker
        label="Fill"
        value={selectionState.fill}
        onValueChange={(fill) => updateStyle({ fill })}
      />
      <ColorPicker
        label="Stroke"
        value={selectionState.stroke}
        onValueChange={(stroke) => updateStyle({ stroke })}
      />
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Action label="Duplicate" icon={Copy} onClick={duplicate} />
      <Action label="Group" icon={Group} onClick={group} />
      <Action label="Ungroup" icon={Ungroup} onClick={ungroup} />
      <Action
        label="Align horizontally"
        icon={AlignCenterHorizontal}
        onClick={() => align("center-horizontal")}
      />
      <Action
        label="Align vertically"
        icon={AlignCenterVertical}
        onClick={() => align("center-vertical")}
      />
      <Separator orientation="vertical" className="mx-1 h-6" />
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 gap-1.5 px-2"
                aria-label={`Text formatting: ${fontSizeLabel}`}
              >
                {selectionState.fontWeight === 700 ? (
                  <Bold className="size-3.5" />
                ) : (
                  <Type className="size-3.5" />
                )}
                <span className="text-xs tabular-nums">{fontSizeLabel}</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>{`Text formatting: ${fontSizeLabel}`}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="center" className="w-48">
          <DropdownMenuLabel>Text size</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={selectionState.fontSize?.toString() ?? ""}
            onValueChange={(value) => updateStyle({ fontSize: Number(value) })}
          >
            {[16, 20, 28].map((size) => (
              <DropdownMenuRadioItem key={size} value={size.toString()}>
                {`${size} px`}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Text weight</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={selectionState.fontWeight?.toString() ?? ""}
            onValueChange={(value) =>
              updateStyle({
                fontWeight: Number(value) as 400 | 500 | 600 | 700,
              })
            }
          >
            <DropdownMenuRadioItem value="500">Regular</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="700">Bold</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Text alignment</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={selectionState.textAlign ?? ""}
            onValueChange={(value) =>
              updateStyle({ textAlign: value as "left" | "center" | "right" })
            }
          >
            <DropdownMenuRadioItem value="left">
              <AlignLeft /> Left
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="center">
              <AlignCenterHorizontal /> Center
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="right">
              <AlignLeft className="rotate-180" /> Right
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 gap-1.5 px-2"
                aria-label={`Border style: ${borderLabel}`}
              >
                <CircleDashed className="size-3.5" />
                <span className="text-xs">{borderLabel}</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>{`Border style: ${borderLabel}`}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="center" className="w-40">
          <DropdownMenuLabel>Border style</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={selectionState.border ?? ""}
            onValueChange={(value) =>
              updateStyle({ dash: value === "dashed" ? [8, 6] : [] })
            }
          >
            <DropdownMenuRadioItem value="solid">Solid</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dashed">Dashed</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 gap-1.5 px-2"
                aria-label={`Connector routing: ${routingLabel}`}
              >
                <Route className="size-3.5" />
                <span className="text-xs">{routingLabel}</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>{`Connector routing: ${routingLabel}`}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="center" className="w-48">
          <DropdownMenuLabel>Connector routing</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={selectionState.routing ?? ""}
            onValueChange={(routing) => setRouting(routing as ConnectorRouting)}
          >
            <DropdownMenuRadioItem value="straight">
              Straight
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="curved">Curved</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="elbow">Elbow</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Action
        label="Bring to front"
        icon={ArrowUpToLine}
        onClick={() => reorder("front")}
      />
      <Action
        label="Send to back"
        icon={ArrowDownToLine}
        onClick={() => reorder("back")}
      />
      <Action label="Lock or unlock" icon={Lock} onClick={toggleLock} />
      <Action label="Delete" icon={Trash2} onClick={remove} />
    </div>
  );
}
