export interface AppError {
  code: string;
  message: string;
  details?: string;
  recoverable?: boolean;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorCallbacks: ((error: AppError) => void)[] = [];

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  onError(callback: (error: AppError) => void) {
    this.errorCallbacks.push(callback);
    return () => {
      const index = this.errorCallbacks.indexOf(callback);
      if (index > -1) {
        this.errorCallbacks.splice(index, 1);
      }
    };
  }

  private notifyError(error: AppError) {
    this.errorCallbacks.forEach(callback => callback(error));
  }

  handleFileError(error: unknown): AppError {
    if (error instanceof Error) {
      if (error.message.includes('File not found')) {
        return {
          code: 'FILE_NOT_FOUND',
          message: 'The file could not be found or accessed.',
          details: error.message,
          recoverable: true
        };
      }
      if (error.message.includes('permission')) {
        return {
          code: 'FILE_PERMISSION_DENIED',
          message: 'Permission denied. Please check file permissions.',
          details: error.message,
          recoverable: true
        };
      }
    }
    
    return {
      code: 'FILE_READ_ERROR',
      message: 'Failed to read the file. Please try again.',
      details: error instanceof Error ? error.message : String(error),
      recoverable: true
    };
  }

  handleStorageError(error: unknown): AppError {
    if (error instanceof Error) {
      if (error.message.includes('QuotaExceededError')) {
        return {
          code: 'STORAGE_QUOTA_EXCEEDED',
          message: 'Storage space exceeded. Please clear some data or use a smaller file.',
          details: 'Local storage quota has been exceeded',
          recoverable: true
        };
      }
      if (error.message.includes('SecurityError')) {
        return {
          code: 'STORAGE_SECURITY_ERROR',
          message: 'Storage access denied. Please check your browser settings.',
          details: error.message,
          recoverable: true
        };
      }
    }
    
    return {
      code: 'STORAGE_ERROR',
      message: 'Failed to save data. Your work may not be preserved.',
      details: error instanceof Error ? error.message : String(error),
      recoverable: true
    };
  }

  handleApiError(error: unknown): AppError {
    if (error instanceof Error) {
      if (error.message.includes('network')) {
        return {
          code: 'NETWORK_ERROR',
          message: 'Network connection failed. Please check your internet connection.',
          details: error.message,
          recoverable: true
        };
      }
      if (error.message.includes('timeout')) {
        return {
          code: 'API_TIMEOUT',
          message: 'Request timed out. Please try again.',
          details: error.message,
          recoverable: true
        };
      }
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        return {
          code: 'API_UNAUTHORIZED',
          message: 'Authentication failed. Please check your API key.',
          details: error.message,
          recoverable: true
        };
      }
    }
    
    return {
      code: 'API_ERROR',
      message: 'Translation service is temporarily unavailable. Please try again later.',
      details: error instanceof Error ? error.message : String(error),
      recoverable: true
    };
  }

  handleParsingError(error: unknown): AppError {
    return {
      code: 'PARSING_ERROR',
      message: 'Failed to parse the LaTeX file. Please check the file format.',
      details: error instanceof Error ? error.message : String(error),
      recoverable: true
    };
  }

  handleClipboardError(error: unknown): AppError {
    return {
      code: 'CLIPBOARD_ERROR',
      message: 'Failed to copy to clipboard. Please try again or use the export feature.',
      details: error instanceof Error ? error.message : String(error),
      recoverable: true
    };
  }

  handleUnknownError(error: unknown): AppError {
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred. Please try refreshing the page.',
      details: error instanceof Error ? error.message : String(error),
      recoverable: false
    };
  }

  // Convenience methods
  reportFileError(error: unknown) {
    const appError = this.handleFileError(error);
    this.notifyError(appError);
    return appError;
  }

  reportStorageError(error: unknown) {
    const appError = this.handleStorageError(error);
    this.notifyError(appError);
    return appError;
  }

  reportApiError(error: unknown) {
    const appError = this.handleApiError(error);
    this.notifyError(appError);
    return appError;
  }

  reportParsingError(error: unknown) {
    const appError = this.handleParsingError(error);
    this.notifyError(appError);
    return appError;
  }

  reportClipboardError(error: unknown) {
    const appError = this.handleClipboardError(error);
    this.notifyError(appError);
    return appError;
  }

  reportUnknownError(error: unknown) {
    const appError = this.handleUnknownError(error);
    this.notifyError(appError);
    return appError;
  }
} 