import { ChevronDown, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface FilterDropdownOption<TValue extends string> {
  value: TValue;
  label: string;
  dotClassName?: string;
}

interface FilterDropdownProps<TValue extends string> {
  label: string;
  icon: LucideIcon;
  options: FilterDropdownOption<TValue>[];
  selected: TValue[];
  onToggle: (value: TValue) => void;
  multiple?: boolean;
  contentClassName?: string;
  description?: string;
}

export function FilterDropdown<TValue extends string>({
  label,
  icon: Icon,
  options,
  selected,
  onToggle,
  multiple = true,
  contentClassName = "w-44",
  description = `Filter by ${label.toLowerCase()}`,
}: FilterDropdownProps<TValue>) {
  const hasSelection = selected.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 gap-1.5 text-xs",
            hasSelection && "border-primary/40 bg-primary/8 text-primary",
          )}
        >
          <Icon className="size-3" />
          {label}
          {multiple && hasSelection && (
            <Badge size="xs" shape="circle">
              {selected.length}
            </Badge>
          )}
          <ChevronDown className="size-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className={contentClassName}>
        <DropdownMenuLabel className="text-xs">{description}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selected.includes(option.value)}
            onCheckedChange={() => onToggle(option.value)}
            className={cn("text-sm", option.dotClassName && "gap-2")}
          >
            {option.dotClassName && (
              <span
                className={cn(
                  "size-2 rounded-full inline-block",
                  option.dotClassName,
                )}
              />
            )}
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
