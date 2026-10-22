import { Extension } from '@tiptap/core'
import { DOMSerializer, type Fragment, type Node as PMNode, type Slice } from '@tiptap/pm/model'
import { Plugin, PluginKey, type Selection } from '@tiptap/pm/state'
import { toCells } from './inlineFormat'
import { FORMAT_TYPES, FORMATS, parseInline, type FormatType } from './inlineMarkdown'
import { DEFAULT_SETTINGS, type MarkerId, type MarkerSettings } from '@/src/shared/utils/markerCatalog'

// ---- コピー(プレーンテキスト) -----------------------------------------
// 階層は、タブ1個で1段。マーカーは、この人の行頭文字。書式は、記号のまま。

function sliceToPlainText(slice: Slice, settings: MarkerSettings, selection: Selection): string {
  const content = slice.content
  // 行の中の一部だけを選んだ場合は、その文字をそのまま返す
  if (content.firstChild?.isInline) return content.textBetween(0, content.size)

  const entries: { level: number; text: string }[] = []
  let first = true
  // 選択が、行の先頭から始まっているか(途中から選んでいる行には、行頭文字を付けない)
  const startsAtRowHead = selection.$from.parentOffset === 0

  const addItem = (item: PMNode, level: number) => {
    const head = item.firstChild
    if (head?.type.name === 'paragraph') {
      const markerId = item.attrs.marker as MarkerId | null
      const setting = markerId ? settings[markerId] : undefined
      const prefix = setting && (!first || startsAtRowHead) ? `${setting.prefix} ` : ''
      entries.push({ level, text: prefix + head.textContent })
      first = false
    }
    // 子の行(1つ下の階層)
    item.forEach((child) => {
      if (child.type.name === 'bulletList') addList(child, level + 1)
    })
  }
  const addList = (list: PMNode, level: number) => list.forEach((item) => addItem(item, level))

  content.forEach((node) => {
    if (node.type.name === 'bulletList') addList(node, 0)
    else if (node.type.name === 'listItem') addItem(node, 0)
    else if (node.isTextblock) {
      entries.push({ level: 0, text: node.textContent })
      first = false
    }
  })
  if (entries.length === 0) return ''

  // 選んだ範囲で、いちばん浅い行が、タブ0個になるようにそろえる
  const base = Math.min(...entries.map((e) => e.level))
  return entries.map((e) => '\t'.repeat(e.level - base) + e.text).join('\n')
}

// ---- コピー(HTML) --------------------------------------------------
// 構造(ul > li)は標準のまま。本文の中の **foo** を、本物の太字などの要素に変換する。

const TAGS: Record<FormatType, string> = { bold: 'strong', italic: 'em', strike: 's' }

// 記号つきの文字列を、書式つきのDOMにする(書式がなければ null)
function textToDom(text: string, doc: Document): DocumentFragment | null {
  if (parseInline(text).length === 0) return null

  const { cells } = toCells(text)
  const frag = doc.createDocumentFragment()
  let buffer = ''
  let current: FormatType[] = []

  const flush = () => {
    if (!buffer) return
    let node: Node = doc.createTextNode(buffer)
    // 内側から順に包む(外側から、太字 → 斜体 → 打ち消し線)
    for (const type of [...current].reverse()) {
      const el = doc.createElement(TAGS[type])
      if (type === 'strike') el.style.textDecoration = 'line-through' // Wordなどが確実に読めるように
      el.appendChild(node)
      node = el
    }
    frag.appendChild(node)
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
  return frag
}

// DOMの中の全てのテキストを、書式つきの要素に置き換える
function convertText(root: Node, doc: Document): void {
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const targets: Text[] = []
  for (let n = walker.nextNode(); n; n = walker.nextNode()) targets.push(n as Text)

  for (const t of targets) {
    const frag = textToDom(t.data, doc)
    if (frag) t.replaceWith(frag)
  }
}

// 標準の書き出しに、「記号 → 書式つきの要素」の変換を足したもの
class OutlineSerializer extends DOMSerializer {
  override serializeFragment(
    fragment: Fragment,
    options: { document?: Document } = {},
    target?: HTMLElement | DocumentFragment
  ): HTMLElement | DocumentFragment {
    const dom = super.serializeFragment(fragment, options, target)
    convertText(dom, options.document ?? document)
    return dom
  }
}

// ---- ペースト(HTML) --------------------------------------------------
// 太字・斜体・打ち消し線の要素を、記号の文字に戻す。
// エディタ内のコピー&ペーストが、書式を保つために必要。WordやWebからの貼り付けにも効く。

const BLOCK = 'p, ul, ol, li, div, br, table, h1, h2, h3, h4, h5, h6'

function formatsOf(el: HTMLElement): FormatType[] {
  const tag = el.tagName.toLowerCase()
  const { fontWeight, fontStyle } = el.style
  const decoration = el.style.textDecorationLine || el.style.textDecoration || ''

  // スタイルがあれば、それを優先する(Googleドキュメントは、全体を <b style="font-weight:normal"> で包む)
  const bold = fontWeight
    ? fontWeight === 'bold' || fontWeight === 'bolder' || Number(fontWeight) >= 600
    : tag === 'strong' || tag === 'b'
  const italic = fontStyle ? fontStyle === 'italic' || fontStyle === 'oblique' : tag === 'em' || tag === 'i'
  const strike = decoration.includes('line-through') || tag === 's' || tag === 'del' || tag === 'strike'

  const result: FormatType[] = []
  if (bold) result.push('bold')
  if (italic) result.push('italic')
  if (strike) result.push('strike')
  return result
}

function htmlFormatsToMarkdown(html: string): string {
  const doc = new window.DOMParser().parseFromString(html, 'text/html')

  // 内側の要素から先に処理するため、文書の順の逆から処理する
  for (const el of Array.from(doc.body.querySelectorAll<HTMLElement>('*')).reverse()) {
    const formats = formatsOf(el)
    if (formats.length === 0 || el.querySelector(BLOCK)) continue // 行や改行を含む要素は、そのままにする

    const inner = el.textContent ?? ''
    const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(inner)!
    const body = m[2] ?? ''
    const open = formats.map((t) => FORMATS[t].delimiter).join('')
    const close = [...formats].reverse().map((t) => FORMATS[t].delimiter).join('')

    // 前後の空白は、記号の外に出す(記号の内側が空白だと、書式として読み取れないため)
    el.replaceWith(doc.createTextNode(body ? `${m[1]}${open}${body}${close}${m[3]}` : inner))
  }
  return doc.body.innerHTML
}

// ---- 拡張本体 -------------------------------------------------------------

export const OutlineClipboard = Extension.create<{ getSettings: () => MarkerSettings }>({
  name: 'outlineClipboard',
  priority: 1000, // Tiptap標準の clipboardTextSerializer より先に使われるようにする

  addOptions() {
    return { getSettings: () => DEFAULT_SETTINGS }
  },

  addProseMirrorPlugins() {
    const { editor, options } = this
    const base = DOMSerializer.fromSchema(editor.schema)
    const serializer = new OutlineSerializer(base.nodes, base.marks)

    return [
      new Plugin({
        key: new PluginKey('outlineClipboard'),
        props: {
          clipboardSerializer: serializer,
          clipboardTextSerializer: (slice, view) =>
            sliceToPlainText(slice, options.getSettings(), view.state.selection),
          transformPastedHTML: (html) => htmlFormatsToMarkdown(html),
        },
      }),
    ]
  },
})