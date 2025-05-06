import React from 'react';
import styled from 'styled-components';

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

const Separator: React.FC<SeparatorProps> = ({
  orientation = 'horizontal',
  className = '',
}) => {
  return (
    <StyledSeparator 
      className={className} 
      orientation={orientation}
    />
  );
};

const StyledSeparator = styled.div<{ orientation: 'horizontal' | 'vertical' }>`
  ${props => props.orientation === 'horizontal' ? `
    height: 1px;
    width: 100%;
    margin: 1rem 0;
  ` : `
    height: 100%;
    width: 1px;
    margin: 0 1rem;
  `}
  
  background-color: #e2e8f0;
  flex-shrink: 0;
`;

export default Separator;
