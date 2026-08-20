import { CopyPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CUSTOM_ROLE_LEVEL_MAX,
  ROLE_PRESETS,
} from "../../constants/rolePresets";
import type { RolePreset } from "../../types";
import { summarizePermissions } from "../../utils/rolePermissions";

interface RolePresetSelectorProps {
  canDuplicate?: boolean;
  onDuplicatePreset: (preset: RolePreset) => void;
}

export function RolePresetSelector({
  canDuplicate = true,
  onDuplicatePreset,
}: RolePresetSelectorProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {ROLE_PRESETS.map((preset) => {
        const isReservedPreset = preset.level > CUSTOM_ROLE_LEVEL_MAX;

        return (
          <Card key={preset.id} size="sm" className="rounded-lg">
            <CardHeader className="gap-3">
              <CardTitle className="text-base">{preset.name}</CardTitle>
              <CardDescription>{preset.description}</CardDescription>
              <CardAction>
                <Badge variant="outline" size="sm">
                  {preset.level}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="grid gap-4">
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {summarizePermissions(preset.permissions)}
              </p>
              <Button
                variant="outline"
                className="w-full sm:w-fit"
                disabled={isReservedPreset || !canDuplicate}
                onClick={() => onDuplicatePreset(preset)}
              >
                <CopyPlus />
                {isReservedPreset ? "Reserved role" : "Duplicate preset"}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
