import axios from 'axios';
import type { CategoriesListVm } from '../types/category';
import type { ApiResponseDto } from '../types/api';
import { API_ENDPOINTS } from '../config/api';

const API_URL = API_ENDPOINTS.CATEGORY;

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

export default class CategoryService {
  static async getAll() {
    const response = await $api.get<ApiResponseDto<CategoriesListVm>>('');
    return response;
  }
}
