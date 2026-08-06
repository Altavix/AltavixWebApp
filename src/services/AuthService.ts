import { API_ENDPOINTS, $api } from '../config/api';

const API_URL = API_ENDPOINTS.AUTH;

export default class AuthService {
  static async login(email: string, password: string): Promise<any> {
    const response = await $api.post(`${API_URL}/login`, {
      email,
      password
    });
    return response;
  }

  static async register(name: string, email: string, password: string, surname?: string, middleName?: string, phone?: string): Promise<any> {
    const response = await $api.post(`${API_URL}/register`, {
      email,
      firstName: name,
      lastName: surname || '',
      middleName: middleName || '',
      phoneNumber: phone || '',
      password,
      confirmPassword: password
    });
    return response;
  }

  static async registerAdmin(data: any) {
    const response = await $api.post(`${API_URL}/register-admin`, data);
    return response;
  }

  static async logout(): Promise<any> {
    const response = await $api.post(`${API_URL}/logout`);
    return response;
  }
}
