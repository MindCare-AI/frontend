//utils/helpers.ts
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
  
  return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
};

export const getInitials = (name: string): string => {
  if (!name) return '';
  
  return name.split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
};

// Add a new utility function for handling message timestamp display with relative time
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  return formatTime(dateString);
};