import React, { useState, useCallback } from 'react';
import { parseTexFile, readFileAsText } from '../utils/fileParser';
import { addFile } from '../utils/storage';
import { TexFile } from '../types';
import './FileUploader.css';

interface FileUploaderProps {
  onFileUploaded: (file: TexFile) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUploaded }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.name.endsWith('.tex')) {
      alert('Please upload a .tex file');
      return;
    }

    setIsUploading(true);
    try {
      const content = await readFileAsText(file);
      const parsedFile = parseTexFile(content, file.name);
      addFile(parsedFile);
      onFileUploaded(parsedFile);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [onFileUploaded]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  return (
    <div className="file-uploader">
      <div
        className={`upload-area ${isDragOver ? 'drag-over' : ''} ${isUploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="upload-content">
            <div className="spinner"></div>
            <p>Uploading file...</p>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">📄</div>
            <h3>Upload LaTeX File</h3>
            <p>Drag and drop a .tex file here, or click to browse</p>
            <input
              type="file"
              accept=".tex"
              onChange={handleFileInput}
              style={{ display: 'none' }}
              id="file-input"
            />
            <label htmlFor="file-input" className="browse-button">
              Browse Files
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader; 