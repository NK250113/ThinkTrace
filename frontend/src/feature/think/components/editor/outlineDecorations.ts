import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet, type EditorView } from '@tiptap/pm/view'
import { DEFAULT_ICON_NAME, DEFAULT_SETTINGS, type MarkerId, type MarkerSettings } from '@/src/shared/utils/markerCatalog'
import { markerSvg, chevronSvg } from './icons'
import { forEachItem } from './outlineUtils'
import { inlineDecorations } from './inlineDecorations'

// このメタ情報付きのトランザクションを送ると、表示が作り直される(設定変更時に使う)
export const REFRESH_META = 'outline:refresh'

interface Options {
  getSettings: () => MarkerSettings // この人の設定
  docId: string // 折りたたみ状態の保存キーに使う
}
interface Storage {
  collapsed: Set<string> // 折りたたんでいる行のID(この人の画面だけ。共有されない)
}

const storageKey = (docId: string) => `outline:collapsed:${docId}`

function loadCollapsed(docId: string): Set<string> {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(storageKey(docId)) ?? '[]')
    return new Set(Array.isArray(raw) ? raw.filter((v): v is string => typeof v === 'string') : [])
  } catch {
    return new Set()
  }
}

function saveCollapsed(docId: string, set: Set<string>): void {
  try {
    localStorage.setItem(storageKey(docId), JSON.stringify([...set]))
  } catch {
    /* 保存できなくても、動作は続ける */
  }
}

const SPAN_BASE = 'mr-1 inline-flex h-[18px] min-w-[18px] select-none items-center justify-center align-middle'

function makeIcon(iconName: string): HTMLElement {
  const el = document.createElement('span')
  el.className = `${SPAN_BASE} text-gray-700`
  el.contentEditable = 'false'
  try {
    el.innerHTML = markerSvg(iconName)
  } catch (e) {
    console.error('[outline] icon render failed', e)
    el.textContent = '•' // 失敗しても行が消えないように
  }
  return el
}

// カーソルのある行で、アイコンの代わりに出す行頭文字(表示だけ。本文ではない)
function makePrefix(prefix: string): HTMLElement {
  const el = document.createElement('span')
  el.className = `${SPAN_BASE} font-mono text-sm text-gray-400`
  el.contentEditable = 'false'
  el.textContent = prefix
  return el
}

// 開閉トグル。<li>の左端に絶対配置する(大きさとインデントは --row で決まる)
function makeToggle(collapsed: boolean, onClick: () => void): HTMLElement {
  const el = document.createElement('button')
  el.type = 'button'
  el.contentEditable = 'false'
  el.className =
    'absolute left-0 top-0 flex h-[var(--row)] w-[var(--row)] select-none items-center justify-center text-gray-500 hover:text-gray-900'
  try {
    el.innerHTML = chevronSvg(collapsed)
  } catch (e) {
    console.error('[outline] chevron render failed', e)
    el.textContent = collapsed ? '>' : 'v'
  }
  el.addEventListener('mousedown', (e) => e.preventDefault()) // カーソルを動かさない
  el.addEventListener('click', onClick)
  return el
}

export const OutlineDecorations = Extension.create<Options, Storage>({
  name: 'outlineDecorations',

  addOptions() {
    return { getSettings: () => DEFAULT_SETTINGS, docId: 'default' }
  },

  addStorage() {
    return { collapsed: new Set<string>() }
  },

  onCreate() {
    this.storage.collapsed = loadCollapsed(this.options.docId)
    this.editor.view.dispatch(this.editor.state.tr.setMeta(REFRESH_META, true))
  },

  addProseMirrorPlugins() {
    const { options, storage } = this

    const toggle = (view: EditorView, id: string) => {
      const set = storage.collapsed
      if (!set.delete(id)) set.add(id)
      saveCollapsed(options.docId, set)
      view.dispatch(view.state.tr.setMeta(REFRESH_META, true))
    }

    return [
      new Plugin({
        key: new PluginKey('outlineDecorations'),
        props: {
          decorations: (state) => {
            const settings = options.getSettings()
            const decos: Decoration[] = []

            forEachItem(state.doc, state.selection, ({ node, pos, start, active }) => {
              const id = (node.attrs.id as string | null) ?? null
              const markerId = (node.attrs.marker as MarkerId | null) ?? null
              const setting = markerId ? settings[markerId] : undefined
              const collapsed = id !== null && storage.collapsed.has(id)

              // 折りたたみ: <li>に印を付ける。CSSが、子の<ul>を隠す
              if (collapsed) {
                decos.push(Decoration.node(pos, pos + node.nodeSize, { 'data-collapsed': 'true' }))
              }
              // 開閉トグル(子がある行だけ)。keyに行IDを含めるのは、DOMの使い回しで別の行のIDが残らないようにするため
              if (id !== null && node.childCount > 1) {
                decos.push(
                  Decoration.widget(start, (view) => makeToggle(collapsed, () => toggle(view, id)), {
                    side: -2,
                    key: `toggle-${id}-${collapsed}`,
                    stopEvent: () => true, // トグル上のイベントはProseMirrorに渡さない
                  })
                )
              }
              // マーカー: カーソルがなければアイコン、あれば行頭文字。マーカーなしなら既定のアイコン
              if (setting) {
                decos.push(
                  Decoration.widget(
                    start,
                    () => (active ? makePrefix(setting.prefix) : makeIcon(setting.icon)),
                    { side: -1, key: active ? `prefix-${setting.prefix}` : `icon-${setting.icon}` }
                  )
                )
              } else if (!active) {
                decos.push(
                  Decoration.widget(start, () => makeIcon(DEFAULT_ICON_NAME), {
                    side: -1,
                    key: `icon-${DEFAULT_ICON_NAME}`,
                  })
                )
              }
              // 太字・斜体などの記号(**、*、~~、`): カーソルがある行に表示する
              // 書式: 本文中の ** * ~~ を解釈して表示する(カーソルがある行は記号も表示)
              decos.push(...inlineDecorations(node.firstChild!, start, active))
            })

            return DecorationSet.create(state.doc, decos)
          },
        },
      }),
    ]
  },
})