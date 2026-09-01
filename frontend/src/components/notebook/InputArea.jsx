import useNotebookStore from '../../store/useNotebookStore'
import TypedInputPanel from './TypedInputPanel'
import HandwritingPanel from './HandwritingPanel'
import ImageUploadPanel from './ImageUploadPanel'

const PANELS = {
  type: TypedInputPanel,
  write: HandwritingPanel,
  image: ImageUploadPanel,
}

function InputArea() {
  const inputMode = useNotebookStore((state) => state.inputMode)
  const Panel = PANELS[inputMode] || TypedInputPanel

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 min-h-[13rem]">
      <Panel />
    </div>
  )
}

export default InputArea