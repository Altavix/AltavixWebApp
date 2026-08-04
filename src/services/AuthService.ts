import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const API_URL = API_ENDPOINTS.AUTH;

export default class AuthService {
  static async login(email: string, password: string): Promise<any> {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password
    });
    return response;
  }

  static async register(name: string, email: string, password: string, surname?: string, middleName?: string, phone?: string): Promise<any> {
    const response = await axios.post(`${API_URL}/register`, {
      email,
      firstName: name,
      lastName: surname || '',
      middleName: middleName || '',
      phoneNumber: phone || '',
      password,
      confirmPassword: password // Відправляємо на бекенд підтвердження, оскільки ми перевіряємо його на фронті
    });
    return response;
  }

  static async registerAdmin(data: any) {
    const response = await axios.post(`${API_URL}/register-admin`, data);
    return response;
  }
}
