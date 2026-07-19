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
    removing: Map<HighlightEntity, Set<string>>;
    moving: Map<HighlightEntity, Set<string>>;

    highlight: (
        entity: HighlightEntity,
        id: string,
        duration?: number,
    ) => void;

    markRemoving: (
        entity: HighlightEntity,
        id: string,
        duration?: number,
    ) => void;

    markMoving: (
        entity: HighlightEntity,
        id: string,
        duration?: number,
    ) => void;

    captureLayout: (
        entity: HighlightEntity,
        id: string,
    ) => void;

    captureVisibleLayouts: (
        entity: HighlightEntity,
    ) => void;

    animateLayoutChange: (
        entity: HighlightEntity,
        id: string,
        options?: LayoutAnimationOptions,
    ) => void;

    animateCapturedLayouts: (
        entity: HighlightEntity,
        options?: LayoutAnimationOptions,
    ) => void;

    removeHighlight: (
        entity: HighlightEntity,
        id: string,
    ) => void;

    removeRemoving: (
        entity: HighlightEntity,
        id: string,
    ) => void;

    removeMoving: (
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
const removingTimeouts = new Map<
    string,
    ReturnType<typeof setTimeout>
>();
const movingTimeouts = new Map<
    string,
    ReturnType<typeof setTimeout>
>();
const layoutSnapshots = new Map<string, DOMRect>();
const layoutAnimations = new Map<string, Animation>();

interface LayoutAnimationOptions {
    duration?: number;
    maxFrames?: number;
}

const getHighlightKey = (
    entity: HighlightEntity,
    id: string,
) => `${entity}:${id}`;

function addEntityState(
    map: Map<HighlightEntity, Set<string>>,
    entity: HighlightEntity,
    id: string,
) {
    const next = new Map(map);
    const ids = new Set(next.get(entity) ?? []);
    ids.add(id);
    next.set(entity, ids);
    return next;
}

function removeEntityState(
    map: Map<HighlightEntity, Set<string>>,
    entity: HighlightEntity,
    id: string,
) {
    const next = new Map(map);
    const ids = new Set(next.get(entity) ?? []);
    ids.delete(id);
    if (ids.size === 0) {
        next.delete(entity);
    } else {
        next.set(entity, ids);
    }
    return next;
}

function getRealtimeElement(entity: HighlightEntity, id: string) {
    if (typeof document === "undefined") return null;

    return Array.from(
        document.querySelectorAll<HTMLElement>(
            `[data-realtime-entity="${entity}"]`,
        ),
    ).find((element) => element.dataset.realtimeId === id) ?? null;
}

function getRealtimeElements(entity: HighlightEntity) {
    if (typeof document === "undefined") return [];

    return Array.from(
        document.querySelectorAll<HTMLElement>(
            `[data-realtime-entity="${entity}"]`,
        ),
    );
}

function prefersReducedMotion() {
    if (typeof window === "undefined") return true;

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scheduleLayoutAnimation(
    entity: HighlightEntity,
    id: string,
    duration = 520,
    maxFrames = 8,
) {
    const key = getHighlightKey(entity, id);
    const first = layoutSnapshots.get(key);
    if (!first || prefersReducedMotion()) {
        layoutSnapshots.delete(key);
        return;
    }

    let frame = 0;

    const playWhenLayoutMoves = () => {
        const element = getRealtimeElement(entity, id);
        if (!element) {
            layoutSnapshots.delete(key);
            return;
        }

        const last = element.getBoundingClientRect();
        const deltaX = first.left - last.left;
        const deltaY = first.top - last.top;

        if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) {
            frame += 1;

            if (frame < maxFrames) {
                requestAnimationFrame(playWhenLayoutMoves);
                return;
            }

            layoutSnapshots.delete(key);
            return;
        }

        layoutSnapshots.delete(key);

        const existingAnimation = layoutAnimations.get(key);
        existingAnimation?.cancel();

        const previousPosition = element.style.position;
        const previousZIndex = element.style.zIndex;
        element.style.willChange = "transform, box-shadow";
        element.style.position = previousPosition || "relative";
        element.style.zIndex = "30";

        const animation = element.animate(
            [
                {
                    transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(0.98)`,
                    boxShadow: "0 22px 54px var(--highlight-shadow)",
                },
                {
                    transform: `translate3d(${deltaX * 0.18}px, ${deltaY * 0.18}px, 0) scale(1.006)`,
                    boxShadow: "0 14px 34px var(--highlight-shadow)",
                    offset: 0.72,
                },
                {
                    transform: "translate3d(0, 0, 0) scale(1)",
                    boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
                },
            ],
            {
                duration,
                easing: "cubic-bezier(0.2, 0.9, 0.18, 1)",
            },
        );

        layoutAnimations.set(key, animation);

        animation.addEventListener("finish", () => {
            element.style.willChange = "";
            element.style.position = previousPosition;
            element.style.zIndex = previousZIndex;
            layoutAnimations.delete(key);
        });
        animation.addEventListener("cancel", () => {
            element.style.willChange = "";
            element.style.position = previousPosition;
            element.style.zIndex = previousZIndex;
            layoutAnimations.delete(key);
        });
    };

    requestAnimationFrame(playWhenLayoutMoves);
}

export const useHighlightStore = create<HighlightStore>((set, get) => ({
    highlighted: new Map(),
    removing: new Map(),
    moving: new Map(),

    highlight(entity, id, duration = 2000) {
        const key = getHighlightKey(entity, id);

        const existingTimeout = highlightTimeouts.get(key);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }

        set(state => {
            return { highlighted: addEntityState(state.highlighted, entity, id) };
        });
        const timeout = setTimeout(() => {
            get().removeHighlight(entity, id);
        }, duration);

        highlightTimeouts.set(key, timeout);
    },

    markRemoving(entity, id, duration = 220) {
        const key = getHighlightKey(entity, id);

        const existingTimeout = removingTimeouts.get(key);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }

        set(state => ({
            removing: addEntityState(state.removing, entity, id),
        }));

        const timeout = setTimeout(() => {
            get().removeRemoving(entity, id);
        }, duration);

        removingTimeouts.set(key, timeout);
    },

    markMoving(entity, id, duration = 360) {
        const key = getHighlightKey(entity, id);

        const existingTimeout = movingTimeouts.get(key);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }

        set(state => ({
            moving: addEntityState(state.moving, entity, id),
        }));

        const timeout = setTimeout(() => {
            get().removeMoving(entity, id);
        }, duration);

        movingTimeouts.set(key, timeout);
    },

    captureLayout(entity, id) {
        const element = getRealtimeElement(entity, id);
        if (!element) return;

        layoutSnapshots.set(
            getHighlightKey(entity, id),
            element.getBoundingClientRect(),
        );
    },

    captureVisibleLayouts(entity) {
        getRealtimeElements(entity).forEach((element) => {
            const id = element.dataset.realtimeId;
            if (!id) return;

            layoutSnapshots.set(
                getHighlightKey(entity, id),
                element.getBoundingClientRect(),
            );
        });
    },

    animateLayoutChange(entity, id, options) {
        scheduleLayoutAnimation(entity, id, options?.duration, options?.maxFrames);
    },

    animateCapturedLayouts(entity, options) {
        const prefix = `${entity}:`;

        Array.from(layoutSnapshots.keys())
            .filter((key) => key.startsWith(prefix))
            .forEach((key) => {
                const id = key.slice(prefix.length);
                scheduleLayoutAnimation(
                    entity,
                    id,
                    options?.duration,
                    options?.maxFrames,
                );
            });
    },

    removeHighlight(entity, id) {
        const key = getHighlightKey(entity, id);

        const existingTimeout = highlightTimeouts.get(key);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
            highlightTimeouts.delete(key);
        }

        set(state => {
            return { highlighted: removeEntityState(state.highlighted, entity, id) };
        });
    },

    removeRemoving(entity, id) {
        const key = getHighlightKey(entity, id);

        const existingTimeout = removingTimeouts.get(key);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
            removingTimeouts.delete(key);
        }

        set(state => {
            return { removing: removeEntityState(state.removing, entity, id) };
        });
    },

    removeMoving(entity, id) {
        const key = getHighlightKey(entity, id);

        const existingTimeout = movingTimeouts.get(key);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
            movingTimeouts.delete(key);
        }

        set(state => {
            return { moving: removeEntityState(state.moving, entity, id) };
        });
    },

    clearAll() {
        highlightTimeouts.forEach(clearTimeout);
        highlightTimeouts.clear();
        removingTimeouts.forEach(clearTimeout);
        removingTimeouts.clear();
        movingTimeouts.forEach(clearTimeout);
        movingTimeouts.clear();
        layoutAnimations.forEach((animation) => animation.cancel());
        layoutAnimations.clear();
        layoutSnapshots.clear();

        set({
            highlighted: new Map(),
            removing: new Map(),
            moving: new Map(),
        });
    },
}));
