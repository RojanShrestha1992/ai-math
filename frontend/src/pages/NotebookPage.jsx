import { useEffect, useRef } from 'react'
import InputModeSwitcher from '../components/notebook/InputModeSwitcher'
import Toolbar from '../components/notebook/Toolbar'
import InputArea from '../components/notebook/InputArea'
import MathShortcuts from '../components/notebook/MathShortcuts'
import ExpressionPreview from '../components/notebook/ExpressionPreview'
import SolveButton from '../components/notebook/SolveButton'
import SolutionPanel from '../components/notebook/SolutionPanel'
import useNotebookStore from '../store/useNotebookStore'

function NotebookPage() {
  const inputRef = useRef(null)
  const solutionRef = useRef(null)

  const currentExpression = useNotebookStore((state) => state.currentExpression)
  const solution = useNotebookStore((state) => state.solution)
  const isLoading = useNotebookStore((state) => state.isLoading)
  const setSolution = useNotebookStore((state) => state.setSolution)
  const setError = useNotebookStore((state) => state.setError)
  const solveCurrentProblem = useNotebookStore((state) => state.solveCurrentProblem)

  // Scroll to the solution panel when a new solution arrives (mobile/tablet only)
  useEffect(() => {
    if (solution && solutionRef.current) {
      const isMobileOrTablet = window.matchMedia('(max-width: 1023px)').matches
      if (isMobileOrTablet) {
        solutionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [solution])

  // Clear the previous solution/error when the user edits the expression.
  // Debounced so transient edits don't wipe the solution while typing.
  // Only triggers on expression changes (not when a solution/error is set),
  // and only clears the result that was stale at schedule time — so a freshly
  // solved result (or error) isn't wiped by a pending timer.
  const lastExpressionRef = useRef(currentExpression)
  const clearTimerRef = useRef(null)
  useEffect(() => {
    if (lastExpressionRef.current === currentExpression) return
    lastExpressionRef.current = currentExpression
    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current)
    }
    const staleSolution = useNotebookStore.getState().solution
    const staleError = useNotebookStore.getState().error
    clearTimerRef.current = setTimeout(() => {
      const state = useNotebookStore.getState()
      if (state.solution === staleSolution && state.error === staleError) {
        setSolution(null)
        setError(null)
      }
    }, 600)
    return () => {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current)
    }
  }, [currentExpression, setSolution, setError])

  // Keyboard shortcut: Ctrl+Enter (or Cmd+Enter) to solve.
  // Avoids interfering with MathLive's own Enter handling.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault()
        if (currentExpression.trim() && !isLoading) {
          solveCurrentProblem()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentExpression, isLoading, solveCurrentProblem])

  // Retry the solve after an error
  const handleRetry = () => {
    setError(null)
    solveCurrentProblem()
  }

  return (
    <div className="space-y-6">
      <InputModeSwitcher />
      <Toolbar />
      <InputArea ref={inputRef} />
      <MathShortcuts />
      <ExpressionPreview />
      <div className="flex justify-center">
        <SolveButton />
      </div>
      <div ref={solutionRef}>
        <SolutionPanel onRetry={handleRetry} />
      </div>
    </div>
  )
}

export default NotebookPage
