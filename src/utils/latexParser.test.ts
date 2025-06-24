import { 
  parseLatexContent, 
  compareLatexElements, 
  highlightLatexText,
  extractCommandStructure,
  LatexElement 
} from './latexParser';

describe('latexParser', () => {
  describe('extractCommandStructure', () => {
    it('should extract command structure for simple commands', () => {
      const result = extractCommandStructure('\\item');
      expect(result).toEqual({
        commandName: 'item',
        structure: '\\item',
        content: '',
        fullCommand: '\\item'
      });
    });

    it('should extract command structure for commands with parameters', () => {
      const result = extractCommandStructure('\\textbf{bold text}');
      expect(result).toEqual({
        commandName: 'textbf',
        structure: '\\textbf{}',
        content: 'bold text',
        fullCommand: '\\textbf{bold text}'
      });
    });

    it('should extract command structure for environment commands', () => {
      const result = extractCommandStructure('\\begin{enumerate}');
      expect(result).toEqual({
        commandName: 'begin',
        structure: '\\begin{}',
        content: 'enumerate',
        fullCommand: '\\begin{enumerate}'
      });
    });

    it('should handle commands with numbers', () => {
      const result = extractCommandStructure('\\item2');
      expect(result).toEqual({
        commandName: 'item2',
        structure: '\\item2',
        content: '',
        fullCommand: '\\item2'
      });
    });
  });

  describe('parseLatexContent', () => {
    it('should parse simple commands', () => {
      const text = '\\item First item';
      const elements = parseLatexContent(text);
      
      expect(elements).toHaveLength(1);
      expect(elements[0]).toEqual({
        content: '\\item',
        startIndex: 0,
        endIndex: 5,
        type: 'command',
        commandName: 'item',
        commandStructure: '\\item'
      });
    });

    it('should parse commands with parameters', () => {
      const text = '\\textbf{bold text}';
      const elements = parseLatexContent(text);
      
      expect(elements).toHaveLength(1);
      expect(elements[0]).toEqual({
        content: '\\textbf{bold text}',
        startIndex: 0,
        endIndex: 17,
        type: 'command',
        commandName: 'textbf',
        commandStructure: '\\textbf{}'
      });
    });

    it('should parse equation environments', () => {
      const text = '\\begin{equation}E = mc^2\\end{equation}';
      const elements = parseLatexContent(text);
      
      expect(elements).toHaveLength(1);
      expect(elements[0]).toEqual({
        content: '\\begin{equation}E = mc^2\\end{equation}',
        startIndex: 0,
        endIndex: 35,
        type: 'equation'
      });
    });

    it('should parse multiple commands in a list', () => {
      const text = `\\begin{enumerate}
    \\item First item
    \\item Second item
\\end{enumerate}`;
      const elements = parseLatexContent(text);
      
      // Should find: \begin{enumerate}, \item, \item, \end{enumerate}
      expect(elements).toHaveLength(4);
      
      const commandNames = elements.map(e => e.commandName).filter(Boolean);
      expect(commandNames).toEqual(['begin', 'item', 'item', 'end']);
    });
  });

  describe('compareLatexElements', () => {
    it('should identify missing commands when translation is empty', () => {
      const originalElements = parseLatexContent('\\item First item');
      const translatedElements: LatexElement[] = [];
      
      const { missing, different } = compareLatexElements(originalElements, translatedElements);
      
      expect(missing).toHaveLength(1);
      expect(missing[0].content).toBe('\\item');
      expect(different).toHaveLength(0);
    });

    it('should identify when command names are changed', () => {
      const originalElements = parseLatexContent('\\item First item');
      const translatedElements = parseLatexContent('\\item2 First item');
      
      const { missing, different } = compareLatexElements(originalElements, translatedElements);
      
      expect(missing).toHaveLength(1);
      expect(missing[0].content).toBe('\\item');
      expect(different).toHaveLength(0);
    });

    it('should allow content translation within commands', () => {
      const originalElements = parseLatexContent('\\textbf{bold text}');
      const translatedElements = parseLatexContent('\\textbf{texto en negrita}');
      
      const { missing, different } = compareLatexElements(originalElements, translatedElements);
      
      expect(missing).toHaveLength(0);
      expect(different).toHaveLength(0);
    });

    it('should identify when environment names are changed', () => {
      const originalElements = parseLatexContent('\\begin{enumerate}');
      const translatedElements = parseLatexContent('\\begin{enumera2te}');
      
      const { missing, different } = compareLatexElements(originalElements, translatedElements);
      
      expect(missing).toHaveLength(1);
      expect(missing[0].content).toBe('\\begin{enumerate}');
      expect(different).toHaveLength(0);
    });

    it('should handle multiset matching correctly', () => {
      const originalText = `\\item First
\\item Second
\\item Third`;
      const translatedText = `\\item2 First
\\item Second
\\item Third`;
      
      const originalElements = parseLatexContent(originalText);
      const translatedElements = parseLatexContent(translatedText);
      
      const { missing, different } = compareLatexElements(originalElements, translatedElements);
      
      // Only the first \item should be missing (changed to \item2)
      expect(missing).toHaveLength(1);
      expect(missing[0].content).toBe('\\item');
      expect(different).toHaveLength(0);
    });
  });

  describe('highlightLatexText', () => {
    it('should highlight commands with CSS classes', () => {
      const text = '\\item First item';
      const elements = parseLatexContent(text);
      const highlighted = highlightLatexText(text, elements);
      
      expect(highlighted).toContain('<span class="latex-command">');
      expect(highlighted).toContain('\\item');
    });

    it('should preserve non-LaTeX text', () => {
      const text = '\\item First item';
      const elements = parseLatexContent(text);
      const highlighted = highlightLatexText(text, elements);
      
      expect(highlighted).toContain(' First item');
      expect(highlighted).not.toContain('<span class="latex-command"> First item</span>');
    });
  });

  describe('edge cases', () => {
    it('should handle empty input gracefully', () => {
      const elements = parseLatexContent('');
      expect(elements).toHaveLength(0);
    });

    it('should handle text without LaTeX commands', () => {
      const text = 'This is plain text without any LaTeX commands.';
      const elements = parseLatexContent(text);
      expect(elements).toHaveLength(0);
    });

    it('should handle malformed commands', () => {
      const text = '\\item{unclosed brace';
      const elements = parseLatexContent(text);
      expect(elements).toHaveLength(1);
      expect(elements[0].content).toBe('\\item{unclosed brace');
    });
  });
}); 