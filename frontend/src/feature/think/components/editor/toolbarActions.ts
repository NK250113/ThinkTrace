import type { Editor } from '@tiptap/core'
import type { MarkType, Node as PMNode } from '@tiptap/pm/model'
import { TextSelection } from '@tiptap/pm/state'
import { FORMATS, type FormatType } from './inlineMarkdown'
import { collapseRow, expandRow } from './inlineSync'
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
  // (行末にちょうど触れているだけの前の行は含めない)
  const overlapped = empty ? touched : all.filter((item) => from < item.end && to > item.start)
  const rows = overlapped.length > 0 ? overlapped : touched

  return rows.filter((item) => !isHidden(editor, item.pos))
}

function isFullyMarked(doc: PMNode, from: number, to: number, markType: MarkType): boolean {
  let all = true
  doc.nodesBetween(from, to, (node) => {
    if (node.isText && !markType.isInSet(node.marks)) all = false
  })
  return all
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

// 選択範囲の書式(太字・斜体・打ち消し線)を付ける/外す。
// 選択した部分が全て書式付きなら外し、1文字でも書式がなければ全体に付ける。
// 書式は行をまたげないので、行ごとに「その行の中の選択部分」だけに適用する
export function toggleFormatForSelection(editor: Editor, type: FormatType): boolean {
  const { state } = editor
  const { schema, selection } = state
  if (selection.empty) return false // 範囲選択がなければ、書式は設定できない

  const markType = schema.marks[FORMATS[type].mark]
  const rows = selectedRows(editor)
  console.log('toggleFormatForSelection', type, FORMATS[type].mark, schema.marks.bold, markType, rows.length)
  if (!markType || rows.length === 0) return false

  const tr = state.tr

  // ① 選択行を、記号の文字を解釈して、マークの状態に戻す(後ろの行から処理して、前の行の位置をずらさない)
  for (const row of [...rows].reverse()) {
    collapseRow(tr, schema, row.node.firstChild!, row.start)
  }
  const from = tr.mapping.map(selection.from)
  const to = tr.mapping.map(selection.to)

  // ② 行ごとに、書式を付ける範囲を決める
  const liPositions: number[] = []
  const targets: { from: number; to: number }[] = []
  for (const row of rows) {
    const liPos = tr.mapping.map(row.pos)
    const para = tr.doc.nodeAt(liPos)?.firstChild
    if (!para) continue
    liPositions.push(liPos)

    // 先頭の行は選択の開始位置から行末まで、最後の行は行頭から選択の終了位置まで、間の行は行全体になる
    const a = Math.max(from, liPos + 2)
    const b = Math.min(to, liPos + para.nodeSize)
    if (a >= b) continue

    // 端の空白は書式の外に出す(「** foo **」は太字として読み取れないため)
    const text = tr.doc.textBetween(a, b)
    const ta = a + (text.length - text.trimStart().length)
    const tb = b - (text.length - text.trimEnd().length)
    if (ta < tb) targets.push({ from: ta, to: tb })
  }
  if (targets.length === 0) return false // 空の行や空白だけの行しかない

  // ③ 書式を付ける/外す
  const allMarked = targets.every((t) => isFullyMarked(tr.doc, t.from, t.to, markType))
  for (const t of targets) {
    if (allMarked) tr.removeMark(t.from, t.to, markType)
    else tr.addMark(t.from, t.to, markType.create())
  }

  // ④ 選択行を、記号が見える状態に戻す
  const expandFrom = tr.steps.length
  for (const liPos of [...liPositions].reverse()) {
    const para = tr.doc.nodeAt(liPos)?.firstChild
    if (para) expandRow(tr, schema, para, liPos + 2)
  }

  // ⑤ 選択範囲を、書式を付けた文字のまま(記号は含めない)にする
  const m = tr.mapping.slice(expandFrom)
  const first = targets[0]!
  const last = targets[targets.length - 1]!
  tr.setSelection(TextSelection.create(tr.doc, m.map(first.from, 1), m.map(last.to, -1)))

  editor.view.dispatch(tr)
  editor.view.focus()
  return true
}