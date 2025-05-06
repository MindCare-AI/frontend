import React, { forwardRef } from 'react';
import styled from 'styled-components';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <StyledTextarea 
        ref={ref}
        className={className}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

const StyledTextarea = styled.textarea`
  display: block;
  width: 100%;
  min-height: 80px;
  padding: 0.75rem;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #1f2937;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  resize: vertical;

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

export default Textarea;
