# LaTeX Translator

A React TypeScript application for translating LaTeX documents from English to Spanish while preserving LaTeX formatting and code.

## 🚀 Features

### Core Functionality
- **File Upload & Management**: Drag & drop .tex files with automatic parsing into paragraphs
- **AI Translation**: OpenAI-powered translation with LaTeX code preservation
- **Two-Panel Interface**: Side-by-side view of original and translated content
- **Paragraph Navigation**: Easy navigation through document paragraphs
- **Manual Saving**: Save translations manually with a button or keyboard shortcut (Ctrl+S)

### Advanced Features
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages
- **Toast Notifications**: Real-time feedback for all user actions
- **Settings Panel**: Customizable preferences for theme, performance, and more
- **Help System**: Comprehensive documentation and onboarding
- **Performance Optimization**: Debouncing, memoization, and memory management
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **Responsive Design**: Mobile-friendly interface with adaptive layouts
- **Dark Theme Support**: Automatic theme detection and manual switching
- **Undo/Redo**: History management for translation edits
- **Export Options**: Copy to clipboard and file export with progress tracking

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: CSS3 with modern features (Grid, Flexbox, CSS Variables)
- **State Management**: React Hooks with custom utilities
- **Storage**: LocalStorage with data persistence
- **Performance**: Custom optimization utilities
- **Error Handling**: Error boundaries and centralized error management

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd latex-translator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Build for production:
```bash
npm run build
```

## 🎯 Usage

### Getting Started
1. **Upload a .tex file** using the drag & drop area or file picker
2. **Select the file** from your uploaded files list
3. **Navigate paragraphs** using arrow buttons or keyboard shortcuts
4. **Translate paragraphs** using the AI translation feature
5. **Edit translations** manually if needed
6. **Save your work manually** using the Save button or Ctrl+S
7. **Export your work** when finished

### Keyboard Shortcuts
- `Ctrl + Z`: Undo last action
- `Ctrl + Y`: Redo last action
- `Ctrl + S`: Save current translation (manual only)
- `←/→`: Navigate between paragraphs
- `Ctrl + Enter`: Translate current paragraph
- `Ctrl + C`: Copy full translation
- `Ctrl + E`: Export translation

### Settings Configuration
Access settings via the gear icon (⚙️) in the header:

- **Appearance**: Theme, font size, line numbers, animations
- **Performance**: File size limits, API timeout
- **Language**: Interface language selection
- **Import/Export**: Settings backup and restore

## 🔧 Configuration

### OpenAI API Setup
Configure your OpenAI API key and translation prompt in the settings panel:

1. **Open Settings**: Click the gear icon (⚙️) in the header
2. **Add API Key**: Enter your OpenAI API key in the "OpenAI Configuration" section
3. **Customize Prompt**: Optionally modify the translation prompt to suit your needs
4. **Save Settings**: Click "Save Changes" to store your configuration

The API key is stored securely in your browser's local storage and is never sent to external servers except OpenAI.

### Auto-Save & Backup
- **All your work is saved automatically every 30 seconds.**
- If you refresh or close the app, your latest work will be restored from backup.
- There is no manual save button or shortcut; saving is fully automatic.

### Example Translation Prompt
The default prompt is optimized for LaTeX translation:
```
You are a professional translator. Translate the following LaTeX text from English to Spanish. 
- Do NOT translate any LaTeX commands, environments, or math expressions; only translate the human-readable text.
- Preserve all LaTeX formatting, commands, and structure exactly as in the original.
- Ensure the translation is accurate, natural, and uses fluent academic Spanish.
- If you encounter citations, references, or labels, keep them unchanged.
- Output only the translated LaTeX code.
```

You can customize this prompt to:
- Change target language
- Add specific translation instructions
- Include domain-specific terminology
- Modify translation style or tone

## 🏗️ Architecture

### Component Structure
```