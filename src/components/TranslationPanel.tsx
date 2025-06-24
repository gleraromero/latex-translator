import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Paragraph } from '../types';
import { parseLatexContent, compareLatexElements } from '../utils/latexParser';
import { UndoRedoManager } from '../utils/undoRedo';
import LatexDisplay from './LatexDisplay';

interface TranslationPanelProps {
  paragraphs: Paragraph[];
  translations: Record<string, string>;
  onTranslate: (paragraph: Paragraph, idx: number) => Promise<string>;
  onSave: (paragraphId: string, translation: string) => void;
  onUnsavedChanges?: (hasChanges: boolean) => void;
}

const TranslationPanel: React.FC<TranslationPanelProps> = ({
  paragraphs,
  translations,
  onTranslate,
  onSave,
  onUnsavedChanges,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [editingValue, setEditingValue] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const undoRedoManager = useRef(new UndoRedoManager());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (paragraphs.length > 0) {
      const para = paragraphs[currentIdx];
      setEditingValue(translations[para.id] || '');
      setHasUnsavedChanges(false);
    }
  }, [currentIdx, paragraphs, translations]);

  useEffect(() => {
    // Notify parent about unsaved changes
    onUnsavedChanges?.(hasUnsavedChanges);
  }, [hasUnsavedChanges, onUnsavedChanges]);

  const handleManualSave = useCallback(() => {
    if (paragraphs.length > 0) {
      const para = paragraphs[currentIdx];
      onSave(para.id, editingValue);
      setHasUnsavedChanges(false);
    }
  }, [paragraphs, currentIdx, editingValue, onSave]);

  const handleUndo = useCallback(() => {
    if (paragraphs.length > 0) {
      const para = paragraphs[currentIdx];
      const previousEdit = undoRedoManager.current.undo();
      if (previousEdit && previousEdit.id === para.id) {
        setEditingValue(previousEdit.content);
        setHasUnsavedChanges(true);
      }
    }
  }, [paragraphs, currentIdx]);

  const handleRedo = useCallback(() => {
    if (paragraphs.length > 0) {
      const para = paragraphs[currentIdx];
      const nextEdit = undoRedoManager.current.redo();
      if (nextEdit && nextEdit.id === para.id) {
        setEditingValue(nextEdit.content);
        setHasUnsavedChanges(true);
      }
    }
  }, [paragraphs, currentIdx]);

  useEffect(() => {
    // Set up keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target !== textareaRef.current) return;
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
            break;
          case 'y':
            e.preventDefault();
            handleRedo();
            break;
          case 's':
            e.preventDefault();
            handleManualSave();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleManualSave, handleRedo, handleUndo]);

  if (paragraphs.length === 0) return <div>No paragraphs found.</div>;

  const para = paragraphs[currentIdx];
  const total = paragraphs.length;

  // Parse LaTeX elements for original and translation
  const originalElements = parseLatexContent(para.originalText);
  const translatedElements = parseLatexContent(editingValue);
  const { missing } = editingValue.trim() 
    ? compareLatexElements(originalElements, translatedElements)
    : { missing: [] };

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };
  
  const handleNext = () => {
    if (currentIdx < total - 1) setCurrentIdx(currentIdx + 1);
  };

  const handleTranslate = async () => {
    setIsTranslating(true);
    try {
      const result = await onTranslate(para, currentIdx);
      setEditingValue(result);
      onSave(para.id, result);
      undoRedoManager.current.addEdit(para.id, result);
      setHasUnsavedChanges(false);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleEdit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setEditingValue(newValue);
    setHasUnsavedChanges(true);
    
    // Add to undo history
    undoRedoManager.current.addEdit(para.id, newValue);
  };

  const historyStats = undoRedoManager.current.getHistoryStats();

  return (
    <div className="translation-panel">
      <div className="nav-controls">
        <button onClick={handlePrev} disabled={currentIdx === 0}>&larr; Prev</button>
        <span>Paragraph {currentIdx + 1} / {total}</span>
        <button onClick={handleNext} disabled={currentIdx === total - 1}>Next &rarr;</button>
      </div>
      
      <div className="original-paragraph">
        <h4>Original Paragraph</h4>
        <div className="paragraph-content">
          <LatexDisplay 
            text={para.originalText}
            elements={originalElements}
            missingElements={missing}
            translatedText={editingValue}
            className="original-latex"
          />
        </div>
      </div>
      
      <div className="translation-area">
        <div className="translation-header">
          <h4>Translation</h4>
          <div className="undo-redo-controls">
            <button 
              onClick={handleUndo} 
              disabled={!historyStats.canUndo || isTranslating}
              title="Undo (Ctrl+Z)"
            >
              ↶ Undo
            </button>
            <button 
              onClick={handleRedo} 
              disabled={!historyStats.canRedo || isTranslating}
              title="Redo (Ctrl+Y)"
            >
              ↷ Redo
            </button>
          </div>
        </div>
        
        <textarea
          ref={textareaRef}
          value={editingValue}
          onChange={handleEdit}
          onBlur={handleManualSave}
          placeholder="Type your translation here..."
          className="translation-textarea"
          rows={8}
        />
        
        <div className="translation-actions">
          <button onClick={handleTranslate} disabled={isTranslating}>
            {isTranslating ? 'Translating...' : 'Translate with AI'}
          </button>
        </div>
        
        {/* Show highlighted translation preview */}
        {editingValue && (
          <div className="translation-preview">
            <h5>Translation Preview:</h5>
            <div className="paragraph-content">
              <LatexDisplay 
                text={editingValue}
                elements={translatedElements}
                translatedText={para.originalText}
                className="translated-latex"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationPanel; 