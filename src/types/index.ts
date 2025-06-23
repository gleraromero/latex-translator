export interface TexFile {
  id: string;
  name: string;
  originalContent: string;
  paragraphs: Paragraph[];
  createdAt: Date;
}

export interface Paragraph {
  id: string;
  originalText: string;
  translatedText: string;
  latexElements: LatexElement[];
  startIndex: number;
  endIndex: number;
}

export interface LatexElement {
  content: string;
  startIndex: number;
  endIndex: number;
  type: 'command' | 'environment' | 'math' | 'other';
}

export interface LocalStorageData {
  files: TexFile[];
  currentFileId: string | null;
  translations: Record<string, Record<string, string>>; // fileId -> paragraphId -> translation
} 