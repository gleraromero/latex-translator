import React, { useState, useEffect, useRef } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import FileUploader from './components/FileUploader';
import FileSelector from './components/FileSelector';
import TranslationPanel from './components/TranslationPanel';
import SettingsPanel, { AppSettings } from './components/SettingsPanel';
import HelpPanel from './components/HelpPanel';
import ToastContainer, { useToasts } from './components/ToastContainer';
import { TexFile, Paragraph } from './types';
import { setCurrentFileId, getStoredData, saveStoredData } from './utils/storage';
import { UnsavedChangesManager } from './utils/unsavedChanges';
import { ErrorHandler } from './utils/errorHandler';
import { performanceMonitor, memoryManager } from './utils/performance';
import './App.css';
import './components/TranslationPanel.css';
import './components/LatexDisplay.css';
import './components/ExportPanel.css';
import './components/ToastContainer.css';
import './components/SettingsPanel.css';
import './components/HelpPanel.css';
import CollapsibleLatexPanel from './components/CollapsibleLatexPanel';

// OpenAI translation function using user settings
async function translateParagraphWithAI(paragraph: Paragraph, settings: AppSettings): Promise<string> {
  if (!settings.openaiApiKey) {
    throw new Error('OpenAI API key not configured. Please add your API key in settings.');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: settings.openaiModel,
        messages: [
          {
            role: 'system',
            content: settings.openaiPrompt
          },
          {
            role: 'user',
            content: paragraph.originalText
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Translation failed';
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to connect to OpenAI API');
  }
}

// Default settings (autoSave removed)
const defaultSettings: AppSettings = {
  theme: 'auto',
  fontSize: 'medium',
  showLineNumbers: true,
  enableAnimations: true,
  maxFileSize: 10,
  apiTimeout: 30,
  language: 'en',
  openaiApiKey: '',
  openaiPrompt: `You are a professional translator. Translate the following LaTeX text from English to Spanish. 
- Do NOT translate any LaTeX commands, environments, or math expressions; only translate the human-readable text.
- Preserve all LaTeX formatting, commands, and structure exactly as in the original.
- Ensure the translation is accurate, natural, and uses fluent academic Spanish.
- If you encounter citations, references, or labels, keep them unchanged.
- Output only the translated LaTeX code.`,
  openaiModel: 'gpt-4o-mini'
};

const autoSaveInterval = 30000; // 30 seconds

function AppContent() {
  const [files, setFiles] = useState<TexFile[]>([]);
  const [currentFileId, setCurrentFileIdState] = useState<string | null>(null);
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  
  const unsavedChangesManager = useRef(new UnsavedChangesManager());
  const errorHandler = useRef(ErrorHandler.getInstance());
  const { toasts, removeToast, showSuccess, showError, showInfo } = useToasts();
  const lastSavedState = useRef<any>(null);

  useEffect(() => {
    // Set up error handling
    const unsubscribe = errorHandler.current.onError((error) => {
      showError(error.message, error.details);
    });

    // Load files, translations, and settings from localStorage on component mount
    try {
      const stored = getStoredData();
      setFiles(stored.files);
      setCurrentFileIdState(stored.currentFileId);
      setTranslations(stored.translations || {});
      
      // Load settings
      const storedSettings = localStorage.getItem('latex-translator-settings');
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      }
    } catch (error) {
      errorHandler.current.reportStorageError(error);
    } finally {
      setIsLoading(false);
    }

    // Set up performance monitoring
    const cleanup = memoryManager.registerCleanup(() => {
      performanceMonitor.clearMetrics();
    });

    return () => {
      unsubscribe();
      cleanup();
    };
  }, [showSuccess, showError]);

  useEffect(() => {
    // Set up unsaved changes warning
    const cleanup = unsavedChangesManager.current.setupBeforeUnloadWarning();
    
    // Listen for unsaved changes
    const unsubscribe = unsavedChangesManager.current.onUnsavedChangesChange(setHasUnsavedChanges);
    
    return () => {
      cleanup();
      unsubscribe();
    };
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('latex-translator-settings', JSON.stringify(settings));
  }, [settings]);

  // Auto-save effect
  useEffect(() => {
    const saveToLocalStorage = () => {
      const stateToSave = {
        files,
        currentFileId,
        translations,
        settings,
        // add any other relevant state
      };
      localStorage.setItem('latex-translator-autosave', JSON.stringify(stateToSave));
      lastSavedState.current = stateToSave;
    };

    // Save every 30 seconds
    const interval = setInterval(saveToLocalStorage, autoSaveInterval);

    // Save on unload
    window.addEventListener('beforeunload', saveToLocalStorage);

    // Save on file switch
    // (Assume handleFileSwitch is called on file change)
    // Add saveToLocalStorage() call in handleFileSwitch if not already present

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', saveToLocalStorage);
    };
  }, [files, currentFileId, translations, settings]);

  // On app load, restore from auto-save if available
  useEffect(() => {
    const saved = localStorage.getItem('latex-translator-autosave');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.files) setFiles(parsed.files);
        if (parsed.currentFileId) setCurrentFileIdState(parsed.currentFileId);
        if (parsed.translations) setTranslations(parsed.translations);
        if (parsed.settings) setSettings(parsed.settings);
      } catch {}
    }
  }, []);

  const handleFileUploaded = (file: TexFile) => {
    try {
      // Check file size limit
      if (file.originalContent.length > settings.maxFileSize * 1024 * 1024) {
        showError('File too large', `File size exceeds ${settings.maxFileSize}MB limit`);
        return;
      }

      const endTimer = performanceMonitor.startTimer('fileUpload');
      setFiles(prevFiles => [...prevFiles, file]);
      setCurrentFileIdState(file.id);
      setCurrentFileId(file.id);
      endTimer();
      
      showSuccess('File uploaded successfully', `${file.name} has been added to your workspace`);
    } catch (error) {
      errorHandler.current.reportFileError(error);
    }
  };

  const handleFileSelect = (file: TexFile) => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to switch files?');
      if (!confirmed) return;
    }
    
    setCurrentFileIdState(file.id);
    setCurrentFileId(file.id);
    unsavedChangesManager.current.setHasUnsavedChanges(false);
    showInfo('File selected', `Now working on ${file.name}`);
  };

  const handleTranslate = async (paragraph: Paragraph, idx: number): Promise<string> => {
    try {
      const endTimer = performanceMonitor.startTimer('translation');
      const translated = await translateParagraphWithAI(paragraph, settings);
      handleSave(paragraph.id, translated);
      endTimer();
      
      showSuccess('Translation completed', 'Paragraph translated successfully');
      return translated;
    } catch (error) {
      errorHandler.current.reportApiError(error);
      throw error;
    }
  };

  const handleSave = (paragraphId: string, translation: string) => {
    if (!currentFileId) return;
    
    try {
      setTranslations(prev => {
        const updated = {
          ...prev,
          [currentFileId]: {
            ...(prev[currentFileId] || {}),
            [paragraphId]: translation,
          },
        };
        // Persist to localStorage
        const stored = getStoredData();
        stored.translations = updated;
        saveStoredData(stored);
        return updated;
      });
      
      // Mark as saved
      unsavedChangesManager.current.setHasUnsavedChanges(false);
    } catch (error) {
      errorHandler.current.reportStorageError(error);
    }
  };

  const handleUnsavedChanges = (hasChanges: boolean) => {
    unsavedChangesManager.current.setHasUnsavedChanges(hasChanges);
    // Removed: showWarning toast for unsaved changes
  };

  const handleSettingsChange = (newSettings: AppSettings) => {
    setSettings(newSettings);
    showSuccess('Settings saved', 'Your preferences have been updated');
  };

  const currentFile = files.find(file => file.id === currentFileId);
  const currentTranslations = (currentFile && translations[currentFile.id]) || {};

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading LaTeX Translator...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <div className="header-left">
            <h1>LaTeX Translator</h1>
            <p>Upload and translate LaTeX documents from English to Spanish</p>
          </div>
          <div className="header-right">
            {hasUnsavedChanges && (
              <div className="unsaved-warning">
                ⚠️ You have unsaved changes
              </div>
            )}
            <div className="header-actions">
              <button 
                onClick={() => setIsHelpOpen(true)}
                className="header-button"
                aria-label="Help"
              >
                ?
              </button>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="header-button"
                aria-label="Settings"
              >
                ⚙️
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="App-main">
        <div className="sidebar">
          <FileUploader onFileUploaded={handleFileUploaded} />
          <div className="divider"></div>
          <FileSelector 
            files={files}
            currentFileId={currentFileId}
            onFileSelect={handleFileSelect}
          />
        </div>
        <div className="content">
          {currentFile ? (
            <div className="single-panel-layout">
              <div className="latex-panel">
                <CollapsibleLatexPanel 
                  originalContent={currentFile.originalContent}
                  currentFile={currentFile}
                  translations={currentTranslations}
                />
              </div>
              <div className="translation-panel">
                <h2>Translation</h2>
                <TranslationPanel
                  paragraphs={currentFile.paragraphs}
                  translations={currentTranslations}
                  onTranslate={handleTranslate}
                  onSave={handleSave}
                  onUnsavedChanges={handleUnsavedChanges}
                />
              </div>
            </div>
          ) : (
            <div className="no-file-selected">
              <h2>No File Selected</h2>
              <p>Upload a .tex file or select one from the list to get started</p>
            </div>
          )}
        </div>
      </main>
      
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
      
      <HelpPanel
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
      
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App; 