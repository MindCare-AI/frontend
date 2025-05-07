import React, { forwardRef, ReactElement } from 'react';
import styled from 'styled-components';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'icon';
  asChild?: boolean;
  className?: string;
  children?: ReactElement | React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'default', 
    size = 'default', 
    asChild = false,
    className = '', 
    children,
    ...props 
  }, ref) => {
    
    // If asChild is true, clone the first child element and pass props to it
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as ReactElement, {
        ...props,
        className: `button button-${variant} button-${size} ${className} ${children.props.className || ''}`
      });
    }
    
    return (
      <StyledButton
        ref={ref}
        className={`button button-${variant} button-${size} ${className}`}
        variant={variant}
        size={size}
        {...props}
      >
        {children}
      </StyledButton>
    );
  }
);

Button.displayName = 'Button';

const StyledButton = styled.button<{ variant: string; size: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  font-weight: 500;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  cursor: pointer;
  
  /* Variant Styles */
  &.button-default {
    background-color: #2563eb;
    color: white;
    
    &:hover:not(:disabled) {
      background-color: #1d4ed8;
    }
    
    &:focus-visible {
      outline: 2px solid #2563eb;
      outline-offset: 2px;
    }
  }
  
  &.button-destructive {
    background-color: #ef4444;
    color: white;
    
    &:hover:not(:disabled) {
      background-color: #dc2626;
    }
    
    &:focus-visible {
      outline: 2px solid #ef4444;
      outline-offset: 2px;
    }
  }
  
  &.button-outline {
    border: 1px solid #d1d5db;
    background-color: transparent;
    color: #374151;
    
    &:hover:not(:disabled) {
      background-color: #f3f4f6;
      color: #111827;
    }
    
    &:focus-visible {
      outline: 2px solid #d1d5db;
      outline-offset: 2px;
    }
  }
  
  &.button-ghost {
    background-color: transparent;
    color: #374151;
    
    &:hover:not(:disabled) {
      background-color: #f3f4f6;
    }
    
    &:focus-visible {
      outline: 2px solid #d1d5db;
      outline-offset: 2px;
    }
  }
  
  /* Size Styles */
  &.button-default {
    height: 2.5rem;
    padding: 0 1rem;
    font-size: 0.875rem;
    gap: 0.5rem;
  }
  
  &.button-sm {
    height: 2rem;
    padding: 0 0.75rem;
    font-size: 0.75rem;
    gap: 0.25rem;
  }
  
  &.button-icon {
    height: 2.5rem;
    width: 2.5rem;
    padding: 0;
  }
  
  /* Disabled State */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default Button;