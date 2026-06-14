// features/boards/components/SubtaskChecklist.tsx
// Dev 4 — subtask list inside TaskDetailDrawer.

import { useState, useRef } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import type { Subtask, TaskId } from "../types";

interface SubtaskChecklistProps {
  taskId: TaskId;
  subtasks: Subtask[];
  onToggle: (subtaskId: string, completed: boolean) => void;
  onAdd: (title: string) => void;
  onDelete: (subtaskId: string) => void;
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function Progress({ completed, total }: { completed: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs text-zinc-500 tabular-nums shrink-0 w-8 text-right">
        {pct}%
      </span>
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500
            ${pct === 100 ? "bg-emerald-400" : "bg-indigo-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-zinc-500 tabular-nums shrink-0">
        {completed}/{total}
      </span>
    </div>
  );
}

// ─── Single subtask row ───────────────────────────────────────────────────────
function SubtaskRow({
  subtask,
  onToggle,
  onDelete,
}: {
  subtask: Subtask;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="group flex items-center gap-2.5 py-1.5 px-2 -mx-2 rounded-lg hover:bg-white/[0.04] transition-colors">
      <GripVertical className="w-3.5 h-3.5 text-zinc-700 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity cursor-grab" />

      <button
        onClick={() => onToggle(subtask.id, !subtask.completed)}
        className={`w-4 h-4 rounded shrink-0 border transition-all duration-150 flex items-center justify-center
          ${subtask.completed
            ? "bg-indigo-500 border-indigo-500"
            : "bg-transparent border-zinc-600 hover:border-zinc-400"
          }`}
      >
        {subtask.completed && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
          </svg>
        )}
      </button>

      <span
        className={`flex-1 text-sm transition-all duration-150 leading-snug
          ${subtask.completed ? "line-through text-zinc-600" : "text-zinc-300"}`}
      >
        {subtask.title}
      </span>

      <button
        onClick={() => onDelete(subtask.id)}
        className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400
                   transition-all duration-150 shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Add subtask input ────────────────────────────────────────────────────────
function AddSubtaskInput({ onAdd }: { onAdd: (title: string) => void }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onAdd(trimmed);
      setValue("");
    }
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300
                   transition-colors mt-1 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] w-full"
      >
        <Plus className="w-3.5 h-3.5" />
        Add subtask
      </button>
    );
  }

  return (
    <div className="mt-1 flex items-center gap-2">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") { setOpen(false); setValue(""); }
        }}
        placeholder="Subtask title..."
        className="flex-1 h-8 px-3 rounded-lg bg-white/[0.05] border border-white/[0.10]
                   text-sm text-zinc-200 placeholder:text-zinc-600
                   focus:outline-none focus:border-indigo-500/50"
      />
      <button
        onClick={submit}
        className="h-8 px-3 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-xs
                   font-medium transition-colors shrink-0"
      >
        Add
      </button>
      <button
        onClick={() => { setOpen(false); setValue(""); }}
        className="h-8 px-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5
                   text-xs transition-colors shrink-0"
      >
        Cancel
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function SubtaskChecklist({
  subtasks,
  onToggle,
  onAdd,
  onDelete,
}: SubtaskChecklistProps) {
  const completed = subtasks.filter((s) => s.completed).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Subtasks
        </h4>
        <span className="text-xs text-zinc-600">
          {completed} of {subtasks.length} done
        </span>
      </div>

      {subtasks.length > 0 && (
        <Progress completed={completed} total={subtasks.length} />
      )}

      <div className="space-y-0.5">
        {subtasks.map((subtask) => (
          <SubtaskRow
            key={subtask.id}
            subtask={subtask}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))}
      </div>

      <AddSubtaskInput onAdd={onAdd} />
    </div>
  );
}
