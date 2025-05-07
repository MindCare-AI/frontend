import React, { useState, createContext, useContext } from 'react';
import styled from 'styled-components';
import { ChevronDown } from 'lucide-react';

// Context for Select component
type SelectContextType = {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const SelectContext = createContext<SelectContextType | undefined>(undefined);

// SelectTrigger component
interface SelectTriggerProps {
  className?: string;
  children: React.ReactNode;
  id?: string;
}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({ className = '', children, id }) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectTrigger must be used within a Select component');

  return (
    <StyledSelectTrigger 
      className={className} 
      onClick={() => context.setOpen(!context.open)}
      id={id}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </StyledSelectTrigger>
  );
};

// SelectValue component
interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder = '', className = '' }) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectValue must be used within a Select component');

  return (
    <StyledSelectValue className={className}>
      {context.value || placeholder}
    </StyledSelectValue>
  );
};

// SelectContent component
interface SelectContentProps {
  className?: string;
  children: React.ReactNode;
}

export const SelectContent: React.FC<SelectContentProps> = ({ className = '', children }) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectContent must be used within a Select component');

  if (!context.open) return null;

  return (
    <StyledSelectContentBackdrop onClick={() => context.setOpen(false)}>
      <StyledSelectContent 
        className={className}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </StyledSelectContent>
    </StyledSelectContentBackdrop>
  );
};

// SelectItem component
interface SelectItemProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export const SelectItem: React.FC<SelectItemProps> = ({ value, className = '', children }) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectItem must be used within a Select component');

  const isSelected = context.value === value;

  return (
    <StyledSelectItem 
      className={`${className} ${isSelected ? 'selected' : ''}`}
      onClick={() => {
        context.onValueChange(value);
        context.setOpen(false);
      }}
    >
      {children}
    </StyledSelectItem>
  );
};

// Select component
interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ 
  value: controlledValue, 
  defaultValue = '', 
  onValueChange, 
  className = '',
  children 
}) => {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const handleValueChange = (newValue: string) => {
    if (!isControlled) {
      setUncontrolledValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <SelectContext.Provider value={{ value, onValueChange: handleValueChange, open, setOpen }}>
      <StyledSelect className={className}>
        {children}
      </StyledSelect>
    </SelectContext.Provider>
  );
};

// Styled components
const StyledSelect = styled.div`
  position: relative;
  width: 100%;
`;

const StyledSelectTrigger = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
  }
`;

const StyledSelectValue = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledSelectContentBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
`;

const StyledSelectContent = styled.div`
  position: absolute;
  z-index: 100;
  min-width: 8rem;
  width: var(--radix-select-trigger-width);
  max-height: var(--radix-select-content-available-height);
  margin-top: 8px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transform-origin: top;
`;

const StyledSelectItem = styled.div`
  position: relative;
  display: flex;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  cursor: pointer;
  user-select: none;
  outline: none;

  &:hover {
    background-color: #f3f4f6;
  }

  &.selected {
    font-weight: 500;
    background-color: #f3f4f6;
  }
`;
