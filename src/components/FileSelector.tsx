import React from 'react';
import { TexFile } from '../types';
import './FileSelector.css';

interface FileSelectorProps {
  files: TexFile[];
  currentFileId: string | null;
  onFileSelect: (file: TexFile) => void;
}

const FileSelector: React.FC<FileSelectorProps> = ({ files, currentFileId, onFileSelect }) => {
  if (files.length === 0) {
    return (
      <div className="file-selector">
        <div className="no-files">
          <p>No files uploaded yet</p>
          <p>Upload a .tex file to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="file-selector">
      <h3>Uploaded Files</h3>
      <div className="file-list">
        {files.map((file) => (
          <div
            key={file.id}
            className={`file-item ${file.id === currentFileId ? 'selected' : ''}`}
            onClick={() => onFileSelect(file)}
          >
            <div className="file-icon">📄</div>
            <div className="file-info">
              <div className="file-name">{file.name}</div>
              <div className="file-meta">
                {file.paragraphs.length} paragraphs • 
                {new Date(file.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileSelector; 