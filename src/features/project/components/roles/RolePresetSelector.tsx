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
import { ROLE_PRESETS } from "../../constants/rolePresets";
import type { RolePreset } from "../../types";
import { summarizePermissions } from "../../utils/rolePermissions";

interface RolePresetSelectorProps {
  onDuplicatePreset: (preset: RolePreset) => void;
}

export function RolePresetSelector({
  onDuplicatePreset,
}: RolePresetSelectorProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {ROLE_PRESETS.map((preset) => (
        <Card key={preset.id} size="sm" className="rounded-lg">
          <CardHeader>
            <CardTitle>{preset.name}</CardTitle>
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
              className="w-fit"
              onClick={() => onDuplicatePreset(preset)}
            >
              <CopyPlus />
              Duplicate preset
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
