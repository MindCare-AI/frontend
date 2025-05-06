import React, { forwardRef } from 'react';
import styled from 'styled-components';

export interface CheckboxProps {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  children?: React.ReactNode;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    id, 
    checked = false, 
    onCheckedChange, 
    disabled = false, 
    className = '', 
    label,
    children 
  }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange) {
        onCheckedChange(e.target.checked);
      }
    };

    return (
      <CheckboxWrapper className={className}>
        <StyledCheckboxContainer>
          <StyledCheckboxInput
            ref={ref}
            id={id}
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
          />
          <StyledCheckboxControl>
            {checked && (
              <svg viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M8.5 2.5l-5 5-2-2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </StyledCheckboxControl>
          {(label || children) && (
            <StyledLabel htmlFor={id}>{label || children}</StyledLabel>
          )}
        </StyledCheckboxContainer>
      </CheckboxWrapper>
    );
  }
);

Checkbox.displayName = 'Checkbox';

const CheckboxWrapper = styled.div`
  display: inline-flex;
`;

const StyledCheckboxContainer = styled.div`
  display: flex;
  align-items: center;
`;

const StyledCheckboxInput = styled.input`
  cursor: pointer;
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
  top: 0;
  left: 0;

  &:focus + div {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  &:disabled + div {
    cursor: not-allowed;
    opacity: 0.5;
    background-color: #f3f4f6;
  }
`;

const StyledCheckboxControl = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
  border: 1px solid #d1d5db;
  background-color: white;
  transition: all 150ms;
  cursor: pointer;

  ${StyledCheckboxInput}:checked + & {
    border-color: #3b82f6;
    background-color: #3b82f6;
    color: white;
  }

  svg {
    width: 0.75rem;
    height: 0.75rem;
  }
`;

const StyledLabel = styled.label`
  margin-left: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  user-select: none;
`;

export default Checkbox;
