import React from 'react';
import styled from 'styled-components';

export interface CardProps {
  className?: string;
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className = '', children }) => {
  return <StyledCard className={className}>{children}</StyledCard>;
};

export interface CardHeaderProps {
  className?: string;
  children?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ className = '', children }) => {
  return <StyledCardHeader className={className}>{children}</StyledCardHeader>;
};

export interface CardTitleProps {
  className?: string;
  children?: React.ReactNode;
}

export const CardTitle: React.FC<CardTitleProps> = ({ className = '', children }) => {
  return <StyledCardTitle className={className}>{children}</StyledCardTitle>;
};

export interface CardDescriptionProps {
  className?: string;
  children?: React.ReactNode;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ 
  className = '', 
  children 
}) => {
  return <StyledCardDescription className={className}>{children}</StyledCardDescription>;
};

export interface CardContentProps {
  className?: string;
  children?: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({ className = '', children }) => {
  return <StyledCardContent className={className}>{children}</StyledCardContent>;
};

export interface CardFooterProps {
  className?: string;
  children?: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({ className = '', children }) => {
  return <StyledCardFooter className={className}>{children}</StyledCardFooter>;
};

// Styled Components
const StyledCard = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const StyledCardHeader = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1.5rem 0.75rem 1.5rem;
`;

const StyledCardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.5;
  margin: 0;
`;

const StyledCardDescription = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0.25rem 0 0 0;
`;

const StyledCardContent = styled.div`
  padding: 1.5rem;
`;

const StyledCardFooter = styled.div`
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
`;

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
