export interface Notification {
    id: string;
    title: string;
    message: string;
    notification_type: {
      name: string;
      description: string;
    };
    read: boolean;
    priority: 'low' | 'medium' | 'high' | 'critical';
    created_at: string;
    timestamp?: string; // optional field from backend
    metadata?: Record<string, any>;
}

export interface NotificationPreference {
    type: string;
    description: string;
    isEnabled: boolean;
    is_global?: boolean;
}