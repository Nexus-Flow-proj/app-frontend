import type {
  Canvas,
  CanvasConnection,
  CanvasObject,
  CanvasViewport,
} from "@/types/models/canvas";

interface SaveCanvasPayload {
  objects: CanvasObject[];
  connections: CanvasConnection[];
  viewport: CanvasViewport;
}

export const workshopService = {
  getCanvas: async (_projectId: string): Promise<Canvas> => {
    void _projectId;
    throw new Error("workshopService.getCanvas: backend not ready");
  },

  saveCanvas: async (
    _projectId: string,
    _payload: SaveCanvasPayload,
  ): Promise<void> => {
    void _projectId;
    void _payload;
    return Promise.resolve();
  },

  createObject: async (
    _projectId: string,
    _obj: Omit<CanvasObject, "id">,
  ): Promise<CanvasObject> => {
    void _projectId;
    void _obj;
    throw new Error("workshopService.createObject: backend not ready");
  },

  updateObject: async (
    _projectId: string,
    _objectId: string,
    _patch: Partial<CanvasObject>,
  ): Promise<CanvasObject> => {
    void _projectId;
    void _objectId;
    void _patch;
    throw new Error("workshopService.updateObject: backend not ready");
  },

  deleteObject: async (
    _projectId: string,
    _objectId: string,
  ): Promise<void> => {
    void _projectId;
    void _objectId;
    throw new Error("workshopService.deleteObject: backend not ready");
  },
};
