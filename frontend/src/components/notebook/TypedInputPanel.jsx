import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import 'mathlive'
import useNotebookStore from '../../store/useNotebookStore'

/**
 * MathLive-powered math input panel for the "type" mode.
 * Exposes imperative methods (setValue, insert, undo, redo, clear, focus)
 * so parent components can control the math field programmatically.
 */
const TypedInputPanel = forwardRef(function TypedInputPanel(_, ref) {
  const mathFieldRef = useRef(null)
  const [mathLiveFailed, setMathLiveFailed] = useState(false)

  const setCurrentExpression = useNotebookStore((state) => state.setCurrentExpression)
    const setUndoState = useNotebookStore((state) => state.setUndoState)
    const toolbarAction = useNotebookStore((state) => state.toolbarAction)
    const setToolbarAction = useNotebookStore((state) => state.setToolbarAction)
    const shortcutInsert = useNotebookStore((state) => state.shortcutInsert)
    const setShortcutInsert = useNotebookStore((state) => state.setShortcutInsert)

  // Configure the math-field options after mount
  useEffect(() => {
    const mathField = mathFieldRef.current
    if (!mathField) return

    try {
      mathField.virtualKeyboardMode = 'onfocus'
      mathField.smartFence = true
      mathField.smartSuperscript = true
      mathField.removeExtraneousParentheses = true
      mathField.defaultMode = 'math'
      mathField.virtualKeyboards = 'math roman'
    } catch {
      setMathLiveFailed(true)
    }
  }, [])

  // Keep the store in sync with what the user types
  useEffect(() => {
    const mathField = mathFieldRef.current
    if (!mathField) return

    const handleInput = () => {
      setCurrentExpression(mathField.value)
    }

      const handleUndoState = () => {
        setUndoState(mathField.canUndo(), mathField.canRedo())
      }

      mathField.addEventListener('input', handleInput)
      mathField.addEventListener('undo-state-change', handleUndoState)
      return () => {
        mathField.removeEventListener('input', handleInput)
        mathField.removeEventListener('undo-state-change', handleUndoState)
      }
    }, [setCurrentExpression, setUndoState])

  // Execute toolbar commands (clear / undo / redo) then reset the action
  useEffect(() => {
    if (!toolbarAction) return
    const mathField = mathFieldRef.current
    if (!mathField) return

    if (toolbarAction === 'clear') {
      mathField.setValue('')
      setCurrentExpression('')
      useNotebookStore.getState().setSolution(null)
    } else if (toolbarAction === 'undo') {
      mathField.executeCommand('undo')
    } else if (toolbarAction === 'redo') {
      mathField.executeCommand('redo')
    }

    setToolbarAction(null)
  }, [toolbarAction, setCurrentExpression, setToolbarAction])

  // Insert LaTeX from the math shortcuts panel at the cursor position
  useEffect(() => {
    if (shortcutInsert === null) return
    const mathField = mathFieldRef.current
    if (!mathField) return

    mathField.insert(shortcutInsert)
    mathField.focus()
    setCurrentExpression(mathField.value)
    setShortcutInsert(null)
  }, [shortcutInsert, setCurrentExpression, setShortcutInsert])

  useImperativeHandle(
    ref,
    () => ({
      setValue: (latex) => {
        const mathField = mathFieldRef.current
        if (!mathField) return
        mathField.setValue(latex)
        setCurrentExpression(latex)
      },
      insert: (latex) => {
        const mathField = mathFieldRef.current
        if (!mathField) return
        mathField.insert(latex)
        mathField.focus()
        setCurrentExpression(mathField.value)
      },
      undo: () => mathFieldRef.current?.executeCommand('undo'),
      redo: () => mathFieldRef.current?.executeCommand('redo'),
      clear: () => {
        const mathField = mathFieldRef.current
        if (!mathField) return
        mathField.setValue('')
        setCurrentExpression('')
      },
      focus: () => mathFieldRef.current?.focus(),
      canUndo: () => mathFieldRef.current?.canUndo() ?? false,
      canRedo: () => mathFieldRef.current?.canRedo() ?? false,
    }),
    [setCurrentExpression]
  )

  // Graceful fallback if MathLive fails to load
  if (mathLiveFailed) {
    return (
      <div>
        <label htmlFor="typed-fallback" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Type your math problem
        </label>
        <textarea
          id="typed-fallback"
          rows={4}
          placeholder="e.g. x^2 + 5x + 6 = 0"
          onChange={(event) => setCurrentExpression(event.target.value)}
          className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none resize-y"
        />
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          Math editor failed to load. Using plain text input instead.
        </p>
      </div>
    )
  }

  return (
    <div>
      <label htmlFor="math-field" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Type your math problem
      </label>
      <math-field
        id="math-field"
        ref={mathFieldRef}
        style={{
          width: '100%',
          minHeight: '120px',
          fontSize: '1.5rem',
          padding: '16px',
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          outline: 'none',
        }}
        className="math-field-custom bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
      />
    </div>
  )
})

export default TypedInputPanel
