import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { MiniCanvasObject } from "../../types";
import { objectText } from "../../utils/objectFactory";

interface CanvasSearchDialogProps {
  open: boolean;
  objects: MiniCanvasObject[];
  onOpenChange: (open: boolean) => void;
  onChoose: (object: MiniCanvasObject) => void;
}

export function CanvasSearchDialog({ open, objects, onOpenChange, onChoose }: CanvasSearchDialogProps) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    return (value ? objects.filter((object) => objectText(object).toLowerCase().includes(value)) : objects).slice(0, 30);
  }, [objects, query]);
  return <Dialog open={open} onOpenChange={(next) => { if (!next) setQuery(""); onOpenChange(next); }}><DialogContent className="max-w-xl">
    <DialogHeader><DialogTitle>Search this canvas</DialogTitle><DialogDescription>Find text, notes, frames, and task titles, then jump to the result.</DialogDescription></DialogHeader>
    <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search canvas objects…" className="pl-9" /></div>
    <ScrollArea className="max-h-80"><div className="space-y-1 pr-3">{results.map((object) => <Button key={object.id} type="button" variant="ghost" className="h-auto w-full justify-start px-3 py-2 text-left" onClick={() => { onChoose(object); onOpenChange(false); }}><span className="min-w-0"><span className="block truncate font-medium">{objectText(object) || object.type.replaceAll("_", " ")}</span><span className="block text-xs text-muted-foreground">{object.type.replaceAll("_", " ")}</span></span></Button>)}{!results.length && <p className="py-8 text-center text-sm text-muted-foreground">No canvas objects match this search.</p>}</div></ScrollArea>
  </DialogContent></Dialog>;
}
