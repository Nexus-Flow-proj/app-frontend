export interface Meta {
  total: number;
  pages: number;
  currentPage: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  error: string;
  statusCode: number;
  meta: Meta;
  data: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: Meta;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
