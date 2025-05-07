import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const Switch = () => {
  return (
    <StyledWrapper>
      <label className="switch">
        <input type="checkbox" />
        <span className="slider" />
      </label>
    </StyledWrapper>
  );
}

interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (values: number[]) => void;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue = [0],
  onValueChange,
  className = '',
}) => {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<number[]>(defaultValue);
  const actualValue = isControlled ? value : internalValue;
  const trackRef = useRef<HTMLDivElement>(null);

  // Calculate percentage of value within range
  const calculatePercentage = (val: number) => {
    return ((val - min) / (max - min)) * 100;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    const newValues = [...(isControlled ? value! : internalValue)];
    newValues[0] = newValue;

    if (!isControlled) {
      setInternalValue(newValues);
    }

    if (onValueChange) {
      onValueChange(newValues);
    }
  };

  const percentage = calculatePercentage(actualValue[0]);

  return (
    <SliderContainer className={className}>
      <SliderTrack ref={trackRef}>
        <SliderRange style={{ width: `${percentage}%` }} />
        <SliderThumb
          style={{ left: `${percentage}%` }}
          aria-label="Slider thumb"
        />
      </SliderTrack>
      <SliderInput
        type="range"
        min={min}
        max={max}
        step={step}
        value={actualValue[0]}
        onChange={handleChange}
      />
    </SliderContainer>
  );
};

const SliderContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 20px;
  touch-action: none;
  user-select: none;
`;

const SliderTrack = styled.div`
  position: relative;
  width: 100%;
  height: 4px;
  background-color: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
`;

const SliderRange = styled.div`
  position: absolute;
  height: 100%;
  background-color: #3b82f6;
`;

const SliderThumb = styled.div`
  position: absolute;
  top: 50%;
  width: 16px;
  height: 16px;
  background-color: white;
  border: 2px solid #3b82f6;
  border-radius: 50%;
  transition: transform 0.2s;
  transform: translate(-50%, -50%);

  &:hover {
    transform: translate(-50%, -50%) scale(1.1);
  }
`;

const SliderInput = styled.input`
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
`;

const StyledWrapper = styled.div`
  /* The switch - the box around the slider */
  .switch {
    font-size: 17px;
    position: relative;
    display: inline-block;
    width: 3.5em;
    height: 2em;
  }

  /* Hide default HTML checkbox */
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  /* The slider */
  .slider {
    position: absolute;
    cursor: pointer;
    inset: 0;
    border: 2px solid #414141;
    border-radius: 50px;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 1.4em;
    width: 1.4em;
    left: 0.2em;
    bottom: 0.2em;
    background-color: white;
    border-radius: inherit;
    transition: all 0.4s cubic-bezier(0.23, 1, 0.320, 1);
  }

  .switch input:checked + .slider {
    box-shadow: 0 0 20px rgba(9, 117, 241, 0.8);
    border: 2px solid #0974f1;
  }

  .switch input:checked + .slider:before {
    transform: translateX(1.5em);
  }

  .slider-container {
    position: relative;
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
  }

  .range-slider {
    -webkit-appearance: none;
    width: 100%;
    height: 10px;
    border-radius: 5px;
    background: #d3d3d3;
    outline: none;
    position: relative;
    z-index: 2;
  }

  .range-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background: #0974f1;
    cursor: pointer;
    border: 2px solid #414141;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
  }

  .range-slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }

  .range-slider::-moz-range-thumb {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background: #0974f1;
    cursor: pointer;
    border: 2px solid #414141;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
  }

  .range-slider::-moz-range-thumb:hover {
    transform: scale(1.1);
  }

  .slider-track {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    height: 2px;
    background: #0974f1;
    width: 50%;
    z-index: 1;
    pointer-events: none;
  }

  /* For focus state - accessibility */
  .range-slider:focus {
    outline: none;
  }

  .range-slider:focus::-webkit-slider-thumb {
    box-shadow: 0 0 20px rgba(9, 117, 241, 0.8);
    border: 2px solid #0974f1;
  }
`;

export { Switch };
