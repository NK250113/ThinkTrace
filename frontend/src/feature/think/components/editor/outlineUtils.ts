import type { Node as PMNode } from '@tiptap/pm/model'
import type { Selection } from '@tiptap/pm/state'

export interface ItemInfo {
  node: PMNode // listItem
  pos: number // listItemの直前の位置
  start: number // 段落の文字の始まり
  end: number // 段落の文字の終わり
  active: boolean // 選択範囲がこの行の段落に重なっているか
}

export function forEachItem(
  doc: PMNode,
  selection: Selection,
  fn: (item: ItemInfo) => void
): void {
  doc.descendants((node, pos) => {
    if (node.type.name !== 'listItem') return
    const para = node.firstChild!
    const start = pos + 2
    const end = pos + para.nodeSize
    fn({ node, pos, start, end, active: selection.from <= end && selection.to >= start })
  })
}