import { API_ENDPOINTS, $api } from '../config/api';
import type { CharacteristicsListVm, CharacteristicDto } from '../types/characteristic';
import type { ApiResponseDto } from '../types/api';

const API_URL = API_ENDPOINTS.CHARACTERISTICS;

export default class CharacteristicService {
  static async getAll(includeDisabled: boolean = true) {
    const response = await $api.get<ApiResponseDto<CharacteristicsListVm>>(`${API_URL}?includeDisabled=${includeDisabled}`);
    return response;
  }

  static async getById(id: string) {
    const response = await $api.get<ApiResponseDto<CharacteristicDto>>(`${API_URL}/${id}`);
    return response;
  }

  static async create(data: { name: string; enabled: boolean }) {
    const response = await $api.post<ApiResponseDto<string>>(API_URL, data);
    return response;
  }

  static async update(id: string, data: { id: string; name: string; enabled: boolean }) {
    const response = await $api.put<ApiResponseDto<boolean>>(`${API_URL}/${id}`, data);
    return response;
  }

  static async delete(id: string) {
    const response = await $api.delete<ApiResponseDto<boolean>>(`${API_URL}/${id}`);
    return response;
  }
}
