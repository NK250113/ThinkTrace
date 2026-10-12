import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

const INIT = 'outline:ensure-ids'
// y-prosemirrorが、Yjs(他の人の変更・Undo・初期同期)由来のトランザクションに付ける印
const Y_SYNC = 'y-sync$'

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

        appendTransaction(transactions, _oldState, newState) {
          // 他の人の変更では何もしない(全員が同時にIDを振ると競合するため)
          const local = transactions.some(
            (tr) => tr.getMeta(INIT) || (tr.docChanged && !tr.getMeta(Y_SYNC))
          )
          if (!local) return null

          const seen = new Set<string>()
          const fixes: { pos: number; attrs: Record<string, unknown> }[] = []
          newState.doc.descendants((node, pos) => {
            if (node.type.name !== 'listItem') return
            const id = node.attrs.id as string | null
            if (!id || seen.has(id)) {
              fixes.push({ pos, attrs: { ...node.attrs, id: newId() } }) // 未設定、または貼り付けで重複した行
            } else {
              seen.add(id)
            }
          })
          if (fixes.length === 0) return null

          const tr = newState.tr
          for (const { pos, attrs } of fixes) tr.setNodeMarkup(pos, undefined, attrs)
          return tr.setMeta('addToHistory', false)
        },
      }),
    ]
  },
})