import React from 'react';
import styled from 'styled-components';

export interface BadgeProps {
  variant?: 'default' | 'outline' | 'success' | 'destructive' | string;
  className?: string;
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ 
  variant = 'default', 
  className = '', 
  children 
}) => {
  return (
    <StyledBadge className={`badge badge-${variant} ${className}`}>
      {children}
    </StyledBadge>
  );
};

const StyledBadge = styled.div`
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.25;
  letter-spacing: 0.025em;
  
  /* Default variant */
  &.badge-default {
    background-color: #e5e7eb;
    color: #374151;
  }
  
  /* Outline variant */
  &.badge-outline {
    background-color: transparent;
    border: 1px solid #d1d5db;
    color: #374151;
  }
  
  /* Success variant */
  &.badge-success {
    background-color: #d1fae5;
    color: #065f46;
  }
  
  /* Destructive variant */
  &.badge-destructive {
    background-color: #fee2e2;
    color: #b91c1c;
  }
`;

export default Badge;
