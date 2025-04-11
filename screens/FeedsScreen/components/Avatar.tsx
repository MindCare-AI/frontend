import React from 'react';
import { cn } from '../../../lib/utils';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Avatar = ({ src, alt, size = 'md', className }: AvatarProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn(
      'rounded-full overflow-hidden bg-mindcare-lavender flex-shrink-0',
      sizeClasses[size],
      className
    )}>
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-cover"
        onError={(e) => {
          // Fallback to first letter of name if image fails to load
          const target = e.target as HTMLImageElement;
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          canvas.width = 100;
          canvas.height = 100;
          
          if (context) {
            context.fillStyle = '#8B5CF6';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = '#FFFFFF';
            context.font = 'bold 50px sans-serif';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(alt.charAt(0).toUpperCase(), 50, 50);
            
            target.src = canvas.toDataURL();
          }
        }}
      />
    </div>
  );
};

export default Avatar;