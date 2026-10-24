import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { hasUserEdit, Y_SYNC } from './outlineUtils';

const INIT = 'outline:ensure-ids'

const newId = (): string =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

export const UniqueRowId = Extension.create({
  name: 'uniqueRowId',

  // 読み込み直後にも一度確認する
  onCreate() {
    this.editor.view.dispatch(this.editor.state.tr.setMeta(INIT, true))
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('uniqueRowId'),
        appendTransaction(transactions, oldState, newState) {
          // 他の人の変更では何もしない(全員が同時にIDを振ると競合するため)
          const local = transactions.some(
            (tr) => tr.getMeta(INIT) || (tr.docChanged && !tr.getMeta(Y_SYNC))
          )
          if (!local) return null

          // 貼り付け・ドロップ・読み込み直後だけ、全行を調べる(IDが重複しうるのは、このときだけ)
          const full = transactions.some((tr) => {
            const ui = tr.getMeta('uiEvent') as string | undefined
            return tr.getMeta(INIT) || ui === 'paste' || ui === 'drop'
          })

          // それ以外は、変わった範囲だけを調べる
          let from = 0
          let to = newState.doc.content.size
          if (!full) {
            const start = oldState.doc.content.findDiffStart(newState.doc.content)
            if (start == null) return null // 文書は変わっていない
            const end = oldState.doc.content.findDiffEnd(newState.doc.content)
            from = start
            to = Math.max(start, end ? end.b : start)
          }

          const seen = new Set<string>()
          const fixes: { pos: number; attrs: Record<string, unknown> }[] = []
          newState.doc.nodesBetween(from, to, (node, pos) => {
            if (node.type.name !== 'listItem') return
            const id = node.attrs.id as string | null
            if (!id || (full && seen.has(id))) {
              fixes.push({ pos, attrs: { ...node.attrs, id: newId() } }) // 未設定、または貼り付けで重複した行
            } else if (full) {
              seen.add(id)
            }
          })
          if (fixes.length === 0) return null

          const tr = newState.tr
          for (const { pos, attrs } of fixes) tr.setNodeMarkup(pos, undefined, attrs)
          return hasUserEdit(transactions) ? tr : tr.setMeta('addToHistory', false)
        },
      }),
    ]
  },
})