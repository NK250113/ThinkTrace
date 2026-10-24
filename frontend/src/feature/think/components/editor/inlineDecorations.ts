import type { Node as PMNode } from '@tiptap/pm/model'
import { Decoration } from '@tiptap/pm/view'
import { FORMATS, parseInline, type Span } from './inlineMarkdown'

// 段落ごとに、解析結果を覚えておく。変わっていない段落は、同じオブジェクトなので、解析し直さずに済む
const spanCache = new WeakMap<PMNode, Span[]>()

function spansOf(para: PMNode): Span[] {
  let spans = spanCache.get(para)
  if (!spans) {
    spans = parseInline(para.textContent)
    spanCache.set(para, spans)
  }
  return spans
}

export function inlineDecorations(para: PMNode, start: number, active: boolean): Decoration[] {
  const decos: Decoration[] = []
  const delimiterAttrs = active ? { class: 'text-gray-400' } : { style: 'display:none' }

  for (const span of spansOf(para)) {
    decos.push(
      Decoration.inline(
        start + span.open[1],
        start + span.close[0],
        { class: FORMATS[span.type].className },
        { tag: 'fmt-body' }
      ),
      Decoration.inline(start + span.open[0], start + span.open[1], delimiterAttrs, {
        tag: 'fmt-delim',
        hidden: !active,
      }),
      Decoration.inline(start + span.close[0], start + span.close[1], delimiterAttrs, {
        tag: 'fmt-delim',
        hidden: !active,
      })
    )
  }
  return decos
}