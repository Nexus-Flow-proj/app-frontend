import { useMemo, useState } from "react";
import {
  BrainCircuit,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useParams } from "react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Loading from "@/components/shared/loading/Loading";
import { dateformat } from "@/lib/format/date";
import { ProjectUnavailableState } from "../components/overview";
import {
  KnowledgeRuleSheet,
  KnowledgeSourceBadge,
  KNOWLEDGE_SOURCE_OPTIONS,
} from "../components/knowledge";
import {
  useCreateProjectKnowledge,
  useDeleteProjectKnowledge,
  useProjectAccess,
  useProjectKnowledge,
  useUpdateProjectKnowledge,
} from "../hooks";
import type { KnowledgeDocument, KnowledgeSourceType } from "../types";
import { canManageProjectSettings } from "../utils/rolePermissions";
import type { KnowledgeFormValues } from "../validation";

type SourceFilter = KnowledgeSourceType | "all";

function getCreatorName(rule: KnowledgeDocument) {
  if (!rule.creator) {
    return "Unknown contributor";
  }

  return (
    `${rule.creator.firstName} ${rule.creator.lastName}`.trim() ||
    rule.creator.email
  );
}

function getLoadErrorMessage(statusCode?: number) {
  switch (statusCode) {
    case 403:
      return "You need project access to view AI knowledge rules.";
    case 404:
      return "Knowledge rules were not found for this project.";
    case 500:
      return "Failed to process knowledge embedding. Please try again in a few moments.";
    default:
      return "Could not load project knowledge. Try refreshing the page.";
  }
}

function getSnippet(content: string, maxLength = 180) {
  return content.length > maxLength
    ? `${content.slice(0, maxLength).trim()}...`
    : content;
}

export default function ProjectKnowledgePage() {
  const { id } = useParams<{ id: string }>();
  const {
    project,
    role,
    isLoading: isProjectLoading,
    isError: isProjectError,
  } = useProjectAccess(id);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<KnowledgeDocument | null>(
    null,
  );
  const canManageKnowledge = role ? canManageProjectSettings(role) : false;
  const activeSourceType = sourceFilter === "all" ? undefined : sourceFilter;
  const knowledgeQuery = useProjectKnowledge(id, activeSourceType);
  const createKnowledge = useCreateProjectKnowledge();
  const updateKnowledge = useUpdateProjectKnowledge();
  const deleteKnowledge = useDeleteProjectKnowledge();

  const visibleRules = useMemo(() => {
    const rules = knowledgeQuery.data ?? [];
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return rules;
    }

    return rules.filter((rule) =>
      `${rule.title} ${rule.content}`.toLowerCase().includes(normalizedSearch),
    );
  }, [knowledgeQuery.data, searchTerm]);
  const isSaving = createKnowledge.isPending || updateKnowledge.isPending;

  if (isProjectLoading) {
    return <Loading text="Loading project knowledge..." />;
  }

  if (isProjectError || !project || !id) {
    return <ProjectUnavailableState />;
  }

  const projectId = id;

  function handleCreateClick() {
    setEditingRule(null);
    setIsSheetOpen(true);
  }

  function handleEditClick(rule: KnowledgeDocument) {
    setEditingRule(rule);
    setIsSheetOpen(true);
  }

  function handleSheetOpenChange(open: boolean) {
    setIsSheetOpen(open);

    if (!open) {
      setEditingRule(null);
    }
  }

  function handleRuleSubmit(values: KnowledgeFormValues) {
    if (!id) {
      return;
    }

    if (editingRule) {
      updateKnowledge.mutate(
        {
          projectId,
          chunkId: editingRule.id,
          ...values,
        },
        {
          onSuccess: () => handleSheetOpenChange(false),
        },
      );
      return;
    }

    createKnowledge.mutate(
      {
        projectId,
        ...values,
      },
      {
        onSuccess: () => handleSheetOpenChange(false),
      },
    );
  }

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-1 py-1">
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-lg text-white"
            style={{ backgroundColor: project.color ?? "#2563eb" }}
          >
            <BrainCircuit className="size-5" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-normal text-foreground">
              Knowledge & AI Rules
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Maintain project policies, decisions, and standards that NexusFlow
              AI can retrieve during planning and task recommendations.
            </p>
          </div>
        </div>

        {canManageKnowledge ? (
          <Button type="button" onClick={handleCreateClick}>
            <Plus className="size-4" />
            Add rule
          </Button>
        ) : null}
      </header>

      <section className="grid gap-6">
        <div className="grid gap-4">
          <div className="grid gap-3 rounded-lg border bg-muted/25 p-3 md:grid-cols-[minmax(0,1fr)_220px_auto]">
            <div className="relative h-8">
              <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-muted-foreground">
                <Search className="size-4" />
              </span>
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search knowledge rules..."
                className="h-8 bg-background pl-8 text-xs font-semibold"
              />
            </div>
            <Select
              value={sourceFilter}
              onValueChange={(value) => setSourceFilter(value as SourceFilter)}
            >
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Filter type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {KNOWLEDGE_SOURCE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              disabled={knowledgeQuery.isFetching}
              onClick={() => knowledgeQuery.refetch()}
            >
              <RefreshCw className="size-4" />
              Refresh
            </Button>
          </div>

          {knowledgeQuery.isLoading ? (
            <div className="grid gap-3">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-36 rounded-lg" />
              ))}
            </div>
          ) : knowledgeQuery.isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {getLoadErrorMessage(knowledgeQuery.error?.statusCode)}
            </div>
          ) : visibleRules.length === 0 ? (
            <div className="grid place-items-center rounded-lg border border-dashed bg-muted/20 px-6 py-14 text-center">
              <div className="mx-auto flex max-w-md flex-col items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="size-6" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    No matching knowledge rules
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add project guidelines and policies so AI recommendations
                    can reflect how this team actually works.
                  </p>
                </div>
                {canManageKnowledge ? (
                  <Button type="button" onClick={handleCreateClick}>
                    <Plus className="size-4" />
                    Add first rule
                  </Button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {visibleRules.map((rule) => (
                <Card key={rule.id} className="rounded-lg">
                  <CardHeader className="gap-2">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <KnowledgeSourceBadge sourceType={rule.sourceType} />
                      <CardTitle className="min-w-0 truncate text-base">
                        {rule.title}
                      </CardTitle>
                    </div>
                    {canManageKnowledge ? (
                      <CardAction className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="transparent"
                          size="icon-sm"
                          aria-label={`Edit ${rule.title}`}
                          onClick={() => handleEditClick(rule)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              type="button"
                              variant="transparent"
                              size="icon-sm"
                              aria-label={`Delete ${rule.title}`}
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogMedia className="bg-destructive/10 text-destructive">
                                <Trash2 className="size-5" />
                              </AlertDialogMedia>
                              <AlertDialogTitle>
                                Delete knowledge rule?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This removes "{rule.title}" from AI retrieval
                                for this project.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                variant="destructive"
                                onClick={() =>
                                  deleteKnowledge.mutate({
                                    projectId,
                                    chunkId: rule.id,
                                  })
                                }
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </CardAction>
                    ) : null}
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <p className="text-sm leading-6 text-muted-foreground">
                      {getSnippet(rule.content)}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>Added by {getCreatorName(rule)}</span>
                      <span>Updated {dateformat(rule.updatedAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {canManageKnowledge ? (
        <KnowledgeRuleSheet
          open={isSheetOpen}
          rule={editingRule}
          isPending={isSaving}
          onOpenChange={handleSheetOpenChange}
          onSubmit={handleRuleSubmit}
        />
      ) : null}
    </main>
  );
}
