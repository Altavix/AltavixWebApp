import type { PaginatedList, ProductVm } from '../types/product';
import type { ApiResponseDto } from '../types/api';
import { API_ENDPOINTS, $api } from '../config/api';

const API_URL = API_ENDPOINTS.PRODUCT;

export interface ProductFilters {
  page?: number;
  pageSize?: number;
  minPrice?: number;
  maxPrice?: number;
  brandIds?: string[];
  categoryIds?: string[];
  characteristics?: Record<string, string[]>;
  searchTerm?: string;
}

export default class ProductService {
  static async getAllPublic(filters: ProductFilters = { page: 1, pageSize: 10 }) {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    
    if (filters.brandIds) {
      filters.brandIds.forEach(id => params.append('brandIds', id));
    }
    
    if (filters.searchTerm) {
      params.append('searchTerm', filters.searchTerm);
    }

    const response = await $api.get<ApiResponseDto<PaginatedList<ProductVm>>>(`${API_URL}?${params.toString()}`);
    return response;
  }

  static async getMaxPrice() {
    const response = await $api.get<ApiResponseDto<number>>(`${API_URL}/max-price`);
    return response;
  }

  static async getByIdPublic(id: string) {
    const response = await $api.get<ApiResponseDto<ProductVm>>(`${API_URL}/${id}`);
    return response;
  }

  static async getAllAdmin(filters: ProductFilters & { page?: number; pageSize?: number }) {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.brandIds && filters.brandIds.length > 0) {
      filters.brandIds.forEach(id => params.append('brandIds', id));
    }
    
    if (filters.searchTerm) {
      params.append('searchTerm', filters.searchTerm);
    }
    if (filters.characteristics && Object.keys(filters.characteristics).length > 0) {
      params.append('characteristicsJson', JSON.stringify(filters.characteristics));
    }

    const response = await $api.get<ApiResponseDto<PaginatedList<ProductVm>>>(`${API_ENDPOINTS.PRODUCT}/admin`, {
      params: params
    });
    return response;
  }

  static async deleteProduct(id: string) {
    const response = await $api.delete<ApiResponseDto<any>>(`${API_URL}/${id}`);
    return response;
  }

  static async createProduct(data: any) {
    const response = await $api.post<ApiResponseDto<string>>(API_URL, data);
    return response;
  }

  static async updateProduct(data: any) {
    const response = await $api.put<ApiResponseDto<any>>(API_URL, data);
    return response;
  }
}
