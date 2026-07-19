import { create } from "zustand";

export const HighlightEntity = {
    task: "task",
    subtask: "subtask",
    comment: "comment",
    column: "column",
} as const;

export type HighlightEntity =
    (typeof HighlightEntity)[keyof typeof HighlightEntity];

interface HighlightStore {
    highlighted: Map<HighlightEntity, Set<string>>;

    highlight: (
        entity: HighlightEntity,
        id: string,
        duration?: number,
    ) => void;

    removeHighlight: (
        entity: HighlightEntity,
        id: string,
    ) => void;

    clearAll: () => void;
}

// ------------------------------------------------------------------
// Implementation details (NOT state)
// ------------------------------------------------------------------

const highlightTimeouts = new Map<
    string,
    ReturnType<typeof setTimeout>
>();

const getHighlightKey = (
    entity: HighlightEntity,
    id: string,
) => `${entity}:${id}`;

export const useHighlightStore = create<HighlightStore>((set, get) => ({
    highlighted: new Map(),

    highlight(entity, id, duration = 2000) {
        const key = getHighlightKey(entity, id);

        const existingTimeout = highlightTimeouts.get(key);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }

        set(state => {
            const highlighted = new Map(state.highlighted);
            const ids = new Set(
                highlighted.get(entity) ?? [],
            );
            ids.add(id);
            highlighted.set(entity, ids);
            return { highlighted };
        });
        const timeout = setTimeout(() => {
            get().removeHighlight(entity, id);
        }, duration);

        highlightTimeouts.set(key, timeout);
    },

    removeHighlight(entity, id) {
        const key = getHighlightKey(entity, id);

        const existingTimeout = highlightTimeouts.get(key);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
            highlightTimeouts.delete(key);
        }

        set(state => {
            const highlighted = new Map(state.highlighted);
            const ids = new Set(
                highlighted.get(entity) ?? [],
            );
            ids.delete(id);
            if (ids.size === 0) {
                highlighted.delete(entity);
            } else {
                highlighted.set(entity, ids);
            }
            return { highlighted };
        });
    },

    clearAll() {
        highlightTimeouts.forEach(clearTimeout);
        highlightTimeouts.clear();

        set({
            highlighted: new Map(),
        });
    },
}));