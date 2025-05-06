"use client"

import React, { createContext, useState, useContext } from 'react';
import styled from 'styled-components';

import { cn } from "../../../lib/Appointments/utils"

// TabsContext for managing tab state
interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

// Tabs component
export interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ 
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className = '' 
}) => {
  const [uncontrolledValue, setUncontrolledValue] = useState<string>(defaultValue || '');

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;
  
  const handleValueChange = (newValue: string) => {
    if (!isControlled) {
      setUncontrolledValue(newValue);
    }
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <StyledTabs className={className}>{children}</StyledTabs>
    </TabsContext.Provider>
  );
};

// TabsList component
export interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

export const TabsList: React.FC<TabsListProps> = ({ className = '', children }) => {
  return <StyledTabsList className={className}>{children}</StyledTabsList>;
};

// TabsTrigger component
export interface TabsTriggerProps {
  value: string;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ 
  value, 
  className = '', 
  disabled = false, 
  children 
}) => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('TabsTrigger must be used within a Tabs component');
  }

  const { value: selectedValue, onValueChange } = context;
  const isSelected = selectedValue === value;

  return (
    <StyledTabsTrigger
      className={`${className} ${isSelected ? 'selected' : ''}`}
      disabled={disabled}
      onClick={() => !disabled && onValueChange(value)}
    >
      {children}
    </StyledTabsTrigger>
  );
};

// TabsContent component
export interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export const TabsContent: React.FC<TabsContentProps> = ({ 
  value, 
  className = '', 
  children 
}) => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('TabsContent must be used within a Tabs component');
  }

  const { value: selectedValue } = context;
  const isSelected = selectedValue === value;

  if (!isSelected) return null;
  
  return <StyledTabsContent className={className}>{children}</StyledTabsContent>;
};

// Styled Components
const StyledTabs = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledTabsList = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const StyledTabsTrigger = styled.button`
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  background-color: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.selected {
    color: #3b82f6;
    background-color: #eff6ff;
    font-weight: 600;
  }
  
  &:hover:not(.selected):not([disabled]) {
    background-color: #f3f4f6;
  }
  
  &[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StyledTabsContent = styled.div`
  margin-top: 1rem;
`;
