import { TexFile } from '../types';

export interface ExportOptions {
  includeMetadata?: boolean;
  includeComments?: boolean;
  format?: 'plain' | 'formatted' | 'latex';
}

export function assembleTranslatedDocument(
  originalFile: TexFile,
  translations: Record<string, string>,
  options: ExportOptions = {}
): string {
  const {
    includeMetadata = true,
    includeComments = true
  } = options;

  let content = '';

  // Add metadata header if requested
  if (includeMetadata) {
    content += `% Translated LaTeX Document\n`;
    content += `% Original: ${originalFile.name}\n`;
    content += `% Translation Date: ${new Date().toISOString()}\n`;
    content += `% Total Paragraphs: ${originalFile.paragraphs.length}\n`;
    content += `% Translated Paragraphs: ${Object.keys(translations).length}\n`;
    content += `%\n`;
  }

  // Simply concatenate all translated paragraphs in order
  originalFile.paragraphs.forEach(paragraph => {
    const translation = translations[paragraph.id];
    
    if (translation) {
      if (includeComments) {
        content += `% Original: ${paragraph.originalText.replace(/\n/g, ' ').substring(0, 100)}...\n`;
      }
      content += translation + '\n\n';
      if (includeComments) {
        content += `%\n`;
      }
    } else {
      // No translation available, keep original
      if (includeComments) {
        content += `% [UNTRANSLATED]\n`;
      }
      content += paragraph.originalText + '\n\n';
    }
  });

  // Add footer metadata if requested
  if (includeMetadata) {
    content += `\n% End of translated document\n`;
    content += `% Translation completed: ${new Date().toLocaleString()}\n`;
  }

  return content;
}

export function generateExportFilename(originalFilename: string, format: string = 'tex'): string {
  const baseName = originalFilename.replace(/\.tex$/i, '');
  const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `${baseName}_translated_${timestamp}.${format}`;
}

export function getTranslationStats(
  originalFile: TexFile,
  translations: Record<string, string>
): {
  total: number;
  translated: number;
  percentage: number;
  missing: string[];
} {
  const total = originalFile.paragraphs.length;
  const translated = Object.keys(translations).length;
  const percentage = total > 0 ? Math.round((translated / total) * 100) : 0;
  
  const missing = originalFile.paragraphs
    .filter(p => !translations[p.id])
    .map(p => p.originalText.substring(0, 50) + '...');

  return {
    total,
    translated,
    percentage,
    missing
  };
} 