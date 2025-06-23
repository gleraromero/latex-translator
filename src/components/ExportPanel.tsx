import React, { useState } from 'react';
import { TexFile } from '../types';
import { copyToClipboard, downloadFile } from '../utils/clipboard';
import { assembleTranslatedDocument, generateExportFilename, getTranslationStats, ExportOptions } from '../utils/contentAssembly';
import './ExportPanel.css';

interface ExportPanelProps {
  currentFile: TexFile | null;
  translations: Record<string, string>;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ currentFile, translations }) => {
  const [isCopying, setIsCopying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeMetadata: true,
    includeComments: true,
    format: 'latex'
  });

  if (!currentFile) {
    return (
      <div className="export-panel">
        <h3>Export & Copy</h3>
        <p>Select a file to enable export options</p>
      </div>
    );
  }

  const stats = getTranslationStats(currentFile, translations);

  const handleCopyToClipboard = async () => {
    setIsCopying(true);
    setCopySuccess(false);
    
    try {
      const content = assembleTranslatedDocument(currentFile, translations, exportOptions);
      const success = await copyToClipboard(content);
      
      if (success) {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      } else {
        alert('Failed to copy to clipboard. Please try again.');
      }
    } catch (error) {
      console.error('Copy error:', error);
      alert('Failed to copy to clipboard. Please try again.');
    } finally {
      setIsCopying(false);
    }
  };

  const handleExportFile = async () => {
    setIsExporting(true);
    setExportSuccess(false);
    
    try {
      const content = assembleTranslatedDocument(currentFile, translations, exportOptions);
      const filename = generateExportFilename(currentFile.name);
      const success = downloadFile(content, filename, 'text/plain');
      
      if (success) {
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 3000);
      } else {
        alert('Failed to export file. Please try again.');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export file. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="export-panel">
      <h3>Export & Copy</h3>
      
      <div className="translation-stats">
        <div className="stat-item">
          <span className="stat-label">Progress:</span>
          <span className="stat-value">{stats.percentage}% ({stats.translated}/{stats.total})</span>
        </div>
        {stats.missing.length > 0 && (
          <div className="stat-item">
            <span className="stat-label">Missing:</span>
            <span className="stat-value warning">{stats.missing.length} paragraphs</span>
          </div>
        )}
      </div>

      <div className="export-options">
        <h4>Export Options</h4>
        <div className="option-group">
          <label>
            <input
              type="checkbox"
              checked={exportOptions.includeMetadata}
              onChange={(e) => setExportOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
            />
            Include metadata header
          </label>
          <label>
            <input
              type="checkbox"
              checked={exportOptions.includeComments}
              onChange={(e) => setExportOptions(prev => ({ ...prev, includeComments: e.target.checked }))}
            />
            Include original text comments
          </label>
        </div>
      </div>

      <div className="export-actions">
        <button
          onClick={handleCopyToClipboard}
          disabled={isCopying || isExporting}
          className={`action-button copy-button ${copySuccess ? 'success' : ''}`}
        >
          {isCopying ? 'Copying...' : copySuccess ? '✓ Copied!' : '📋 Copy to Clipboard'}
        </button>
        
        <button
          onClick={handleExportFile}
          disabled={isCopying || isExporting}
          className={`action-button export-button ${exportSuccess ? 'success' : ''}`}
        >
          {isExporting ? 'Exporting...' : exportSuccess ? '✓ Exported!' : '💾 Export as .tex'}
        </button>
      </div>

      {stats.missing.length > 0 && (
        <div className="missing-warning">
          <h4>⚠️ Untranslated Paragraphs</h4>
          <p>Some paragraphs haven't been translated yet. They will be marked as [UNTRANSLATED] in the exported file.</p>
          <ul className="missing-list">
            {stats.missing.slice(0, 3).map((text, index) => (
              <li key={index}>{text}</li>
            ))}
            {stats.missing.length > 3 && (
              <li>... and {stats.missing.length - 3} more</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ExportPanel; 