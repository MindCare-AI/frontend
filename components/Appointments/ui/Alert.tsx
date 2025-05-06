import React from 'react';
import styled from 'styled-components';

export interface AlertProps {
  variant?: 'default' | 'destructive' | 'success';
  className?: string;
  children?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ 
  variant = 'default', 
  className = '', 
  children 
}) => {
  return (
    <StyledAlert className={`alert-${variant} ${className}`}>
      {children}
    </StyledAlert>
  );
};

export interface AlertTitleProps {
  className?: string;
  children?: React.ReactNode;
}

export const AlertTitle: React.FC<AlertTitleProps> = ({ className = '', children }) => {
  return <StyledAlertTitle className={className}>{children}</StyledAlertTitle>;
};

export interface AlertDescriptionProps {
  className?: string;
  children?: React.ReactNode;
}

export const AlertDescription: React.FC<AlertDescriptionProps> = ({ 
  className = '', 
  children 
}) => {
  return <StyledAlertDescription className={className}>{children}</StyledAlertDescription>;
};

const StyledAlert = styled.div`
  position: relative;
  width: 100%;
  padding: 1rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;

  &.alert-default {
    background-color: #f3f4f6;
    border: 1px solid #e5e7eb;
  }

  &.alert-destructive {
    background-color: #fee2e2;
    border: 1px solid #fecaca;
    color: #b91c1c;
  }
  
  &.alert-success {
    background-color: #d1fae5;
    border: 1px solid #a7f3d0;
    color: #065f46;
  }
`;

const StyledAlertTitle = styled.h5`
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.5;
  margin: 0 0 0.25rem 0;
`;

const StyledAlertDescription = styled.div`
  font-size: 0.875rem;
  line-height: 1.5;
`;
