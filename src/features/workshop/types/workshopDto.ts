export interface CreateTaskCardPayload {
  featureId: string;
  title: string;
  description?: string;
  dueDate?: string;
  position: { x: number; y: number };
}

export interface UpdateTaskCardPayload {
  featureId?: string;
  title?: string;
  description?: string;
  dueDate?: string | null;
}

export interface CreateStickyNotePayload {
  content: string;
  color: string;
  position: { x: number; y: number };
}

export interface CreateSectionFramePayload {
  title: string;
  backgroundColor: string;
  borderColor: string;
  position: { x: number; y: number };
  width: number;
  height: number;
}
