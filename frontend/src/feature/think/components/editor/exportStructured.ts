import type { JSONContent } from '@tiptap/core'
import { toCells } from './inlineFormat'
import { FORMATS, FORMAT_TYPES, type FormatType } from './inlineMarkdown'

// 1行の文字列(**などを含む)を、マーク付きのテキストノードの並びにする
function textToNodes(text: string): JSONContent[] {
  const { cells } = toCells(text)
  const nodes: JSONContent[] = []
  let buffer = ''
  let current: FormatType[] = []

  const flush = () => {
    if (!buffer) return
    nodes.push({
      type: 'text',
      text: buffer,
      ...(current.length > 0 ? { marks: current.map((t) => ({ type: FORMATS[t].mark })) } : {}),
    })
    buffer = ''
  }

  for (const cell of cells) {
    const formats = FORMAT_TYPES.filter((t) => cell.formats.has(t))
    if (formats.join() !== current.join()) {
      flush()
      current = formats
    }
    buffer += cell.ch
  }
  flush()
  return nodes
}

// 例: toStructuredJSON(editor.getJSON())
export function toStructuredJSON(node: JSONContent): JSONContent {
  if (node.type === 'paragraph') {
    const text = (node.content ?? []).map((c) => c.text ?? '').join('')
    const content = textToNodes(text)
    const { content: _old, ...rest } = node
    return content.length > 0 ? { ...rest, content } : rest
  }
  return node.content ? { ...node, content: node.content.map(toStructuredJSON) } : node
}