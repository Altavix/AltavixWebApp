import type { PaginatedList, ProductVm } from '../types/product';
import type { ApiResponseDto } from '../types/api';
import { API_ENDPOINTS, $api } from '../config/api';

const API_URL = API_ENDPOINTS.PRODUCT;

export default class ProductService {
  static async getAllPublic(page: number = 1, pageSize: number = 10) {
    const response = await $api.get<ApiResponseDto<PaginatedList<ProductVm>>>(API_URL, {
      params: { page, pageSize }
    });
    return response;
  }

  static async getByIdPublic(id: string) {
    const response = await $api.get<ApiResponseDto<ProductVm>>(`${API_URL}/${id}`);
    return response;
  }

  static async getAllAdmin(page: number = 1, pageSize: number = 10) {
    const response = await $api.get<ApiResponseDto<PaginatedList<ProductVm>>>(`${API_URL}/admin`, {
      params: { page, pageSize }
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
