import { useMemo, useState } from "react";
import { LayoutTemplate, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { MINI_WORKSHOP_TEMPLATES } from "../../constants/templates";
import type { WhiteboardTemplate } from "../../types";

interface TemplateGalleryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (template: WhiteboardTemplate) => void;
}

const TEMPLATE_ACCENTS: Record<string, { background: string; icon: string }> = {
  "mind-map": { background: "bg-violet-500/10", icon: "text-violet-500" },
  flowchart: { background: "bg-blue-500/10", icon: "text-blue-500" },
  brainstorm: { background: "bg-amber-500/10", icon: "text-amber-500" },
  kanban: { background: "bg-cyan-500/10", icon: "text-cyan-500" },
  retrospective: { background: "bg-emerald-500/10", icon: "text-emerald-500" },
  "user-story-map": { background: "bg-pink-500/10", icon: "text-pink-500" },
  "customer-journey": { background: "bg-orange-500/10", icon: "text-orange-500" },
  swot: { background: "bg-indigo-500/10", icon: "text-indigo-500" },
};

export function TemplateGalleryDialog({
  open,
  onOpenChange,
  onInsert,
}: TemplateGalleryDialogProps) {
  const [search, setSearch] = useState("");
  const templates = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return MINI_WORKSHOP_TEMPLATES;
    return MINI_WORKSHOP_TEMPLATES.filter((template) =>
      `${template.name} ${template.description} ${template.category}`
        .toLowerCase()
        .includes(query),
    );
  }, [search]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(760px,calc(100dvh-2rem))] max-h-[calc(100dvh-2rem)] flex-col overflow-hidden sm:max-w-5xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>Start with a template</DialogTitle>
          <DialogDescription>
            Templates are inserted at the center of your current view. Existing work stays in place.
          </DialogDescription>
        </DialogHeader>
        <div className="relative shrink-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search templates..."
            className="pl-9"
          />
        </div>
        <ScrollArea className="min-h-0 flex-1 pr-3">
          <div className="grid gap-3 pb-1 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="overflow-hidden transition-colors hover:border-violet-500/50">
                <CardHeader className="pb-3">
                  <div
                    className={cn(
                      "flex h-28 items-center justify-center rounded-lg",
                      TEMPLATE_ACCENTS[template.id]?.background,
                    )}
                  >
                    <LayoutTemplate className={cn("size-10", TEMPLATE_ACCENTS[template.id]?.icon)} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold">{template.name}</h3>
                      <Badge variant="secondary">{template.category}</Badge>
                    </div>
                    <p className="mt-1 min-h-10 text-sm text-muted-foreground">{template.description}</p>
                  </div>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      onInsert(template);
                      onOpenChange(false);
                    }}
                  >
                    Insert template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
