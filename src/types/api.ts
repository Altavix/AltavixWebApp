export type MessageType = 'success' | 'error' | 'info';

export interface ApiResponseDto<T = any> {
  data: T | null;
  message: string;
  messageType: MessageType;
}
