import { create } from 'zustand'

const useNotebookStore = create((set) => ({
  // Input mode
  inputMode: 'type',  // 'type' | 'write' | 'image'
  setInputMode: (mode) => set({ inputMode: mode }),

  // Current expression (LaTeX string from any input source)
  currentExpression: '',
  setCurrentExpression: (expression) => set({ currentExpression: expression }),

  // Solution data (null until solved)
  solution: null,
  setSolution: (solution) => set({ solution }),

  // Loading state
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  // Error state
  error: null,
  setError: (error) => set({ error }),

    // Toolbar action (type mode): 'clear' | 'undo' | 'redo' | 'copy' | null
    toolbarAction: null,
    setToolbarAction: (action) => set({ toolbarAction: action }),

    // Undo/redo availability (updated by TypedInputPanel from MathLive)
    canUndo: false,
    canRedo: false,
    setUndoState: (canUndo, canRedo) => set({ canUndo, canRedo }),

    // Math shortcut LaTeX to insert into the math field (type mode)
    shortcutInsert: null,
    setShortcutInsert: (latex) => set({ shortcutInsert: latex }),

  // Theme
  theme: localStorage.getItem('theme') || 'light',
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', newTheme)
    return { theme: newTheme }
  }),

  // Reset function (clears current problem)
  resetProblem: () => set({
    currentExpression: '',
    solution: null,
    error: null,
    isLoading: false,
  }),
}))

export default useNotebookStore
