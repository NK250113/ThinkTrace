import { type Editor } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';

type enterBehaviorProps = {
  editor: Editor;
  name: string;
}
export default function enterBehaviors({editor, name}: enterBehaviorProps) : boolean {
  const { state } = editor
  const { selection } = state
  const { $from, empty } = selection

  // カーソルがある ListItem を探す
  let depth = $from.depth

  while (
    depth > 0 &&
    $from.node(depth).type.name !== name
  ) {
    depth--
  }

  if (depth === 0) {
    return false
  }

  const listItem = $from.node(depth)
  const marker = listItem.attrs.marker

  switch (marker) {
    case "Hypothesis":
    case "question":
      return createValley({editor, name, depth, marker: "Summary"});
    case "comPare":
      return createValley({editor, name, depth, marker: "comPare"});

    case "Goal":
      return createSlope({editor, name, depth, marker: "Method"})
    case "If":
      return createSlope({editor, name, depth, marker: null})
    case "important":
    case "Reference":
    case "quote":
      return createNone({editor, name, depth});
    default:
      return createSelf({editor, name, depth});
  }
}


// ここから動作の定義
type eachBehaviorProps = {
  editor: Editor;
  name?: string;
  depth?: number;
  marker?: string | null;
}

function createNone({editor, name, depth}: eachBehaviorProps) {
  if (name === undefined || depth === undefined) return false
  const { state } = editor
  const { selection } = state
  const { $from, empty } = selection

  const listItem = $from.node(depth)

  if (empty && $from.parent.content.size === 0) { // 空行の状態では少し特殊な処理をする
    const listItemType = state.schema.nodes[name]
    const paragraphType = state.schema.nodes.paragraph

    // marker を引き継いだ新しい ListItem を作る
    const paragraph = paragraphType.createAndFill()
    const newItem = listItemType.createAndFill(paragraph)

    if (!newItem) {
      return false
    }

    // 現在の ListItem の直後に挿入
    const pos = $from.after(depth)
    const tr = state.tr.insert(pos, newItem)

    // 新しい段落の中にカーソルを移動
    tr.setSelection(
      TextSelection.near(tr.doc.resolve(pos + 2)),
    )

    editor.view.dispatch(tr.scrollIntoView())
    return true
  }

  // 空行でなければ通常のリスト分割
  return editor.commands.splitListItem(name)
}

function createSelf({editor, name, depth}: eachBehaviorProps) {
  if (name === undefined || depth === undefined) return false
  const { state } = editor
  const { selection } = state
  const { $from, empty } = selection

  const listItem = $from.node(depth)
  const marker = listItem.attrs.marker

  if (empty && $from.parent.content.size === 0) { // 空行の状態では少し特殊な処理をする
    const listItemType = state.schema.nodes[name]
    const paragraphType = state.schema.nodes.paragraph

    // marker を引き継いだ新しい ListItem を作る
    const paragraph = paragraphType.createAndFill()
    const newItem = listItemType.createAndFill(
      { ...listItem.attrs, marker },
      paragraph,
    )

    if (!newItem) {
      return false
    }

    // 現在の ListItem の直後に挿入
    const pos = $from.after(depth)
    const tr = state.tr.insert(pos, newItem)

    // 新しい段落の中にカーソルを移動
    tr.setSelection(
      TextSelection.near(tr.doc.resolve(pos + 2)),
    )

    editor.view.dispatch(tr.scrollIntoView())
    return true
  }

  // 空行でなければ通常のリスト分割
  return editor.commands.splitListItem(name, {marker})
}

function createValley({editor, name, depth, marker}: eachBehaviorProps) {
  if (name === undefined || depth === undefined) return false
  const { state, view } = editor
  const { selection } = state
  const { $from, empty } = selection

  if (!empty) return false
  if ($from.parentOffset !== $from.parent.content.size) {
    const selfMarker = $from.node(depth).attrs.marker
    return editor.commands.splitListItem(name, {marker: selfMarker})

  }

  const listItem = $from.node(depth)
  const listItemType = listItem.type
  const bulletListType = state.schema.nodes.bulletList
  const paragraphType = state.schema.nodes.paragraph

  if (!bulletListType || !paragraphType) return false

  // 内側の ListItem と BulletList を作成
  const innerParagraph = paragraphType.create()
  const innerItem = listItemType.createAndFill(
    { marker: null },
    innerParagraph,
  )
  if (!innerItem) return false

  const nestedList = bulletListType.createAndFill(null, innerItem)
  if (!nestedList) return false

  // 新しい外側 ListItem を作成
  const outerParagraph = paragraphType.create()
  const outerItem = listItemType.createAndFill(
    { ...listItem.attrs, marker },
    outerParagraph,
  )
  if (!outerItem) return false

  // 挿入前の位置をそれぞれ取得
  const nestedListPos = $from.after(depth + 1)
  const outerItemPos = $from.after(depth)

  // 後ろの位置から挿入
  const tr = state.tr
  tr.insert(outerItemPos, outerItem)
  tr.insert(nestedListPos, nestedList)

  // 新しい内側 Paragraph にカーソルを移動
  const cursorPos = nestedListPos + 2

  tr.setSelection(
    TextSelection.near(tr.doc.resolve(cursorPos), 1),
  )

  view.dispatch(tr.scrollIntoView())
  return true
}

function createSlope({editor, name, depth, marker}: eachBehaviorProps) {
  if (name === undefined || depth === undefined) return false
  const { state, view } = editor
  const { selection } = state
  const { $from, empty } = selection

  if (!empty) return false
  if ($from.parentOffset !== $from.parent.content.size) {
    const selfMarker = $from.node(depth).attrs.marker
    return editor.commands.splitListItem(name, {marker: selfMarker})
  }

  const listItem = $from.node(depth)
  const listItemType = listItem.type
  const bulletListType = state.schema.nodes.bulletList
  const paragraphType = state.schema.nodes.paragraph

  if (!bulletListType || !paragraphType) return false

  // 内側の ListItem と BulletList を作成
  const innerParagraph = paragraphType.create()
  const innerItem = listItemType.createAndFill(
    { marker },
    innerParagraph,
  )
  if (!innerItem) return false

  const nestedList = bulletListType.createAndFill(null, innerItem)
  if (!nestedList) return false

  // 挿入前の位置をそれぞれ取得
  const nestedListPos = $from.after(depth + 1)

  // 後ろの位置から挿入
  const tr = state.tr
  tr.insert(nestedListPos, nestedList)

  // 新しい内側 Paragraph にカーソルを移動
  const cursorPos = nestedListPos + 2

  tr.setSelection(
    TextSelection.near(tr.doc.resolve(cursorPos), 1),
  )

  view.dispatch(tr.scrollIntoView())
  return true
}
