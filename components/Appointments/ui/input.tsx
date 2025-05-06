import React, { forwardRef } from 'react';
import styled from 'styled-components';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <StyledInput 
        ref={ref}
        className={className}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

const StyledInput = styled.input`
  display: flex;
  width: 100%;
  height: 2.5rem;
  padding: 0 0.75rem;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #1f2937;
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
  }

  &:disabled {
    background-color: #f1f5f9;
    opacity: 0.65;
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

export default Input;
