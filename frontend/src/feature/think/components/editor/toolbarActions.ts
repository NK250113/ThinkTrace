import type { Editor } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'
import { fromCells, isFormatted, setFormat, toCells, type ParsedRow } from './inlineFormat'
import type { FormatType } from './inlineMarkdown'
import type { MarkerId } from '@/src/shared/utils/markerCatalog'
import { forEachItem, type ItemInfo } from './outlineUtils'

// 折りたたまれて見えない行か(祖先のどれかが、この人の画面で折りたたまれている)
function isHidden(editor: Editor, pos: number): boolean {
  const storage = editor.storage as unknown as Record<string, { collapsed?: Set<string> } | undefined>
  const collapsed = storage.outlineDecorations?.collapsed
  if (!collapsed || collapsed.size === 0) return false

  const $pos = editor.state.doc.resolve(pos) // posは<li>の直前の位置なので、祖先だけが対象になる
  for (let d = $pos.depth; d > 0; d--) {
    const ancestor = $pos.node(d)
    if (ancestor.type.name === 'listItem' && collapsed.has(ancestor.attrs.id as string)) return true
  }
  return false
}

// 選択にかかっている行(見えている行だけ)。ドキュメントの上から順に返す
function selectedRows(editor: Editor): ItemInfo[] {
  const { state } = editor
  const { selection } = state
  const { from, to, empty } = selection

  const all: ItemInfo[] = []
  forEachItem(state.doc, selection, (item) => all.push(item))

  const touched = all.filter((item) => item.active)
  // 範囲選択では、文字が1つでも選ばれている行だけを対象にする
  const overlapped = empty ? touched : all.filter((item) => from < item.end && to > item.start)
  const rows = overlapped.length > 0 ? overlapped : touched

  return rows.filter((item) => !isHidden(editor, item.pos))
}

// ボタンの「押せる/押せない」の判定用: 書式は、範囲選択があるときだけ設定できる
export function canFormatSelection(editor: Editor): boolean {
  return !editor.state.selection.empty
}

// 選択にかかっている全ての行のマーカーを変える(null ならマーカーを外す)
export function setMarkerForSelection(editor: Editor, markerId: MarkerId | null): boolean {
  const rows = selectedRows(editor)
  if (rows.length === 0) return false

  const tr = editor.state.tr
  for (const row of rows) {
    tr.setNodeMarkup(row.pos, undefined, { ...row.node.attrs, marker: markerId })
  }
  editor.view.dispatch(tr)
  editor.view.focus()
  return true
}

interface RowPlan {
  row: ItemInfo
  text: string // 段落の文字列(記号を含む)
  parsed: ParsedRow
  c0: number // 書式を付ける範囲(表示される文字の番号。[c0, c1))
  c1: number
}

// 選択範囲の書式(太字・斜体・打ち消し線)を付ける/外す。
// 選択した部分が全て書式付きなら外し、1文字でも書式がなければ全体に付ける。
// 書式は行をまたげないので、行ごとに「その行の中の選択部分」だけに適用する。
// 文書では、記号の文字を挿入・削除するだけなので、1回の操作は、1回のUndoで戻る
export function toggleFormatForSelection(editor: Editor, type: FormatType): boolean {
  const { state } = editor
  const { schema, selection } = state
  if (selection.empty) return false // 範囲選択がなければ、書式は設定できない

  // ① 行ごとに、書式を付ける範囲を決める
  const plans: RowPlan[] = []
  for (const row of selectedRows(editor)) {
    const text = row.node.firstChild!.textContent
    const parsed = toCells(text)

    // 先頭の行は選択の開始位置から行末まで、最後の行は行頭から選択の終了位置まで、間の行は行全体になる
    const i = Math.max(selection.from, row.start) - row.start
    const j = Math.min(selection.to, row.end) - row.start
    if (i >= j) continue

    // 文字列の位置 → 表示される文字の番号(記号の途中が選ばれていても、中身の範囲に直る)
    let c0 = parsed.cellBefore[i]!
    let c1 = parsed.cellBefore[j]!
    // 端の空白は、書式に含めない
    while (c0 < c1 && /\s/.test(parsed.cells[c0]!.ch)) c0++
    while (c1 > c0 && /\s/.test(parsed.cells[c1 - 1]!.ch)) c1--
    if (c0 < c1) plans.push({ row, text, parsed, c0, c1 })
  }
  if (plans.length === 0) return false // 空の行や空白だけの行しかない

  // ② 付けるか外すかを、選択全体で1つ決める
  const allFormatted = plans.every((p) => isFormatted(p.parsed.cells, p.c0, p.c1, type))

  // ③ 行ごとに、記号の部分だけを書き換える(上の行から順に。上の行の長さの変化は shift に溜める)
  const tr = state.tr
  let shift = 0
  let selFrom = selection.from
  let selTo = selection.to

  plans.forEach(({ row, text, parsed, c0, c1 }, index) => {
    setFormat(parsed.cells, c0, c1, type, !allFormatted)
    const out = fromCells(parsed.cells)
    const base = row.start + shift // この行の段落の先頭(上の行の変更を反映した位置)
    const n = parsed.cells.length

    // 文字と文字の間(記号が入る場所)を、1か所ずつ比べて、違うところだけ書き換える
    const edits: { from: number; to: number; insert: string }[] = []
    for (let k = 0; k <= n; k++) {
      const oldFrom = k === 0 ? 0 : parsed.positions[k - 1]! + 1
      const oldTo = k === n ? text.length : parsed.positions[k]!
      const newFrom = k === 0 ? 0 : out.ends[k - 1]!
      const newTo = k === n ? out.text.length : out.starts[k]!
      const insert = out.text.slice(newFrom, newTo)
      if (text.slice(oldFrom, oldTo) !== insert) {
        edits.push({ from: base + oldFrom, to: base + oldTo, insert })
      }
    }
    // 後ろの位置から先に書き換える(前の位置がずれないように)
    for (const e of edits.reverse()) {
      if (e.insert) tr.replaceWith(e.from, e.to, schema.text(e.insert))
      else tr.delete(e.from, e.to)
    }

    // 選択範囲は、書式を付けた文字のまま(記号は含めない)にする
    if (index === 0) selFrom = base + out.starts[c0]!
    if (index === plans.length - 1) selTo = base + out.ends[c1 - 1]!

    shift += out.text.length - text.length
  })

  if (!tr.docChanged) return false

  tr.setSelection(TextSelection.create(tr.doc, selFrom, selTo))
  editor.view.dispatch(tr)
  editor.view.focus()
  return true
}