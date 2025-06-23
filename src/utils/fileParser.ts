import { TexFile, Paragraph } from '../types';

// Simple ID generator
const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

export const parseTexFile = (content: string, fileName: string): TexFile => {
  // Split content into paragraphs (separated by double newlines)
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  const parsedParagraphs: Paragraph[] = paragraphs.map((paragraph, index) => {
    const trimmedParagraph = paragraph.trim();
    return {
      id: generateId(),
      originalText: trimmedParagraph,
      translatedText: '',
      latexElements: [], // Will be populated in Phase 3
      startIndex: content.indexOf(trimmedParagraph),
      endIndex: content.indexOf(trimmedParagraph) + trimmedParagraph.length
    };
  });

  return {
    id: generateId(),
    name: fileName,
    originalContent: content,
    paragraphs: parsedParagraphs,
    createdAt: new Date()
  };
};

export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve(content);
    };
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}; 