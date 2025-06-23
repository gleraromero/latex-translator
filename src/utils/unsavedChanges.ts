export class UnsavedChangesManager {
  private hasUnsavedChanges = false;
  private listeners: ((hasChanges: boolean) => void)[] = [];

  setHasUnsavedChanges(hasChanges: boolean) {
    this.hasUnsavedChanges = hasChanges;
    this.listeners.forEach(listener => listener(hasChanges));
  }

  getHasUnsavedChanges(): boolean {
    return this.hasUnsavedChanges;
  }

  onUnsavedChangesChange(listener: (hasChanges: boolean) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  setupBeforeUnloadWarning() {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (this.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }
} 