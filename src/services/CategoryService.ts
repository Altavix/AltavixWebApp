import type { CategoriesListVm } from '../types/category';
import { API_ENDPOINTS, $api } from '../config/api';

const API_URL = API_ENDPOINTS.CATEGORY;

export default class CategoryService {
  static async getAll() {
    const response = await $api.get<CategoriesListVm>(API_URL);
    return response;
  }

  static async create(title: string) {
    const response = await $api.post<string>(API_URL, { title });
    return response;
  }
}
