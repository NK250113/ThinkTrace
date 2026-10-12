import { Extension, type Editor } from '@tiptap/core'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Strike from '@tiptap/extension-strike'
import type { Node as PMNode, Schema } from '@tiptap/pm/model'
import { Plugin, PluginKey, TextSelection, type Transaction } from '@tiptap/pm/state'
import { FORMATS, FORMAT_TYPES, parseInline } from './inlineMarkdown'
import { forEachItem, type ItemInfo } from './outlineUtils'

// 標準の太字・斜体・打ち消し線は、記号を打った瞬間に変換してしまうので、
// 入力ルール・貼り付けルール・ショートカットを外す(変換は、行を離れたときに自前で行う)
export const OutlineBold = Bold.extend({
  addInputRules() {
    return []
  },
  addPasteRules() {
    return []
  },
  addKeyboardShortcuts() {
    return {}
  },
})
export const OutlineItalic = Italic.extend({
  addInputRules() {
    return []
  },
  addPasteRules() {
    return []
  },
  addKeyboardShortcuts() {
    return {}
  },
})
export const OutlineStrike = Strike.extend({
  addInputRules() {
    return []
  },
  addPasteRules() {
    return []
  },
  addKeyboardShortcuts() {
    return {}
  },
})

const INIT = 'outline:inline-init'
const Y_SYNC = 'y-sync$' // Yjs(他の人の変更・Undo・初期同期)由来のトランザクションの印

// この人が展開している行のID。「展開すべき行」との差分から、展開・畳み込みを決める
const expandedKey = new PluginKey<Set<string>>('outlineInline')

// ---- 展開: マークを記号の文字に変える ----------------------------------

// 段落の中で、指定のマークが付いている連続範囲
function markRanges(para: PMNode, start: number, markName: string): [number, number][] {
  const ranges: [number, number][] = []
  let pos = start
  para.forEach((child) => {
    const end = pos + child.nodeSize
    if (child.marks.some((m) => m.type.name === markName)) {
      const last = ranges[ranges.length - 1]
      if (last && last[1] === pos) last[1] = end
      else ranges.push([pos, end])
    }
    pos = end
  })
  return ranges
}

interface Insert {
  pos: number
  text: string
  kind: 'open' | 'close'
  len: number // 囲まれる範囲の長さ(並び順の決定に使う)
  order: number
}

// 同じ位置に並べる順番: 閉じ記号が先。閉じは内側(短い範囲)が先、開きは外側(長い範囲)が先
function compareInserts(x: Insert, y: Insert): number {
  if (x.pos !== y.pos) return x.pos - y.pos
  if (x.kind !== y.kind) return x.kind === 'close' ? -1 : 1
  if (x.len !== y.len) return x.kind === 'close' ? x.len - y.len : y.len - x.len
  return x.order - y.order
}

export function expandRow(tr: Transaction, schema: Schema, para: PMNode, start: number): void {
  const text = para.textContent
  const inserts: Insert[] = []

  FORMAT_TYPES.forEach((type, order) => {
    const format = FORMATS[type]
    const markType = schema.marks[format.mark]
    if (!markType) return

    for (const [from, to] of markRanges(para, start, format.mark)) {
      tr.removeMark(from, to, markType)

      // 範囲の端の空白は、記号の外に出す(「** foo **」は太字として読み取れないため)
      let a = from
      let b = to
      while (a < b && /\s/.test(text[a - start] ?? '')) a++
      while (b > a && /\s/.test(text[b - 1 - start] ?? '')) b--
      if (a >= b) continue

      const len = b - a
      inserts.push(
        { pos: a, text: format.delimiter, kind: 'open', len, order },
        { pos: b, text: format.delimiter, kind: 'close', len, order }
      )
    }
  })

  // 後ろから挿入すれば、前の位置がずれない(同じ位置は、逆順に入れると狙いの順になる)
  inserts.sort(compareInserts)
  for (const ins of [...inserts].reverse()) {
    tr.insert(ins.pos, schema.text(ins.text))
  }
}

// ---- 畳み込み: 記号で囲まれた範囲をマークにする -----------------------

export function collapseRow(tr: Transaction, schema: Schema, para: PMNode, start: number): void {
  const spans = parseInline(para.textContent)
  if (spans.length === 0) return

  // ① マークを付ける(位置は変わらない)
  for (const span of spans) {
    const markType = schema.marks[FORMATS[span.type].mark]
    if (markType) tr.addMark(start + span.open[1], start + span.close[0], markType.create())
  }
  // ② 記号の文字を、後ろから削除する
  const ranges = spans.flatMap((s) => [s.open, s.close]).sort((a, b) => b[0] - a[0])
  for (const [from, to] of ranges) tr.delete(start + from, start + to)
}

// ---- ショートカット: 選択範囲を記号で囲む/外す ------------------------

function toggleDelimiter(editor: Editor, delim: string): boolean {
  const { state } = editor
  const { $from, $to, from, to } = state.selection
  if (!$from.sameParent($to) || $from.parent.type.name !== 'paragraph') return false

  const text = $from.parent.textContent
  const i = from - $from.start()
  const j = to - $from.start()
  const n = delim.length
  const ch = delim[0] ?? ''

  // 選択範囲の前後に、同じ文字がいくつ連なっているか
  let before = 0
  while (i - before > 0 && text[i - before - 1] === ch) before++
  let after = 0
  while (j + after < text.length && text[j + after] === ch) after++

  // 「*」は、2つ連なっていれば太字なので、奇数個のときだけ斜体とみなす
  const wrapped = n === 1 ? before % 2 === 1 && after % 2 === 1 : before >= n && after >= n

  return editor.commands.command(({ tr }) => {
    if (wrapped) {
      tr.delete(to, to + n).delete(from - n, from)
      tr.setSelection(TextSelection.create(tr.doc, from - n, to - n))
    } else {
      tr.insertText(delim, to).insertText(delim, from)
      tr.setSelection(TextSelection.create(tr.doc, from + n, to + n))
    }
    return true
  })
}

// ---- 拡張本体 ---------------------------------------------------------

export const OutlineInline = Extension.create({
  name: 'outlineInline',

  // 読み込み直後にも一度確認する
  onCreate() {
    this.editor.view.dispatch(this.editor.state.tr.setMeta(INIT, true))
  },

  addKeyboardShortcuts() {
    return {
      'Mod-b': ({ editor }) => toggleDelimiter(editor, FORMATS.bold.delimiter),
      'Mod-i': ({ editor }) => toggleDelimiter(editor, FORMATS.italic.delimiter),
      'Mod-Shift-s': ({ editor }) => toggleDelimiter(editor, FORMATS.strike.delimiter),
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin<Set<string>>({
        key: expandedKey,

        state: {
          init: () => new Set<string>(),
          apply: (tr, value) => (tr.getMeta(expandedKey) as Set<string> | undefined) ?? value,
        },

        appendTransaction(transactions, _oldState, newState) {
          // 他の人の変更だけなら、何もしない(畳み込みは、行を離れた本人の画面だけで行う)
          if (transactions.every((tr) => tr.getMeta(Y_SYNC))) return null
          const relevant = transactions.some(
            (tr) => tr.docChanged || tr.selectionSet || tr.getMeta(INIT)
          )
          if (!relevant) return null

          const expanded = expandedKey.getState(newState) ?? new Set<string>()

          // カーソルがある行(=展開しているべき行)のIDを集める
          const items = new Map<string, ItemInfo>()
          const shouldBe = new Set<string>()
          forEachItem(newState.doc, newState.selection, (item) => {
            const id = item.node.attrs.id as string | null
            if (!id) return // IDが振られるまで待つ
            items.set(id, item)
            if (item.active) shouldBe.add(id)
          })

          const ops: { item: ItemInfo; kind: 'expand' | 'collapse' }[] = []
          for (const id of shouldBe) {
            const item = items.get(id)
            if (item && !expanded.has(id)) ops.push({ item, kind: 'expand' })
          }
          for (const id of expanded) {
            const item = items.get(id)
            if (item && !shouldBe.has(id)) ops.push({ item, kind: 'collapse' })
          }

          const same = expanded.size === shouldBe.size && [...shouldBe].every((id) => expanded.has(id))
          if (ops.length === 0 && same) return null

          const tr = newState.tr
          // 後ろの行から処理すれば、前の行の位置がずれない
          ops.sort((a, b) => b.item.pos - a.item.pos)
          for (const { item, kind } of ops) {
            const para = item.node.firstChild!
            if (kind === 'expand') expandRow(tr, newState.schema, para, item.start)
            else collapseRow(tr, newState.schema, para, item.start)
          }
          tr.setMeta(expandedKey, shouldBe)
          return tr.setMeta('addToHistory', false)
        },
      }),
    ]
  },
})