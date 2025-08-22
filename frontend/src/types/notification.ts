export interface Notification {
  notificationId: number;
  userId: number;
  hospitalId?: number;
  centerId?: number;
  type:
    | 'delivery_request'
    | 'delivery_status'
    | 'in_transit'
    | 'delivered'
    | 'cancelled'
    | 'stock_alert'
    | 'system'
    | 'user'
    | 'accepted_center'
    | 'refused_center'
    | 'accepted_dronist'
    | 'refused_dronist';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  deliveryId?: number;
  createdAt: string;
  readAt?: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}