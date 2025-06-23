import React, { useState } from 'react';
import ExportPanel from './ExportPanel';
import { TexFile } from '../types';

interface CollapsibleLatexPanelProps {
  originalContent: string;
  currentFile: TexFile;
  translations: Record<string, string>;
}

const CollapsibleLatexPanel: React.FC<CollapsibleLatexPanelProps> = ({
  originalContent,
  currentFile,
  translations
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="collapsible-latex-panel">
      <button
        className="toggle-latex-panel"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        aria-controls="original-latex-content"
      >
        {expanded ? 'Hide Original LaTeX' : 'Show Original LaTeX'}
      </button>
      {expanded && (
        <div id="original-latex-content">
          <h2>Original LaTeX</h2>
          <pre className="tex-content scrollable">{originalContent}</pre>
        </div>
      )}
      <ExportPanel currentFile={currentFile} translations={translations} />
    </div>
  );
};

export default CollapsibleLatexPanel; 