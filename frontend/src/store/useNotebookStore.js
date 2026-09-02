import { create } from 'zustand'
import { solveProblem, getErrorMessage } from '../services/problemService'

const useNotebookStore = create((set, get) => ({
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

  // Solve the current expression via the backend API
  solveCurrentProblem: async () => {
    const { currentExpression, isLoading } = get()
    // Guard: don't solve if already loading or no expression
    if (isLoading || !currentExpression.trim()) return

    set({ isLoading: true, error: null, solution: null })

    try {
      const result = await solveProblem(currentExpression)
      set({ solution: result })
    } catch (err) {
      const message = getErrorMessage(err.code, err.message)
      set({ error: message, solution: null })
    } finally {
      set({ isLoading: false })
    }
  },
}))

export default useNotebookStore
