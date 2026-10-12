import type { Node as PMNode } from '@tiptap/pm/model'
import type { Selection } from '@tiptap/pm/state'
import { Decoration } from '@tiptap/pm/view'

// マーク名 → Markdownの記号。増やすときはここに足す(対応するTiptapの拡張も必要)
export const MARK_DELIMITERS: Record<string, string> = {
  bold: '**',
  italic: '*',
  strike: '~~',
  code: '`',
}

// 記号を出す範囲: 'row' = カーソルがある行の全部 / 'span' = カーソルが触れている範囲だけ
const REVEAL_SCOPE: 'row' | 'span' = 'row'

// 同じ位置に記号が並ぶときの順番(sideが小さいほど先)。閉じ記号 < 開き記号。
// 開き記号は外側(長い範囲)が先、閉じ記号は内側(短い範囲)が先になるようにする
const CLOSE_BASE = 0
const OPEN_BASE = 1_000_000

function makeDelimiter(text: string): HTMLElement {
  const el = document.createElement('span')
  el.className = 'select-none font-mono text-sm text-gray-400'
  el.contentEditable = 'false'
  el.textContent = text
  return el
}

// 段落の中で、指定したマークが付いている連続範囲を返す
function markRanges(para: PMNode, start: number, markName: string): [number, number][] {
  const ranges: [number, number][] = []
  let pos = start
  para.forEach((child) => {
    const end = pos + child.nodeSize
    if (child.marks.some((m) => m.type.name === markName)) {
      const last = ranges[ranges.length - 1]
      if (last && last[1] === pos) last[1] = end // 隣り合う範囲はひとつにまとめる
      else ranges.push([pos, end])
    }
    pos = end
  })
  return ranges
}

// 太字などの範囲の前後に、記号のウィジェットを作る(表示だけで、本文ではない)
export function delimiterDecorations(
  para: PMNode,
  start: number, // 段落の文字の始まり
  selection: Selection
): Decoration[] {
  const decos: Decoration[] = []

  for (const [markName, text] of Object.entries(MARK_DELIMITERS)) {
    for (const [from, to] of markRanges(para, start, markName)) {
      if (REVEAL_SCOPE === 'span' && !(selection.from <= to && selection.to >= from)) continue

      const len = to - from
      // marks: [] は「どの書式の内側にも入れない」指定(記号が太字などにならないように)
      decos.push(
        Decoration.widget(from, () => makeDelimiter(text), {
          side: OPEN_BASE - len,
          key: `delim-${markName}`,
          marks: [],
        }),
        Decoration.widget(to, () => makeDelimiter(text), {
          side: CLOSE_BASE + len,
          key: `delim-${markName}`,
          marks: [],
        })
      )
    }
  }
  return decos
}