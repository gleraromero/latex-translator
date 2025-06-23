import React from 'react';
import { LatexElement, highlightLatexText, highlightWithDetailedValidation } from '../utils/latexParser';

interface LatexDisplayProps {
  text: string;
  elements: LatexElement[];
  missingElements?: LatexElement[];
  translatedText?: string;
  className?: string;
}

const LatexDisplay: React.FC<LatexDisplayProps> = ({ 
  text, 
  elements, 
  missingElements = [], 
  translatedText = '',
  className = '' 
}) => {
  const highlightedText = missingElements.length > 0
    ? highlightWithDetailedValidation(text, elements, missingElements, translatedText)
    : highlightLatexText(text, elements);

  return (
    <div 
      className={`latex-display ${className}`}
      dangerouslySetInnerHTML={{ __html: highlightedText }}
    />
  );
};

export default LatexDisplay; 