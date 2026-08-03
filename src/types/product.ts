export interface ProductVm {
  id: string;
  title: string;
  description: string;
  price: number;
  priceCoin: number;
  categoryIds: string[];
  images: string[];
}

export interface PaginatedList<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
