export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
  message: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}
