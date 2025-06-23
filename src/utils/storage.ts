import { TexFile, LocalStorageData } from '../types';

const STORAGE_KEY = 'latex-translator-data';

export const getStoredData = (): LocalStorageData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert string dates back to Date objects
      parsed.files = parsed.files.map((file: any) => ({
        ...file,
        createdAt: new Date(file.createdAt)
      }));
      return parsed;
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  
  return {
    files: [],
    currentFileId: null,
    translations: {}
  };
};

export const saveStoredData = (data: LocalStorageData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const addFile = (file: TexFile): void => {
  const data = getStoredData();
  data.files.push(file);
  data.currentFileId = file.id;
  saveStoredData(data);
};

export const getFiles = (): TexFile[] => {
  return getStoredData().files;
};

export const getCurrentFileId = (): string | null => {
  return getStoredData().currentFileId;
};

export const setCurrentFileId = (fileId: string | null): void => {
  const data = getStoredData();
  data.currentFileId = fileId;
  saveStoredData(data);
}; 