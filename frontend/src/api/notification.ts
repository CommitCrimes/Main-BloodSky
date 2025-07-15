import { api } from './api';
import type { Notification } from '../types/notification';

export const notificationApi = {
  getUserNotifications: async (limit: number = 20): Promise<Notification[]> => {
    const response = await api.get(`/notifications?limit=${limit}`);
    return response.data;
  },

  getUnreadCount: async (): Promise<{ unreadCount: number }> => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (notificationId: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/notifications/mark-all-read');
    return response.data;
  }
};