import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown, MarkdownManager } from "@tiptap/markdown";
import {
  Bold,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Pencil,
  Redo2,
  Sparkles,
  Undo2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TaskDescriptionEditorProps {
  taskId: string;
  value: string;
  disabled?: boolean;
  isGenerating?: boolean;
  onChange: (value: string) => void;
  onGenerate?: () => void;
}

const EDITOR_EXTENSIONS = [StarterKit, Markdown];

function getEditorMarkdown(editor: Editor, manager: MarkdownManager) {
  return manager.serialize(editor.getJSON()).trim();
}

interface EditingState {
  taskId: string;
  isEditing: boolean;
}

interface ToolbarButtonProps {
  label: string;
  isActive?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}

function ToolbarButton({
  label,
  isActive,
  disabled,
  onClick,
  children,
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant={isActive ? "secondary" : "ghost"}
      size="icon-sm"
      className="size-7"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  );
}

export function TaskDescriptionEditor({
  taskId,
  value,
  disabled,
  isGenerating,
  onChange,
  onGenerate,
}: TaskDescriptionEditorProps) {
  const [editingState, setEditingState] = useState<EditingState | null>(null);
  const [expandedState, setExpandedState] = useState<{
    taskId: string;
    isExpanded: boolean;
  } | null>(null);
  const isEditing = editingState?.taskId === taskId && editingState.isEditing;
  const isExpanded =
    expandedState?.taskId === taskId && expandedState.isExpanded;
  const manager = useMemo(
    () =>
      new MarkdownManager({
        extensions: EDITOR_EXTENSIONS,
      }),
    [],
  );
  const lastMarkdownRef = useRef(value);
  const parsedContent = useMemo(
    () => manager.parse(value || ""),
    [manager, value],
  );

  const editor = useEditor({
    extensions: EDITOR_EXTENSIONS,
    content: parsedContent,
    editable: false,
    editorProps: {
      attributes: {
        class:
          "min-h-28 outline-none [&_h1]:mb-2 [&_h1]:mt-3 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-base [&_h2]:font-semibold [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_strong]:font-semibold",
      },
    },
    onUpdate: ({ editor }) => {
      const markdown = getEditorMarkdown(editor, manager);
      lastMarkdownRef.current = markdown;
      onChange(markdown);
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(isEditing && !disabled);
  }, [disabled, editor, isEditing]);

  useEffect(() => {
    if (!editor || value === lastMarkdownRef.current) return;

    lastMarkdownRef.current = value;
    editor.commands.setContent(manager.parse(value || ""), {
      emitUpdate: false,
    });
  }, [editor, manager, value]);

  const canEdit = !disabled;
  const hasDescription = value.trim().length > 0;
  const canCollapsePreview = !isEditing && hasDescription && value.length > 700;
  const isPreviewCollapsed = canCollapsePreview && !isExpanded;

  return (
    <div className="space-y-2 pt-4">
      <div
        className={cn(
          "space-y-2",
          isEditing &&
            "sticky top-0 z-20 -mx-6 bg-card/95 px-6 py-2 backdrop-blur",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Description
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant={isEditing ? "secondary" : "outline"}
              size="sm"
              className="h-7 gap-1.5"
              disabled={!canEdit}
              onClick={() =>
                setEditingState((current) => ({
                  taskId,
                  isEditing:
                    current?.taskId === taskId ? !current.isEditing : true,
                }))
              }
            >
              <Pencil className="size-3.5" />
              {isEditing ? "Done" : "Edit"}
            </Button>
            <Button
              type="button"
              variant="soft"
              size="sm"
              className="h-7 gap-1.5 text-primary"
              disabled={disabled || !onGenerate}
              isLoading={isGenerating}
              onClick={onGenerate}
            >
              <Sparkles className="size-3.5" />
              Generate with AI
            </Button>
          </div>
        </div>

        {isEditing && editor && (
          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
            <ToolbarButton
              label="Bold"
              isActive={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton
              label="Italic"
              isActive={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton
              label="Heading 1"
              isActive={editor.isActive("heading", { level: 1 })}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
            >
              <Heading1 className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton
              label="Heading 2"
              isActive={editor.isActive("heading", { level: 2 })}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
            >
              <Heading2 className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton
              label="Bullet list"
              isActive={editor.isActive("bulletList")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton
              label="Ordered list"
              isActive={editor.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="size-3.5" />
            </ToolbarButton>
            <span className="mx-1 h-4 w-px bg-border" />
            <ToolbarButton
              label="Undo"
              disabled={!editor.can().undo()}
              onClick={() => editor.chain().focus().undo().run()}
            >
              <Undo2 className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton
              label="Redo"
              disabled={!editor.can().redo()}
              onClick={() => editor.chain().focus().redo().run()}
            >
              <Redo2 className="size-3.5" />
            </ToolbarButton>
          </div>
        )}
      </div>

      <div
        className={cn(
          "relative rounded-lg border border-input bg-background text-sm transition-colors",
          isEditing && "ring-1 ring-ring/25",
          disabled && "opacity-60",
        )}
      >
        <div
          className={cn(
            "relative px-3 py-2",
            isPreviewCollapsed && "max-h-72 overflow-hidden",
          )}
        >
          {editor ? (
            <EditorContent editor={editor} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Loading description...
            </p>
          )}
          {isPreviewCollapsed && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
          )}
        </div>
        {!hasDescription && !isEditing && (
          <p className="pointer-events-none absolute left-3 top-2 text-sm text-muted-foreground">
            No description yet.
          </p>
        )}
        {canCollapsePreview && (
          <div className="border-t border-border/70 px-3 py-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-full text-xs text-muted-foreground hover:text-foreground"
              onClick={() =>
                setExpandedState((current) => ({
                  taskId,
                  isExpanded:
                    current?.taskId === taskId ? !current.isExpanded : true,
                }))
              }
            >
              {isExpanded ? "See less" : "See more"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
