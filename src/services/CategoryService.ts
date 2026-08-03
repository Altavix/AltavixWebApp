import axios from 'axios';
import { CategoriesListVm } from '../types/category';
import { ApiResponseDto } from '../types/api';

const API_URL = 'http://localhost:5052/api/Category';

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
