import type {
  CanvasPoint,
  MiniCanvasObject,
  MiniConnection,
  MiniShapeKind,
  WhiteboardTemplate,
} from "../types";
import {
  createFrameObject,
  createMiniId,
  createShapeObject,
  createStickyObject,
  createTextObject,
} from "../utils/objectFactory";

function shape(
  origin: CanvasPoint,
  x: number,
  y: number,
  label: string,
  fill: string,
  kind: MiniShapeKind = "rounded-rectangle",
  width = 220,
  height = 110,
  zIndex = 1,
) {
  const object = createShapeObject({ x: origin.x + x, y: origin.y + y }, kind, zIndex);
  object.width = width;
  object.height = height;
  object.style.fill = fill;
  object.data.text = label;
  return object;
}

function sticky(origin: CanvasPoint, x: number, y: number, text: string, fill: string, zIndex: number) {
  const object = createStickyObject({ x: origin.x + x, y: origin.y + y }, zIndex, fill);
  object.data.text = text;
  return object;
}

function connection(sourceObjectId: string, targetObjectId: string, label = ""): MiniConnection {
  return {
    id: createMiniId("connection"),
    sourceObjectId,
    targetObjectId,
    sourceAnchor: "auto",
    targetAnchor: "auto",
    routing: "curved",
    label,
    stroke: "#8b5cf6",
    strokeWidth: 2,
  };
}

function connected(objects: MiniCanvasObject[], pairs: Array<[number, number, string?]>) {
  return {
    objects,
    connections: pairs.map(([from, to, label]) => connection(objects[from].id, objects[to].id, label)),
  };
}

export const MINI_WORKSHOP_TEMPLATES: WhiteboardTemplate[] = [
  {
    id: "mind-map",
    name: "Mind map",
    description: "Explore one central idea through connected branches.",
    category: "Explore",
    accent: "#8b5cf6",
    build: (origin) => connected([
      shape(origin, 330, 190, "Central idea", "#ede9fe", "ellipse", 240, 130, 5),
      shape(origin, 0, 0, "Theme A", "#dbeafe"),
      shape(origin, 660, 0, "Theme B", "#dcfce7"),
      shape(origin, 0, 410, "Theme C", "#fef3c7"),
      shape(origin, 660, 410, "Theme D", "#ffe4e6"),
    ], [[0, 1], [0, 2], [0, 3], [0, 4]]),
  },
  {
    id: "flowchart",
    name: "Flowchart",
    description: "Map a process with decisions and clear outcomes.",
    category: "Plan",
    accent: "#2563eb",
    build: (origin) => connected([
      shape(origin, 0, 140, "Start", "#dcfce7", "ellipse"),
      shape(origin, 320, 140, "Process step", "#dbeafe"),
      shape(origin, 640, 120, "Decision?", "#fef3c7", "diamond", 220, 150),
      shape(origin, 980, 0, "Success", "#dcfce7"),
      shape(origin, 980, 290, "Review", "#ffe4e6"),
    ], [[0, 1], [1, 2], [2, 3, "Yes"], [2, 4, "No"]]),
  },
  {
    id: "brainstorm",
    name: "Brainstorm",
    description: "Capture ideas quickly and organize them into themes.",
    category: "Explore",
    accent: "#f59e0b",
    build: (origin) => {
      const heading = createTextObject(origin, 10);
      heading.width = 900;
      heading.data.text = "Brainstorm · What are we solving?";
      return { objects: [heading,
        sticky(origin, 0, 100, "Idea 1", "#fef3c7", 1),
        sticky(origin, 250, 100, "Idea 2", "#dbeafe", 2),
        sticky(origin, 500, 100, "Idea 3", "#dcfce7", 3),
        sticky(origin, 750, 100, "Wild idea", "#fae8ff", 4),
        sticky(origin, 125, 310, "Question", "#ffe4e6", 5),
        sticky(origin, 625, 310, "Opportunity", "#ffedd5", 6),
      ], connections: [] };
    },
  },
  {
    id: "kanban",
    name: "Visual Kanban",
    description: "Arrange visual notes without changing Team Board tasks.",
    category: "Plan",
    accent: "#06b6d4",
    build: (origin) => {
      const objects: MiniCanvasObject[] = [];
      ["To do", "In progress", "Done"].forEach((title, index) => {
        const frame = createFrameObject({ x: origin.x + index * 350, y: origin.y }, index + 1, title);
        frame.width = 320; frame.height = 540;
        objects.push(frame,
          sticky(origin, index * 350 + 45, 95, "Add an item", "#ffffff", 20 + index * 2),
          sticky(origin, index * 350 + 45, 285, "Add an item", "#ffffff", 21 + index * 2));
      });
      return { objects, connections: [] };
    },
  },
  {
    id: "retrospective",
    name: "Retrospective",
    description: "Reflect on wins, challenges, ideas, and actions.",
    category: "Analyze",
    accent: "#10b981",
    build: (origin) => {
      const colors = ["#dcfce7", "#ffe4e6", "#dbeafe", "#fef3c7"];
      return { objects: ["Went well", "Could improve", "Ideas", "Actions"].flatMap((title, index) => {
        const x = (index % 2) * 450; const y = Math.floor(index / 2) * 340;
        return [shape(origin, x, y, title, colors[index], "rounded-rectangle", 410, 80, index + 1), sticky(origin, x + 100, y + 110, "Add a note", "#ffffff", 10 + index)];
      }), connections: [] };
    },
  },
  {
    id: "user-story-map",
    name: "User-story map",
    description: "Connect user activities, steps, and release stories.",
    category: "Plan",
    accent: "#ec4899",
    build: (origin) => {
      const objects: MiniCanvasObject[] = [shape(origin, 0, 0, "User goal", "#fae8ff", "rounded-rectangle", 1020, 80, 1)];
      ["Activity A", "Activity B", "Activity C"].forEach((title, index) => objects.push(
        shape(origin, index * 350, 120, title, "#dbeafe", "rounded-rectangle", 320, 85, 2 + index),
        sticky(origin, index * 350 + 55, 245, "User story", "#fef3c7", 10 + index * 2),
        sticky(origin, index * 350 + 55, 435, "User story", "#ffffff", 11 + index * 2),
      ));
      return { objects, connections: [] };
    },
  },
  {
    id: "customer-journey",
    name: "Customer journey",
    description: "Trace stages, actions, feelings, and opportunities.",
    category: "Analyze",
    accent: "#f97316",
    build: (origin) => ({ objects: ["Discover", "Consider", "Use", "Return"].flatMap((title, index) => [
      shape(origin, index * 285, 0, title, "#ffedd5", "rounded-rectangle", 255, 80, index + 1),
      sticky(origin, index * 285 + 20, 120, "Customer action", "#ffffff", 10 + index * 2),
      sticky(origin, index * 285 + 20, 315, "Feeling / insight", "#fef3c7", 11 + index * 2),
    ]), connections: [] }),
  },
  {
    id: "swot",
    name: "SWOT analysis",
    description: "Compare strengths, weaknesses, opportunities, and threats.",
    category: "Analyze",
    accent: "#6366f1",
    build: (origin) => ({ objects: [
      shape(origin, 0, 0, "STRENGTHS\n\n• Add strength\n• Add advantage", "#dcfce7", "rounded-rectangle", 420, 290, 1),
      shape(origin, 460, 0, "WEAKNESSES\n\n• Add weakness\n• Add limitation", "#ffe4e6", "rounded-rectangle", 420, 290, 2),
      shape(origin, 0, 330, "OPPORTUNITIES\n\n• Add opportunity\n• Add trend", "#dbeafe", "rounded-rectangle", 420, 290, 3),
      shape(origin, 460, 330, "THREATS\n\n• Add threat\n• Add risk", "#fef3c7", "rounded-rectangle", 420, 290, 4),
    ], connections: [] }),
  },
];
