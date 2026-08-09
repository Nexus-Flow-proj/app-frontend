import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { MiniCanvasObject } from "../../types";

interface ObjectEditorDialogProps {
  object: MiniCanvasObject | null;
  onOpenChange: (open: boolean) => void;
  onSave: (object: MiniCanvasObject, primary: string, secondary: string) => void;
}

function values(object: MiniCanvasObject | null) {
  if (!object) return { primary: "", secondary: "" };
  if (object.type === "SHAPE") return { primary: object.data.text ?? "", secondary: "" };
  if (object.type === "TEXT" || object.type === "STICKY_NOTE") return { primary: object.data.text, secondary: "" };
  if (object.type === "FRAME") return { primary: object.data.title, secondary: object.data.description ?? "" };
  if (object.type === "PERSONAL_TASK" || object.type === "BOARD_TASK_REFERENCE") return { primary: object.data.title, secondary: object.data.description };
  if (object.type === "IMAGE") return { primary: object.data.alt, secondary: "" };
  return { primary: "", secondary: "" };
}

export function ObjectEditorDialog({ object, onOpenChange, onSave }: ObjectEditorDialogProps) {
  const initial = values(object);
  const [primary, setPrimary] = useState(initial.primary); const [secondary, setSecondary] = useState(initial.secondary);
  const readOnly = object?.type === "BOARD_TASK_REFERENCE";
  return <Dialog open={Boolean(object)} onOpenChange={onOpenChange}><DialogContent>
    <DialogHeader><DialogTitle>{readOnly ? "Board task reference" : "Edit canvas object"}</DialogTitle><DialogDescription>{readOnly ? "This reference mirrors the Team Board and cannot mutate its source task." : "Update the content while keeping the object in place."}</DialogDescription></DialogHeader>
    <div className="space-y-3"><Input value={primary} readOnly={readOnly} onChange={(event) => setPrimary(event.target.value)} aria-label="Title or text" />{(object?.type === "FRAME" || object?.type === "PERSONAL_TASK" || object?.type === "BOARD_TASK_REFERENCE") && <Textarea value={secondary} readOnly={readOnly} onChange={(event) => setSecondary(event.target.value)} aria-label="Description" rows={4} />}</div>
    <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Close</Button>{!readOnly && <Button type="button" disabled={!primary.trim()} onClick={() => object && onSave(object, primary.trim(), secondary.trim())}>Save changes</Button>}</DialogFooter>
  </DialogContent></Dialog>;
}
