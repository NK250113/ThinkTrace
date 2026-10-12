import type { Node as PMNode } from '@tiptap/pm/model'
import { Decoration } from '@tiptap/pm/view'
import { FORMATS, parseInline } from './inlineMarkdown'

// 段落の文字に含まれる記号を解釈して、書式の見た目を付ける。
// カーソルがある行(active)は記号を薄く表示し、ない行は記号を隠す。
// 展開中の行を、他の人の画面で表示するときにも使う
export function inlineDecorations(para: PMNode, start: number, active: boolean): Decoration[] {
  const decos: Decoration[] = []
  const delimiterAttrs = active ? { class: 'text-gray-400' } : { style: 'display:none' }

  for (const span of parseInline(para.textContent)) {
    decos.push(
      Decoration.inline(start + span.open[1], start + span.close[0], {
        class: FORMATS[span.type].className,
      }),
      Decoration.inline(start + span.open[0], start + span.open[1], delimiterAttrs),
      Decoration.inline(start + span.close[0], start + span.close[1], delimiterAttrs)
    )
  }
  return decos
}