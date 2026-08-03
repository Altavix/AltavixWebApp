import axios from 'axios';
import { PaginatedList, ProductVm } from '../types/product';
import { ApiResponseDto } from '../types/api';

const API_URL = 'http://localhost:5052/api/Product';

const $api = axios.create({
  baseURL: API_URL
});

$api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default class ProductService {
  static async getAllPublic(page: number = 1, pageSize: number = 10) {
    const response = await $api.get<ApiResponseDto<PaginatedList<ProductVm>>>('', {
      params: { page, pageSize }
    });
    return response;
  }

  static async getByIdPublic(id: string) {
    const response = await $api.get<ApiResponseDto<ProductVm>>(`/${id}`);
    return response;
  }

  static async getAllAdmin(page: number = 1, pageSize: number = 10) {
    const response = await $api.get<ApiResponseDto<PaginatedList<ProductVm>>>('/admin', {
      params: { page, pageSize }
    });
    return response;
  }

  static async deleteProduct(id: string) {
    const response = await $api.delete<ApiResponseDto<any>>(`/${id}`);
    return response;
  }

  static async createProduct(data: any) {
    const response = await $api.post<ApiResponseDto<string>>('', data);
    return response;
  }

  static async updateProduct(data: any) {
    const response = await $api.put<ApiResponseDto<any>>('', data);
    return response;
  }
}
