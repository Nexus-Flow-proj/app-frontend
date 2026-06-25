export interface ApiResponse<T> {
  success: boolean;
  message: unknown;
  error?: unknown;
  statusCode: number;
  data: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

export interface ApiError {
  message?: unknown;
  error?: unknown;
  statusCode?: number;
}
