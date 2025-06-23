import React, { useState, useEffect } from 'react';
import './SettingsPanel.css';

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  showLineNumbers: boolean;
  enableAnimations: boolean;
  maxFileSize: number;
  apiTimeout: number;
  language: 'en' | 'es';
  openaiApiKey: string;
  openaiPrompt: string;
  openaiModel: string;
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
    setHasChanges(false);
  }, [settings]);

  const handleSettingChange = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSettingsChange(localSettings);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setHasChanges(false);
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(localSettings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'latex-translator-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        setLocalSettings(importedSettings);
        setHasChanges(true);
      } catch (error) {
        console.error('Failed to import settings:', error);
        alert('Failed to import settings. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={onClose} aria-label="Close settings">
            ×
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h3>Appearance</h3>
            <div className="setting-item">
              <label>
                Theme:
                <select
                  value={localSettings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value as AppSettings['theme'])}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (system)</option>
                </select>
              </label>
            </div>
            <div className="setting-item">
              <label>
                Font size:
                <select
                  value={localSettings.fontSize}
                  onChange={(e) => handleSettingChange('fontSize', e.target.value as AppSettings['fontSize'])}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={localSettings.showLineNumbers}
                  onChange={(e) => handleSettingChange('showLineNumbers', e.target.checked)}
                />
                Show line numbers
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={localSettings.enableAnimations}
                  onChange={(e) => handleSettingChange('enableAnimations', e.target.checked)}
                />
                Enable animations
              </label>
            </div>
          </div>

          <div className="settings-section">
            <h3>Performance</h3>
            <div className="setting-item">
              <label>
                Maximum file size (MB):
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={localSettings.maxFileSize}
                  onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
                />
              </label>
            </div>
            <div className="setting-item">
              <label>
                API timeout (seconds):
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={localSettings.apiTimeout}
                  onChange={(e) => handleSettingChange('apiTimeout', parseInt(e.target.value))}
                />
              </label>
            </div>
          </div>

          <div className="settings-section">
            <h3>Language</h3>
            <div className="setting-item">
              <label>
                Interface language:
                <select
                  value={localSettings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value as AppSettings['language'])}
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </label>
            </div>
          </div>

          <div className="settings-section">
            <h3>OpenAI Configuration</h3>
            <div className="setting-item">
              <label>
                API Key:
                <input
                  type="password"
                  placeholder="sk-..."
                  value={localSettings.openaiApiKey}
                  onChange={(e) => handleSettingChange('openaiApiKey', e.target.value)}
                />
              </label>
              <small className="setting-help">Your OpenAI API key (stored locally)</small>
            </div>
            <div className="setting-item">
              <label>
                Translation Prompt:
                <textarea
                  placeholder="Enter the prompt for translation..."
                  value={localSettings.openaiPrompt}
                  onChange={(e) => handleSettingChange('openaiPrompt', e.target.value)}
                  rows={3}
                  className="prompt-textarea"
                />
              </label>
              <small className="setting-help">The prompt sent to OpenAI for translation</small>
            </div>
            <div className="setting-item">
              <label>
                Model:
                <select
                  value={localSettings.openaiModel}
                  onChange={(e) => handleSettingChange('openaiModel', e.target.value)}
                >
                  <option value="gpt-4o-mini">GPT-4o Mini (Recommended)</option>
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4">GPT-4.1</option>
                  <option value="gpt-4.1-mini">GPT-4.1 Mini</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
              </label>
              <small className="setting-help">OpenAI model to use for translation</small>
            </div>
          </div>

          <div className="settings-section">
            <h3>Import/Export</h3>
            <div className="setting-actions">
              <button onClick={handleExportSettings} className="export-button">
                Export Settings
              </button>
              <label className="import-button">
                Import Settings
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportSettings}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button onClick={handleReset} className="reset-button" disabled={!hasChanges}>
            Reset
          </button>
          <div className="settings-actions">
            <button onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="save-button"
              disabled={!hasChanges}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel; 