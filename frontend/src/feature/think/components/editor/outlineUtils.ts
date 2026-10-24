import type { Node as PMNode } from '@tiptap/pm/model'
import type { Selection, Transaction } from '@tiptap/pm/state'

// y-prosemirrorが、Yjs(他の人の変更・Undo・初期同期)由来のトランザクションに付ける印
export const Y_SYNC = 'y-sync$'

export interface ItemInfo {
  node: PMNode // listItem
  pos: number // listItemの直前の位置
  start: number // 段落の文字の始まり
  end: number // 段落の文字の終わり
  active: boolean // 選択範囲がこの行の段落に重なっているか
}

// 1つの listItem から、行の情報を作る
export function toItemInfo(node: PMNode, pos: number, selection: Selection): ItemInfo {
  const para = node.firstChild!
  const start = pos + 2
  const end = pos + para.nodeSize
  return { node, pos, start, end, active: selection.from <= end && selection.to >= start }
}

export function forEachItem(
  doc: PMNode,
  selection: Selection,
  fn: (item: ItemInfo) => void
): void {
  doc.descendants((node, pos) => {
    if (node.type.name !== 'listItem') return
    fn(toItemInfo(node, pos, selection))
  })
}

export function hasUserEdit(transactions: readonly Transaction[]): boolean {
  return transactions.some(
    (tr) => tr.docChanged && tr.getMeta('addToHistory') !== false && !tr.getMeta(Y_SYNC)
  )
}