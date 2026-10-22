import { Extension, type Editor } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'
import { FORMATS, type FormatType } from './inlineMarkdown'
import { toggleFormatForSelection } from './toolbarActions'

function formatOrInsertPair(editor: Editor, type: FormatType): boolean {
  const { state } = editor
  const { selection } = state
  if (!selection.empty) return toggleFormatForSelection(editor, type)

  if (selection.$from.parent.type.name !== 'paragraph') return false
  const delim = FORMATS[type].delimiter
  const tr = state.tr.insertText(delim + delim, selection.from)
  tr.setSelection(TextSelection.create(tr.doc, selection.from + delim.length))
  editor.view.dispatch(tr)
  return true
}

export const OutlineShortcuts = Extension.create({
  name: 'outlineShortcuts',

  addKeyboardShortcuts() {
    return {
      'Mod-b': ({ editor }) => formatOrInsertPair(editor, 'bold'),
      'Mod-i': ({ editor }) => formatOrInsertPair(editor, 'italic'),
      'Mod-Shift-s': ({ editor }) => formatOrInsertPair(editor, 'strike'),
    }
  },
})