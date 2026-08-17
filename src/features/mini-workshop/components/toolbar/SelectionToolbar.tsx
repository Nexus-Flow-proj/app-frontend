import { useMemo } from "react";
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignLeft,
  ArrowDownToLine,
  ArrowUpToLine,
  Bold,
  Circle,
  CircleDashed,
  Copy,
  Group,
  Lock,
  Minus,
  Plus,
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
  {
    color: "transparent",
    className:
      "bg-[linear-gradient(135deg,transparent_42%,#94a3b8_43%,#94a3b8_57%,transparent_58%)]",
  },
  { color: "#ede9fe", className: "bg-violet-100" },
  { color: "#dbeafe", className: "bg-blue-100" },
  { color: "#dcfce7", className: "bg-green-100" },
  { color: "#fef3c7", className: "bg-amber-100" },
  { color: "#ffe4e6", className: "bg-rose-100" },
  { color: "#cffafe", className: "bg-cyan-100" },
  { color: "#ffedd5", className: "bg-orange-100" },
  { color: "#f3e8ff", className: "bg-purple-100" },
  { color: "#f1f5f9", className: "bg-slate-100" },
  { color: "#fee2e2", className: "bg-red-100" },
] as const;

const STROKES = [
  { color: "transparent", className: "border-transparent" },
  { color: "#64748b", className: "border-slate-500" },
  { color: "#334155", className: "border-slate-700" },
  { color: "#8b5cf6", className: "border-violet-500" },
  { color: "#2563eb", className: "border-blue-600" },
  { color: "#16a34a", className: "border-green-600" },
  { color: "#0891b2", className: "border-cyan-600" },
  { color: "#f59e0b", className: "border-amber-500" },
  { color: "#ea580c", className: "border-orange-600" },
  { color: "#e11d48", className: "border-rose-600" },
  { color: "#9333ea", className: "border-purple-600" },
  { color: "#111827", className: "border-gray-900" },
] as const;

const TEXT_COLORS = [
  { color: "#0f172a", className: "bg-slate-900" },
  { color: "#334155", className: "bg-slate-700" },
  { color: "#64748b", className: "bg-slate-500" },
  { color: "#7c3aed", className: "bg-violet-600" },
  { color: "#2563eb", className: "bg-blue-600" },
  { color: "#0891b2", className: "bg-cyan-600" },
  { color: "#16a34a", className: "bg-green-600" },
  { color: "#ca8a04", className: "bg-yellow-600" },
  { color: "#ea580c", className: "bg-orange-600" },
  { color: "#e11d48", className: "bg-rose-600" },
  { color: "#be123c", className: "bg-rose-700" },
  { color: "#ffffff", className: "bg-white" },
] as const;

const FILL_CLASS_BY_COLOR: Record<string, string> = {
  "#ffffff": "bg-white",
  "#cffafe": "bg-cyan-100",
  "#ede9fe": "bg-violet-100",
  "#dbeafe": "bg-blue-100",
  "#dcfce7": "bg-green-100",
  "#fef3c7": "bg-amber-100",
  "#ffe4e6": "bg-rose-100",
  "#ffedd5": "bg-orange-100",
  "#f3e8ff": "bg-purple-100",
  "#f1f5f9": "bg-slate-100",
  "#fee2e2": "bg-red-100",
  transparent:
    "bg-[linear-gradient(135deg,transparent_42%,#94a3b8_43%,#94a3b8_57%,transparent_58%)]",
  "rgba(139, 92, 246, 0.04)": "bg-violet-100/50",
};

const STROKE_CLASS_BY_COLOR: Record<string, string> = {
  "#64748b": "border-slate-500",
  "#8b5cf6": "border-violet-500",
  "#2563eb": "border-blue-600",
  "#16a34a": "border-green-600",
  "#0891b2": "border-cyan-600",
  "#ea580c": "border-orange-600",
  "#e11d48": "border-rose-600",
  "#9333ea": "border-purple-600",
  "#111827": "border-gray-900",
  "#94a3b8": "border-slate-400",
  "#f59e0b": "border-amber-500",
  "#c4b5fd": "border-violet-300",
  "#cbd5e1": "border-slate-300",
  "#334155": "border-slate-700",
  transparent: "border-transparent",
};

const TEXT_CLASS_BY_COLOR: Record<string, string> = {
  "#0f172a": "bg-slate-900",
  "#1e293b": "bg-slate-800",
  "#334155": "bg-slate-700",
  "#64748b": "bg-slate-500",
  "#7c3aed": "bg-violet-600",
  "#8b5cf6": "bg-violet-500",
  "#2563eb": "bg-blue-600",
  "#0891b2": "bg-cyan-600",
  "#16a34a": "bg-green-600",
  "#ca8a04": "bg-yellow-600",
  "#ea580c": "bg-orange-600",
  "#e11d48": "bg-rose-600",
  "#be123c": "bg-rose-700",
  "#ffffff": "bg-white",
};

const FONT_SIZE_STEP = 2;
const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 96;

function clampFontSize(size: number) {
  return Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, size));
}

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

function colorSwatchClass(label: ColorPickerProps["label"], color: string) {
  if (label === "Fill") return FILL_CLASS_BY_COLOR[color] ?? "bg-slate-200";
  if (label === "Stroke") {
    return STROKE_CLASS_BY_COLOR[color] ?? "border-slate-400";
  }
  return TEXT_CLASS_BY_COLOR[color] ?? "bg-slate-800";
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
  label: "Fill" | "Stroke" | "Text";
  value: string | null;
  onValueChange: (color: string) => void;
}

function ColorPicker({ label, value, onValueChange }: ColorPickerProps) {
  const isFill = label === "Fill";
  const isStroke = label === "Stroke";
  const options = isFill ? FILLS : isStroke ? STROKES : TEXT_COLORS;
  const fallback = isFill ? "#ffffff" : isStroke ? "#64748b" : "#1e293b";
  const activeValue = value ?? fallback;
  const swatchClass = colorSwatchClass(label, activeValue);
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
              {isStroke && activeValue === "transparent" ? (
                <Ban className="size-4 text-muted-foreground" />
              ) : (
                <span
                  className={cn(
                    "size-4 rounded-full",
                    isStroke ? "border-2 bg-background" : "border",
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
        <ColorRadioGrid
          label={label}
          options={options}
          value={value}
          onValueChange={onValueChange}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ColorRadioGrid({
  label,
  options,
  value,
  onValueChange,
  className,
}: {
  label: ColorPickerProps["label"];
  options: readonly { color: string; className: string }[];
  value: string | null;
  onValueChange: (color: string) => void;
  className?: string;
}) {
  const isStroke = label === "Stroke";

  return (
    <DropdownMenuRadioGroup
      value={value ?? ""}
      onValueChange={onValueChange}
      className={cn("grid grid-cols-3 justify-items-center gap-1", className)}
    >
      {options.map(({ color, className }) => (
        <DropdownMenuRadioItem
          key={color}
          value={color}
          aria-label={`${label} ${color}`}
          className="size-8 justify-center p-0"
        >
          {isStroke && color === "transparent" ? (
            <Ban className="size-4 text-muted-foreground" />
          ) : (
            <span
              className={cn(
                "size-4 rounded-full",
                isStroke ? "border-2 bg-background" : "border",
                className,
              )}
            />
          )}
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  );
}

export function SelectionToolbar() {
  const selected = useMiniWorkshopStore((state) => state.selectedIds);
  const objectsById = useMiniWorkshopStore((state) => state.objectsById);
  const connections = useMiniWorkshopStore((state) => state.connections);
  const connectorRouting = useMiniWorkshopStore(
    (state) => state.connectorRouting,
  );
  const defaultStyle = useMiniWorkshopStore((state) => state.defaultStyle);
  const setDefaultStyle = useMiniWorkshopStore(
    (state) => state.setDefaultStyle,
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

  const hasSelection = selected.length > 0;
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
      textColor: sharedValue(
        objects.map((object) => object.style.textColor ?? "#1e293b"),
      ),
      border: sharedDash(objects),
      routing: linkedConnections.length
        ? sharedValue(linkedConnections.map((connection) => connection.routing))
        : connectorRouting,
    };
  }, [connections, connectorRouting, objectsById, selected]);

  const styleState = hasSelection
    ? selectionState
    : {
        fill: defaultStyle.fill,
        stroke: defaultStyle.stroke,
        fontSize: defaultStyle.fontSize ?? 18,
        fontWeight: defaultStyle.fontWeight ?? 500,
        textAlign: defaultStyle.textAlign ?? "center",
        textColor: defaultStyle.textColor ?? "#1e293b",
        border: defaultStyle.dash?.length ? "dashed" : "solid",
        routing: connectorRouting,
      };

  const applyStyle = (patch: Parameters<typeof updateStyle>[0]) => {
    if (hasSelection) updateStyle(patch);
    else setDefaultStyle(patch);
  };

  const fontSizeLabel = styleState.fontSize
    ? `${styleState.fontSize} px`
    : "Mixed";
  const currentFontSize = styleState.fontSize ?? 18;
  const changeFontSize = (delta: number) => {
    applyStyle({ fontSize: clampFontSize(currentFontSize + delta) });
  };
  const borderLabel =
    styleState.border === "dashed"
      ? "Dashed"
      : styleState.border === "solid"
        ? "Solid"
        : "Mixed";
  const routingLabel = styleState.routing
    ? `${styleState.routing[0].toUpperCase()}${styleState.routing.slice(1)}`
    : "Mixed";

  return (
    <div className="absolute left-4 top-1/2 z-20 flex max-h-[calc(100%-2rem)] -translate-y-1/2 flex-col items-center gap-1 overflow-y-auto rounded-xl border bg-background/95 p-1.5 shadow-xl backdrop-blur">
      <ColorPicker
        label="Fill"
        value={styleState.fill}
        onValueChange={(fill) => applyStyle({ fill })}
      />
      <ColorPicker
        label="Stroke"
        value={styleState.stroke}
        onValueChange={(stroke) => applyStyle({ stroke })}
      />
      {hasSelection && (
        <>
          <Separator className="my-1 w-6" />
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
        </>
      )}
      <Separator className="my-1 w-6" />
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
                {styleState.fontWeight === 700 ? (
                  <Bold className="size-3.5" />
                ) : (
                  <Type className="size-3.5" />
                )}
                <span className="text-[10px] leading-none tabular-nums">
                  {styleState.fontSize ?? "--"}
                </span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>{`Text formatting: ${fontSizeLabel}`}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="center" className="w-48">
          <DropdownMenuLabel>Text size</DropdownMenuLabel>
          <div className="flex items-center justify-between gap-2 px-2 py-1.5">
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="size-8"
              aria-label="Decrease text size"
              onClick={() => changeFontSize(-FONT_SIZE_STEP)}
            >
              <Minus className="size-3.5" />
            </Button>
            <span className="min-w-14 text-center text-sm font-medium tabular-nums">
              {fontSizeLabel}
            </span>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="size-8"
              aria-label="Increase text size"
              onClick={() => changeFontSize(FONT_SIZE_STEP)}
            >
              <Plus className="size-3.5" />
            </Button>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Text color</DropdownMenuLabel>
          <ColorRadioGrid
            label="Text"
            options={TEXT_COLORS}
            value={styleState.textColor}
            onValueChange={(textColor) => applyStyle({ textColor })}
            className="w-full px-2 pb-1.5"
          />
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Text weight</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={styleState.fontWeight?.toString() ?? ""}
            onValueChange={(value) =>
              applyStyle({
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
            value={styleState.textAlign ?? ""}
            onValueChange={(value) =>
              applyStyle({ textAlign: value as "left" | "center" | "right" })
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
                {styleState.border === "solid" ? (
                  <Circle className="size-3.5" />
                ) : (
                  <CircleDashed className="size-3.5" />
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>{`Border style: ${borderLabel}`}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="center" className="w-40">
          <DropdownMenuLabel>Border style</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={styleState.border ?? ""}
            onValueChange={(value) =>
              applyStyle({ dash: value === "dashed" ? [8, 6] : [] })
            }
          >
            <DropdownMenuRadioItem value="solid">Solid</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dashed">Dashed</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Separator className="my-1 w-6" />
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
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>{`Connector routing: ${routingLabel}`}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="center" className="w-48">
          <DropdownMenuLabel>Connector routing</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={styleState.routing ?? ""}
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
      {hasSelection && (
        <>
          <Separator className="my-1 w-6" />
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
        </>
      )}
    </div>
  );
}
