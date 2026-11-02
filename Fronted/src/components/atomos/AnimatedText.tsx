import React, { useState } from "react";
import styled from "styled-components";
import { useTheme } from "styled-components";

interface AnimatedTextProps {
  text: string;
  textClassName?: string;
  underlineClassName?: string;
  underlinePath?: string;
  underlineHoverPath?: string;
  underlineDuration?: number;
  fontSize?: string;
}

const slideIn = () => `
  @keyframes slideIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const drawPath = (duration: number) => `
  @keyframes drawPath {
    from {
      stroke-dasharray: 1000;
      stroke-dashoffset: 1000;
      opacity: 0;
    }
    to {
      stroke-dasharray: 1000;
      stroke-dashoffset: 0;
      opacity: 1;
    }
  }
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const AnimatedHeading = styled.h1<{ fontSize?: string }>`
  font-size: ${props => props.fontSize || "48px"};
  font-weight: 700;
  text-align: center;
  color: ${({ theme }) => theme.text};
  margin: 0;
  animation: slideIn 0.6s ease-out forwards;
  
  ${slideIn()}
`;

const SvgContainer = styled.svg<{ $isHovering?: boolean }>`
  color: ${({ theme }) => theme.text};
  transition: all 0.3s ease-in-out;
`;

const AnimatedPath = styled.path<{ $duration: number; $isHovering?: boolean }>`
  stroke: currentColor;
  stroke-width: 2;
  fill: none;
  animation: drawPath ${props => props.$duration}s ease-in-out forwards;
  transition: d 0.8s ease-in-out;
  
  ${props => drawPath(props.$duration)}
`;

export const AnimatedText = React.forwardRef<HTMLDivElement, AnimatedTextProps>(
  (
    {
      text,
      textClassName,
      underlineClassName,
      underlinePath = "M 0,10 Q 75,0 150,10 Q 225,20 300,10",
      underlineHoverPath = "M 0,10 Q 75,20 150,10 Q 225,0 300,10",
      underlineDuration = 1.5,
      fontSize,
    },
    ref
  ) => {
    const [isHovering, setIsHovering] = useState(false);
    const theme = useTheme();

    return (
      <TextContainer ref={ref} className={textClassName}>
        <div 
          style={{ position: "relative" }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <AnimatedHeading fontSize={fontSize}>
            {text}
          </AnimatedHeading>

          <SvgContainer
            width="100%"
            height="20"
            viewBox="0 0 300 20"
            style={{ position: "absolute", bottom: "-16px", left: "0" }}
            className={underlineClassName}
            $isHovering={isHovering}
          >
            <AnimatedPath
              d={isHovering ? underlineHoverPath : underlinePath}
              $duration={underlineDuration}
              $isHovering={isHovering}
            />
          </SvgContainer>
        </div>
      </TextContainer>
    );
  }
);

AnimatedText.displayName = "AnimatedText";
