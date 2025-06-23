export interface EditHistoryItem {
  id: string;
  content: string;
  timestamp: number;
}

export class UndoRedoManager {
  private undoStack: EditHistoryItem[] = [];
  private redoStack: EditHistoryItem[] = [];
  private maxHistorySize: number;

  constructor(maxHistorySize: number = 50) {
    this.maxHistorySize = maxHistorySize;
  }

  addEdit(id: string, content: string) {
    const item: EditHistoryItem = {
      id,
      content,
      timestamp: Date.now()
    };

    this.undoStack.push(item);
    this.redoStack = []; // Clear redo stack when new edit is made

    // Limit history size
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }
  }

  undo(): EditHistoryItem | null {
    if (this.undoStack.length === 0) return null;

    const item = this.undoStack.pop()!;
    this.redoStack.push(item);

    return item;
  }

  redo(): EditHistoryItem | null {
    if (this.redoStack.length === 0) return null;

    const item = this.redoStack.pop()!;
    this.undoStack.push(item);

    return item;
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clearHistory() {
    this.undoStack = [];
    this.redoStack = [];
  }

  getHistoryStats() {
    return {
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length,
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    };
  }
} 