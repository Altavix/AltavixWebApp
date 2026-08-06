import { useState } from 'react';
import { useToast } from './useToast';
import type { ApiResponseDto } from '../types/api';

export const useFetching = <T>(callback: (...args: any[]) => Promise<any>) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { showToast } = useToast();

  const fetching = async (...args: any[]): Promise<ApiResponseDto<T>> => {
    try {
      setIsLoading(true);
      const response = await callback(...args);
      
      const backendData = response?.data;
      
      if (backendData && backendData.messageType) {
        if (backendData.messageType === 'success' && backendData.message) {
          showToast(backendData.message, 'success');
        }
        return backendData as ApiResponseDto<T>;
      }
      
      return {
        data: backendData || null,
        message: 'Операцію виконано успішно',
        messageType: 'success'
      };
    } catch (e: any) {
      const backendError = e.response?.data;
      
      if (backendError && backendError.messageType) {
        showToast(backendError.message, backendError.messageType);
        return backendError as ApiResponseDto<T>;
      }

      const fallbackError: ApiResponseDto<T> = {
        data: null,
        message: e.message || 'Помилка з\'єднання з сервером',
        messageType: 'error'
      };
      
      showToast(fallbackError.message, 'error');
      return fallbackError;
    } finally {
      setIsLoading(false);
    }
  };

  return [fetching, isLoading] as const;
};
