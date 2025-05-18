import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export const formatTime = (timestamp: string | number | Date): string => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const formattedHours = hours % 12 || 12;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

export const formatRelativeTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  
  if (isToday(date)) {
    return format(date, 'HH:mm');
  }
  
  if (isYesterday(date)) {
    return 'Yesterday ' + format(date, 'HH:mm');
  }

  const distance = formatDistanceToNow(date, { addSuffix: true });
  if (distance.includes('less than')) {
    return 'Just now';
  }

  return distance;
};

export const formatMessageTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return format(date, 'HH:mm');
};

export const formatMessageDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  
  if (isToday(date)) {
    return 'Today';
  }
  
  if (isYesterday(date)) {
    return 'Yesterday';
  }

  return format(date, 'MMMM d, yyyy');
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const groupMessagesByDate = (messages: any[]) => {
  const groups = new Map();
  
  messages.forEach(message => {
    const date = formatMessageDate(message.timestamp);
    if (!groups.has(date)) {
      groups.set(date, []);
    }
    groups.get(date).push(message);
  });

  return Array.from(groups.entries()).map(([date, messages]) => ({
    date,
    messages,
  }));
};

export const isImageFile = (fileName: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const extension = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));
  return imageExtensions.includes(extension);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getMessageStatus = (
  message: any,
  isOnline: boolean,
  isSending: boolean
): 'sending' | 'sent' | 'delivered' | 'read' | 'failed' => {
  if (isSending) return 'sending';
  if (!isOnline) return 'sent';
  if (message.is_read) return 'read';
  if (message.is_delivered) return 'delivered';
  if (message.failed) return 'failed';
  return 'sent';
};