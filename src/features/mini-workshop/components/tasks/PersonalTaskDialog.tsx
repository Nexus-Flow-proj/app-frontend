import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  personalTaskSchema,
  type PersonalTaskDto,
} from "../../validation/personal-task.schema";

const COLORS = [
  { value: "#ede9fe", className: "bg-violet-100" },
  { value: "#dbeafe", className: "bg-blue-100" },
  { value: "#dcfce7", className: "bg-green-100" },
  { value: "#fef3c7", className: "bg-amber-100" },
  { value: "#ffe4e6", className: "bg-rose-100" },
];

interface PersonalTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (task: PersonalTaskDto) => void;
}

export function PersonalTaskDialog({
  open,
  onOpenChange,
  onSubmit,
}: PersonalTaskDialogProps) {
  const form = useForm<PersonalTaskDto>({
    resolver: zodResolver(personalTaskSchema),
    defaultValues: { title: "", description: "", color: COLORS[0].value },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) form.reset();
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create personal task</DialogTitle>
          <DialogDescription>
            This task stays inside your Mini Workshop and will not appear on the Team Board.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => {
            onSubmit(values);
            form.reset();
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="personal-task-title">Title</Label>
            <Input
              id="personal-task-title"
              autoFocus
              placeholder="What do you want to explore?"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="personal-task-description">Description</Label>
            <Textarea
              id="personal-task-description"
              rows={4}
              placeholder="Add context or a next step..."
              {...form.register("description")}
            />
          </div>
          <Controller
            name="color"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label>Card color</Label>
                <div className="flex gap-2">
                  {COLORS.map((color) => (
                    <Button
                      key={color.value}
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label={`Use ${color.value}`}
                      className={cn(
                        "size-9 rounded-full border-2",
                        color.className,
                        field.value === color.value && "border-violet-500 ring-2 ring-violet-500/20",
                      )}
                      onClick={() => field.onChange(color.value)}
                    />
                  ))}
                </div>
              </div>
            )}
          />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add to canvas</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
