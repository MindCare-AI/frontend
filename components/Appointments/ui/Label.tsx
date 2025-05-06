import React, { forwardRef } from 'react';
import styled from 'styled-components';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <StyledLabel 
        ref={ref}
        className={className}
        {...props}
      />
    );
  }
);

Label.displayName = 'Label';

const StyledLabel = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.5;
  color: #374151;
  margin-bottom: 0.25rem;
`;

export default Label;
