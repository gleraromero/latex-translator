import React, { useState } from 'react';
import './HelpPanel.css';

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HelpSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

const HelpPanel: React.FC<HelpPanelProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('getting-started');

  const helpSections: HelpSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      content: (
        <div>
          <h3>Welcome to LaTeX Translator!</h3>
          <p>This app helps you translate LaTeX documents from English to Spanish while preserving the LaTeX formatting.</p>
          
          <h4>Quick Start:</h4>
          <ol>
            <li><strong>Upload a .tex file</strong> using the drag & drop area or file picker</li>
            <li><strong>Select the file</strong> from your uploaded files list</li>
            <li><strong>Navigate paragraphs</strong> using the arrow buttons or keyboard shortcuts</li>
            <li><strong>Translate paragraphs</strong> using the AI translation feature</li>
            <li><strong>Edit translations</strong> manually if needed</li>
            <li><strong>Export your work</strong> when finished</li>
          </ol>
        </div>
      )
    },
    {
      id: 'features',
      title: 'Features',
      content: (
        <div>
          <h3>Key Features</h3>
          
          <h4>📁 File Management</h4>
          <ul>
            <li>Upload multiple .tex files</li>
            <li>Automatic file parsing into paragraphs</li>
            <li>Local storage for your work</li>
            <li>File switching with unsaved changes protection</li>
          </ul>
          
          <h4>🤖 AI Translation</h4>
          <ul>
            <li>Automatic paragraph translation using OpenAI API</li>
            <li>Configurable translation prompts in settings</li>
            <li>LaTeX code preservation and validation</li>
            <li>Manual editing capabilities</li>
            <li>Translation error handling and retry</li>
          </ul>
          
          <h4>💾 Auto-Save & Backup</h4>
          <ul>
            <li>All work is saved automatically every 30 seconds</li>
            <li>Automatic backup and restore after refresh or crash</li>
            <li>No manual save button or shortcut</li>
            <li>Undo/redo functionality</li>
            <li>Unsaved changes tracking</li>
            <li>Translation history management</li>
          </ul>
          
          <h4>📋 Export Options</h4>
          <ul>
            <li>Copy to clipboard</li>
            <li>Export as .tex file</li>
            <li>Translation progress tracking</li>
            <li>Missing translations highlighting</li>
          </ul>
        </div>
      )
    },
    {
      id: 'openai-config',
      title: 'OpenAI Setup',
      content: (
        <div>
          <h3>🤖 OpenAI Configuration</h3>
          
          <p>To use AI translation, you need to configure your OpenAI API:</p>
          
          <h4>Setup Steps:</h4>
          <ol>
            <li><strong>Get an API Key:</strong> Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI Platform</a> to create an account and generate an API key</li>
            <li><strong>Open Settings:</strong> Click the gear icon (⚙️) in the header</li>
            <li><strong>Enter API Key:</strong> Paste your API key in the "OpenAI Configuration" section</li>
            <li><strong>Select Model:</strong> Choose your preferred OpenAI model (GPT-4o Mini is recommended for most use cases)</li>
            <li><strong>Customize Prompt:</strong> Optionally modify the translation prompt to suit your needs</li>
            <li><strong>Save Settings:</strong> Click "Save Changes" to store your configuration</li>
          </ol>
          
          <h4>Model Options:</h4>
          <ul>
            <li><strong>GPT-4o Mini:</strong> Fast, cost-effective, good for most translations</li>
            <li><strong>GPT-4o:</strong> Most capable model, best quality but higher cost</li>
            <li><strong>GPT-4 Turbo:</strong> Good balance of quality and speed</li>
            <li><strong>GPT-3.5 Turbo:</strong> Fastest and most economical option</li>
          </ul>
          
          <h4>Security & Privacy:</h4>
          <ul>
            <li><strong>Local Storage:</strong> Your API key is stored securely in your browser's local storage</li>
            <li><strong>No External Servers:</strong> The key is never sent to external servers except OpenAI</li>
            <li><strong>Browser Only:</strong> Your data stays in your browser and is not shared</li>
          </ul>
          
          <h4>Translation Prompt:</h4>
          <p>The default prompt is optimized for LaTeX translation:</p>
          <blockquote>
            "Translate the following LaTeX text from English to Spanish, preserving all LaTeX commands and formatting."
          </blockquote>
          
          <p>You can customize this prompt to:</p>
          <ul>
            <li>Change target language (e.g., French, German, etc.)</li>
            <li>Add specific translation instructions</li>
            <li>Include domain-specific terminology</li>
            <li>Modify translation style or tone</li>
            <li>Add context about the document type</li>
          </ul>
          
          <h4>Troubleshooting:</h4>
          <ul>
            <li><strong>Invalid API Key:</strong> Ensure the key starts with "sk-" and is correctly copied</li>
            <li><strong>API Errors:</strong> Check your OpenAI account balance and usage limits</li>
            <li><strong>Translation Failures:</strong> Verify your internet connection and try again</li>
            <li><strong>Rate Limits:</strong> OpenAI has rate limits - wait a moment and retry</li>
          </ul>
        </div>
      )
    },
    {
      id: 'keyboard-shortcuts',
      title: 'Keyboard Shortcuts',
      content: (
        <div>
          <h3>Keyboard Shortcuts</h3>
          
          <div className="shortcuts-grid">
            <div className="shortcut-item">
              <kbd>Ctrl + Z</kbd>
              <span>Undo last action</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl + Y</kbd>
              <span>Redo last action</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl + S</kbd>
              <span>Save current translation</span>
            </div>
            <div className="shortcut-item">
              <kbd>←</kbd>
              <span>Previous paragraph</span>
            </div>
            <div className="shortcut-item">
              <kbd>→</kbd>
              <span>Next paragraph</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl + Enter</kbd>
              <span>Translate current paragraph</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl + C</kbd>
              <span>Copy full translation</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl + E</kbd>
              <span>Export translation</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'latex-support',
      title: 'LaTeX Support',
      content: (
        <div>
          <h3>LaTeX Code Support</h3>
          
          <p>The app automatically detects and preserves LaTeX code during translation:</p>
          
          <h4>Supported LaTeX Elements:</h4>
          <ul>
            <li><strong>Commands:</strong> \textbf{}, \textit{}, \section{}, etc.</li>
            <li><strong>Environments:</strong> \begin&#123;equation&#125;...\end&#123;equation&#125;</li>
            <li><strong>Math expressions:</strong> $...$, $$...$$, \[...\]</li>
            <li><strong>Citations:</strong> \cite{}, \ref{}, etc.</li>
            <li><strong>Cross-references:</strong> \label{}, \ref{}</li>
            <li><strong>Special characters:</strong> %, $, &, #, etc.</li>
          </ul>
          
          <h4>Validation Features:</h4>
          <ul>
            <li>LaTeX code is highlighted in <strong>bold</strong></li>
            <li>Missing LaTeX code is marked in <span style={{color: 'red'}}>red</span></li>
            <li>Translation validation ensures LaTeX integrity</li>
            <li>Automatic LaTeX code preservation</li>
            <li><strong>Smart command validation:</strong> Compares command structure (e.g., <code>\section{}</code>) rather than exact content</li>
            <li><strong>Content translation allowed:</strong> Text inside commands can be translated while preserving the command structure</li>
          </ul>
          
          <h4>Examples of Valid Translations:</h4>
          <ul>
            <li><code>\section&#123;Introduction&#125;</code> → <code>\section&#123;Introducción&#125;</code> ✅</li>
            <li><code>\textbf&#123;Hello&#125;</code> → <code>\textbf&#123;Hola&#125;</code> ✅</li>
            <li><code>\cite&#123;paper2023&#125;</code> → <code>\cite&#123;paper2023&#125;</code> ✅</li>
          </ul>
          
          <h4>Examples of Invalid Translations:</h4>
          <ul>
            <li><code>\section&#123;Introduction&#125;</code> → <code>\sección&#123;Introducción&#125;</code> ❌ (command name changed)</li>
            <li><code>\section&#123;Introduction&#125;</code> → <code>\section Introducción</code> ❌ (missing braces)</li>
            <li><code>\section&#123;Introduction&#125;</code> → <code>Introducción</code> ❌ (command missing)</li>
          </ul>
          
          <h4>Tips for Best Results:</h4>
          <ul>
            <li>Ensure your .tex file is well-formatted</li>
            <li>Check that LaTeX commands are properly closed</li>
            <li>Review translations for LaTeX code preservation</li>
            <li>Use the validation features to catch missing elements</li>
          </ul>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      content: (
        <div>
          <h3>Common Issues & Solutions</h3>
          
          <h4>File Upload Issues</h4>
          <ul>
            <li><strong>File too large:</strong> Check file size limits in settings</li>
            <li><strong>Invalid file format:</strong> Ensure file has .tex extension</li>
            <li><strong>Permission denied:</strong> Check file permissions</li>
          </ul>
          
          <h4>Translation Issues</h4>
          <ul>
            <li><strong>API timeout:</strong> Check internet connection and try again</li>
            <li><strong>Translation errors:</strong> Verify OpenAI API key configuration in settings</li>
            <li><strong>API key not configured:</strong> Add your OpenAI API key in the settings panel</li>
            <li><strong>Poor quality translations:</strong> Edit manually and save, or adjust the translation prompt</li>
            <li><strong>Rate limit errors:</strong> Wait a moment and retry, or check your OpenAI account usage</li>
          </ul>
          
          <h4>Storage Issues</h4>
          <ul>
            <li><strong>Storage quota exceeded:</strong> Clear browser data or use smaller files</li>
            <li><strong>Data not saving:</strong> Check browser storage permissions</li>
            <li><strong>Lost work:</strong> All changes are auto-saved every 30 seconds and restored on refresh</li>
          </ul>
          
          <h4>Performance Issues</h4>
          <ul>
            <li><strong>Slow loading:</strong> Close other tabs and refresh</li>
            <li><strong>Laggy interface:</strong> Reduce file size or split into smaller files</li>
            <li><strong>Memory issues:</strong> Restart browser and clear cache</li>
          </ul>
        </div>
      )
    },
    {
      id: 'tips',
      title: 'Tips & Best Practices',
      content: (
        <div>
          <h3>Tips for Efficient Translation</h3>
          
          <h4>Workflow Tips:</h4>
          <ul>
            <li>Start with shorter documents to get familiar with the interface</li>
            <li>Use the paragraph navigation to work systematically</li>
            <li>Save frequently using Ctrl+S or auto-save</li>
            <li>Review translations before moving to the next paragraph</li>
            <li>Use the export feature to backup your work</li>
          </ul>
          
          <h4>Translation Quality:</h4>
          <ul>
            <li>Always review AI translations for accuracy</li>
            <li>Pay attention to technical terminology consistency</li>
            <li>Check that LaTeX code is preserved correctly</li>
            <li>Use the validation features to catch errors</li>
            <li>Consider the context when translating technical terms</li>
          </ul>
          
          <h4>File Organization:</h4>
          <ul>
            <li>Use descriptive filenames for your .tex files</li>
            <li>Keep backup copies of original files</li>
            <li>Export completed translations promptly</li>
            <li>Organize files by project or topic</li>
          </ul>
          
          <h4>Performance Optimization:</h4>
          <ul>
            <li>Close unnecessary browser tabs</li>
            <li>Use the app in a dedicated browser window</li>
            <li>Clear browser cache regularly</li>
            <li>Consider splitting very large documents</li>
          </ul>
          
          <h4>There is no manual save; your work is always backed up automatically</h4>
        </div>
      )
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="help-overlay" onClick={onClose}>
      <div className="help-panel" onClick={(e) => e.stopPropagation()}>
        <div className="help-header">
          <h2>Help & Documentation</h2>
          <button className="close-button" onClick={onClose} aria-label="Close help">
            ×
          </button>
        </div>

        <div className="help-content">
          <div className="help-sidebar">
            <nav className="help-nav">
              {helpSections.map(section => (
                <button
                  key={section.id}
                  className={`help-nav-item ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </div>

          <div className="help-main">
            <div className="help-section-content">
              {helpSections.find(section => section.id === activeSection)?.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPanel; 