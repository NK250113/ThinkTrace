import { useEditorState } from '@tiptap/react'
import { useOutline } from './EditorContext'
import type { FormatType } from './inlineMarkdown'
import { MARKER_IDS, MARKER_LABELS, ICON_REGISTRY } from '@/src/shared/utils/markerCatalog'
import {
  canFormatSelection,
  setMarkerForSelection,
  toggleFormatForSelection,
} from './toolbarActions'

const FORMAT_BUTTONS: { type: FormatType; label: string; className: string }[] = [
  { type: 'bold', label: 'B', className: 'font-bold' },
  { type: 'italic', label: 'I', className: 'italic' },
  { type: 'strike', label: 'S', className: 'line-through' },
]

const BUTTON =
  'flex h-8 min-w-8 items-center justify-center rounded border border-gray-300 px-2 text-sm hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent'

export default function Toolbar() {
  const { editor, settings } = useOutline()

  // フックは、editor が null のときも呼ぶ(条件分岐や早期returnの前に置く)
  // 選択範囲が変わるたびに、書式ボタンの「押せる/押せない」が更新される
  const canFormat = useEditorState({
    editor,
    selector: ({ editor }) => (editor ? canFormatSelection(editor) : false),
  })

  return (
    <div className="flex flex-wrap items-center gap-2">
      {FORMAT_BUTTONS.map(({ type, label, className }) => (
        <button
          key={type}
          type="button"
          disabled={!canFormat}
          onMouseDown={(e) => e.preventDefault()} // クリックで、エディタの選択が外れないように
          onClick={() => editor && toggleFormatForSelection(editor, type)}
          className={`${BUTTON} ${className}`}
        >
          {label}
        </button>
      ))}

      <span className="mx-1 h-5 w-px bg-gray-300" />

      {MARKER_IDS.map((id) => {
        const Icon = ICON_REGISTRY[settings[id].icon]
        return (
          <button
            key={id}
            type="button"
            title={MARKER_LABELS[id]}
            disabled={!editor}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor && setMarkerForSelection(editor, id)}
            className={BUTTON}
          >
            {Icon && <Icon size={18} />}
          </button>
        )
      })}

      <button
        type="button"
        disabled={!editor}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor && setMarkerForSelection(editor, null)}
        className={BUTTON}
      >
        解除
      </button>
    </div>
  )
}