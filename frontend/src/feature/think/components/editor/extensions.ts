import Document from '@tiptap/extension-document'
import ListItem, { type ListItemOptions } from '@tiptap/extension-list-item'
import { InputRule } from '@tiptap/core'
import type { Node as PMNode, ResolvedPos } from '@tiptap/pm/model'
import { TextSelection } from '@tiptap/pm/state'
import { DEFAULT_SETTINGS, type MarkerSettings } from '@/src/shared/utils/markerCatalog'
import { findMarkerIdByPrefix } from './markerSettings'
import enterBehavior from './enterBehaviors';

export const OutlineDocument = Document.extend({
  content: 'bulletList',
})

interface ItemContext {
  item: PMNode // カーソルがあるlistItem
  nested: boolean // 入れ子(親もlistItem)かどうか
}

// カーソルが「リスト項目の段落」にあるとき、その情報を返す
function getItemContext($from: ResolvedPos, name: string): ItemContext | null {
  if ($from.depth < 3) return null
  if ($from.parent.type.name !== 'paragraph') return null
  if ($from.node(-1).type.name !== name) return null
  return { item: $from.node(-1), nested: $from.node(-3).type.name === name }
}

interface OutlineItemOptions extends ListItemOptions {
  getSettings: () => MarkerSettings // この人の設定(行頭文字 → マーカーID の変換に使う)
}

export const OutlineItem = ListItem.extend<OutlineItemOptions>({
  content: 'paragraph bulletList?',

  addOptions() {
    return {
      HTMLAttributes: {},
      bulletListTypeName: 'bulletList',
      orderedListTypeName: 'orderedList',
      ...this.parent?.(),
      getSettings: () => DEFAULT_SETTINGS,
    }
  },

  // ドキュメントに保存される属性は、この2つだけ
  addAttributes() {
    return {
      // マーカーID(null = マーカーなし)。Enterで増えた新しい行には引き継がない
      marker: {
        default: null,
        keepOnSplit: false,
        parseHTML: (el: HTMLElement) => el.getAttribute('data-marker'),
        renderHTML: (attrs: Record<string, unknown>) =>
          attrs.marker ? { 'data-marker': String(attrs.marker) } : {},
      },
      // 行ID(個人ごとの状態を紐づけるために使う。UniqueRowId が振る)
      id: {
        default: null,
        keepOnSplit: false,
        parseHTML: (el: HTMLElement) => el.getAttribute('data-id'),
        renderHTML: (attrs: Record<string, unknown>) =>
          attrs.id ? { 'data-id': String(attrs.id) } : {},
      },
    }
  },

  // 行頭で「行頭文字 + 空白」を入力すると、その文字が消えてマーカーが付く
  addInputRules() {
    return [
      new InputRule({
        find: /^(\S+)[ \u3000]$/,
        handler: ({ state, range, match, chain }) => {
          const markerId = findMarkerIdByPrefix(this.options.getSettings(), match[1] ?? '')
          if (!markerId) return null // 未登録の文字は、そのまま普通の入力にする

          const $pos = state.doc.resolve(range.from)
          if ($pos.parentOffset !== 0 || !getItemContext($pos, this.name)) return null

          const liPos = $pos.before(-1)
          const attrs = $pos.node(-1).attrs
          chain()
            .deleteRange(range)
            .command(({ tr }) => {
              tr.setNodeMarkup(liPos, undefined, { ...attrs, marker: markerId })
              return true
            })
            .run()
        },
      }),
    ]
  },

  addKeyboardShortcuts() {
    return {
      ...this.parent?.(), // Tab / Shift-Tab は標準のまま

      Enter: ({ editor }) => {
        return enterBehavior({editor, name: this.name})
      },

      "Shift-Enter": ({ editor }) => {
        const { $from, empty } = editor.state.selection
        const ctx = empty ? getItemContext($from, this.name) : null
        if (!ctx) return false // ListItem 内でなければ通常の処理に任せる
        return this.editor.commands.splitListItem(this.name)
      },

      Backspace: ({ editor }) => {
        const { state } = editor
        const { $from, empty } = state.selection
        const ctx = empty && $from.parentOffset === 0 ? getItemContext($from, this.name) : null
        if (!ctx) return false // 行頭以外は通常の1文字削除

        // マーカーが付いている行 → まずマーカーを外す
        if (ctx.item.attrs.marker) {
          const liPos = $from.before(-1)
          return editor.commands.command(({ tr }) => {
            tr.setNodeMarkup(liPos, undefined, { ...ctx.item.attrs, marker: null })
            return true
          })
        }
        // 入れ子の行 → 字下げを戻す
        if (ctx.nested) {
          editor.commands.liftListItem(this.name)
          return true
        }
        // 最上位の先頭行、または子を持つ行 → 何もしない
        if ($from.index(-2) === 0 || ctx.item.childCount > 1) return true

        // それ以外 → 1つ前の行の末尾に結合(空行なら単に消える)
        let prevEnd = -1
        state.doc.nodesBetween(0, $from.before(), (node, pos) => {
          if (node.type.name === 'paragraph') prevEnd = pos + node.nodeSize - 1
        })
        if (prevEnd < 0) return true

        const text = $from.parent.content
        const itemPos = $from.before(-1)
        const itemSize = ctx.item.nodeSize

        return editor.commands.command(({ tr }) => {
          tr.delete(itemPos, itemPos + itemSize)
          tr.insert(prevEnd, text)
          tr.setSelection(TextSelection.create(tr.doc, prevEnd))
          return true
        })
      },
    }
  },
})