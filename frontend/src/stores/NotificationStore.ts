import { makeAutoObservable, runInAction } from 'mobx';
import { notificationApi } from '../api/notification';
import type { Notification } from '../types/notification';

export class NotificationStore {
  notifications: Notification[] = [];
  unreadCount: number = 0;
  isLoading: boolean = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchNotifications(limit: number = 20) {
    this.isLoading = true;
    this.error = null;
    
    try {
      const notifications = await notificationApi.getUserNotifications(limit);
      const unreadData = await notificationApi.getUnreadCount();
      
      runInAction(() => {
        this.notifications = notifications;
        this.unreadCount = unreadData.unreadCount;
        this.isLoading = false;
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      runInAction(() => {
        this.error = 'Impossible de charger les notifications';
        this.isLoading = false;
      });
    }
  }

  async refreshUnreadCount() {
    try {
      const unreadData = await notificationApi.getUnreadCount();
      runInAction(() => {
        this.unreadCount = unreadData.unreadCount;
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du nombre de notifications non lues:', error);
    }
  }

  async markAsRead(notificationId: number) {
    try {
      await notificationApi.markAsRead(notificationId);
      
      runInAction(() => {
        const notification = this.notifications.find(n => n.notificationId === notificationId);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
      });
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
      runInAction(() => {
        this.error = 'Impossible de marquer la notification comme lue';
      });
    }
  }

  async markAllAsRead() {
    try {
      await notificationApi.markAllAsRead();
      
      runInAction(() => {
        this.notifications.forEach(notification => {
          if (!notification.isRead) {
            notification.isRead = true;
            notification.readAt = new Date().toISOString();
          }
        });
        this.unreadCount = 0;
      });
    } catch (error) {
      console.error('Erreur lors du marquage global comme lu:', error);
      runInAction(() => {
        this.error = 'Impossible de marquer toutes les notifications comme lues';
      });
    }
  }

  get notificationsByPriority() {
    return this.notifications.slice().sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  get unreadNotifications() {
    return this.notifications.filter(n => !n.isRead);
  }

  get urgentNotifications() {
    return this.notifications.filter(n => n.priority === 'urgent' && !n.isRead);
  }

  clearError() {
    this.error = null;
  }
}