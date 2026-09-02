import InputModeSwitcher from '../components/notebook/InputModeSwitcher'
import Toolbar from '../components/notebook/Toolbar'
import InputArea from '../components/notebook/InputArea'
import MathShortcuts from '../components/notebook/MathShortcuts'
import ExpressionPreview from '../components/notebook/ExpressionPreview'
import SolveButton from '../components/notebook/SolveButton'
import SolutionPanel from '../components/notebook/SolutionPanel'

function NotebookPage() {
  return (
    <div className="space-y-6">
      <InputModeSwitcher />
      <Toolbar />
      <InputArea />
      <MathShortcuts />
      <ExpressionPreview />
      <div className="flex justify-center">
        <SolveButton />
      </div>
      <SolutionPanel />
    </div>
  )
}

export default NotebookPage
