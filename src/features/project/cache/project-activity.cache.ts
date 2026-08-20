import type { QueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function getActivityKey(projectId: string) {
    return QUERY_KEYS.projects.activity(projectId);
}

// ─────────────────────────────────────────────────────────────
// Invalidate (full refetch)
// ─────────────────────────────────────────────────────────────

export function invalidateProjectActivity(
    qc: QueryClient,
    projectId: string,
) {
    qc.invalidateQueries({
        queryKey: getActivityKey(projectId),
    });
}
