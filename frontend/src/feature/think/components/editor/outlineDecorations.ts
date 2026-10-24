import { Extension } from '@tiptap/core'
import type { Node as PMNode } from '@tiptap/pm/model'
import { Plugin, PluginKey, type Selection, type Transaction } from '@tiptap/pm/state'
import { Decoration, DecorationSet, type EditorView } from '@tiptap/pm/view'
import { chevronSvg, markerSvg } from './icons'
import { inlineDecorations } from './inlineDecorations'
import { DEFAULT_ICON_NAME, DEFAULT_SETTINGS, type MarkerId, type MarkerSettings } from '@/src/shared/utils/markerCatalog'
import { forEachItem, toItemInfo, type ItemInfo } from './outlineUtils'

// このメタ情報付きのトランザクションを送ると、Decorationが作り直される
//   true / { full: true } … 全行を作り直す(設定が変わったときなど)
//   { rows: [liの位置, ...] } … その行だけ作り直す(折りたたみの切り替えなど)
export const REFRESH_META = 'outline:refresh'
type RefreshMeta = true | { full?: boolean; rows?: number[] }

// 開発中に true にすると、差分更新の結果が、全行を作り直した結果と一致するか、毎回確かめる(遅くなる)
const DEBUG_VERIFY = false

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

// ---- DOMを作る関数(変更なし) ------------------------------------------

const SPAN_BASE = 'mr-1 inline-flex h-[18px] min-w-[18px] select-none items-center justify-center align-middle'

function makeIcon(iconName: string): HTMLElement {
  const el = document.createElement('span')
  el.className = `${SPAN_BASE} text-gray-700`
  el.contentEditable = 'false'
  try {
    el.innerHTML = markerSvg(iconName)
  } catch (e) {
    console.error('[outline] icon render failed', e)
    el.textContent = '•'
  }
  return el
}

function makePrefix(prefix: string): HTMLElement {
  const el = document.createElement('span')
  el.className = `${SPAN_BASE} font-mono text-sm text-gray-400`
  el.contentEditable = 'false'
  el.textContent = prefix
  return el
}

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
  el.addEventListener('mousedown', (e) => e.preventDefault())
  el.addEventListener('click', onClick)
  return el
}

// ---- 差分更新のための補助関数 -------------------------------------------

// 文書が変わった範囲(変更後の文書での位置)
function changedRanges(tr: Transaction): [number, number][] {
  const ranges: [number, number][] = []
  tr.mapping.maps.forEach((map, i) => {
    map.forEach((_oldStart, _oldEnd, newStart, newEnd) => {
      const rest = tr.mapping.slice(i + 1) // これ以降のステップによる、位置のずれを反映する
      ranges.push([rest.map(newStart, -1), rest.map(newEnd, 1)])
    })
  })
  return ranges
}

// 選択範囲の中で、カーソルがかかっている行を集める(li の位置 → li)
function collectActiveRows(doc: PMNode, selection: Selection, out: Map<number, PMNode>): void {
  doc.nodesBetween(selection.from, selection.to, (node, pos) => {
    if (node.type.name === 'listItem' && toItemInfo(node, pos, selection).active) out.set(pos, node)
  })
}

// この行だけの Decoration か(子の行のものは含めない)
function isOwn(d: Decoration, item: ItemInfo): boolean {
  const end = item.pos + item.node.nodeSize
  return (d.from === item.pos && d.to === end) || (d.from >= item.start && d.to <= item.end)
}

// 検証用: Decoration の一覧を、比較できる文字列にする
function signature(set: DecorationSet): string {
  return set
    .find()
    .map((d) => `${d.from}:${d.to}:${JSON.stringify(d.spec)}`)
    .sort()
    .join('\n')
}

// ---- 拡張本体 -------------------------------------------------------------

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
    const key = new PluginKey<DecorationSet>('outlineDecorations')

    // 折りたたみの切り替え。作り直すのは、その行だけ
    const toggle = (view: EditorView, id: string, liPos: number) => {
      const set = storage.collapsed
      if (!set.delete(id)) set.add(id)
      saveCollapsed(options.docId, set)
      view.dispatch(view.state.tr.setMeta(REFRESH_META, { rows: [liPos] }))
    }

    // 1行分の Decoration を作る
    const buildRow = (item: ItemInfo): Decoration[] => {
      const { node, pos, start, active } = item
      const settings = options.getSettings()
      const id = (node.attrs.id as string | null) ?? null
      const markerId = (node.attrs.marker as MarkerId | null) ?? null
      const setting = markerId ? settings[markerId] : undefined
      const collapsed = id !== null && storage.collapsed.has(id)
      const decos: Decoration[] = []

      // 折りたたみ: <li>に印を付ける。CSSが、子の<ul>を隠す
      if (collapsed) {
        decos.push(
          Decoration.node(pos, pos + node.nodeSize, { 'data-collapsed': 'true' }, { tag: 'collapsed' })
        )
      }
      // 開閉トグル(子がある行だけ)。keyに行IDを含めるのは、DOMの使い回しで、別の行のIDが残らないようにするため
      if (id !== null && node.childCount > 1) {
        decos.push(
          Decoration.widget(
            start,
            (view, getPos) =>
              makeToggle(collapsed, () => {
                const p = getPos()
                if (p != null) toggle(view, id, p - 2) // ウィジェットは段落の先頭にあるので、liはその2つ手前
              }),
            { side: -2, key: `toggle-${id}-${collapsed}`, stopEvent: () => true, tag: 'toggle' }
          )
        )
      }
      // マーカー: カーソルがなければアイコン、あれば行頭文字。マーカーなしの行は、カーソルがないときだけ既定のアイコン
      if (setting) {
        decos.push(
          Decoration.widget(
            start,
            () => (active ? makePrefix(setting.prefix) : makeIcon(setting.icon)),
            { side: -1, key: active ? `prefix-${setting.prefix}` : `icon-${setting.icon}`, tag: 'marker' }
          )
        )
      } else if (!active) {
        decos.push(
          Decoration.widget(start, () => makeIcon(DEFAULT_ICON_NAME), {
            side: -1,
            key: `icon-${DEFAULT_ICON_NAME}`,
            tag: 'marker',
          })
        )
      }
      // 書式: 本文中の ** * ~~ を解釈して表示する
      decos.push(...inlineDecorations(node.firstChild!, start, active))
      return decos
    }

    // 全行の Decoration を作る(最初と、設定が変わったときだけ)
    const buildAll = (doc: PMNode, selection: Selection): DecorationSet => {
      const decos: Decoration[] = []
      forEachItem(doc, selection, (item) => decos.push(...buildRow(item)))
      return DecorationSet.create(doc, decos)
    }

    return [
      new Plugin<DecorationSet>({
        key,

        state: {
          init: (_config, state) => buildAll(state.doc, state.selection),

          apply: (tr, prev, oldState, newState) => {
            const meta = tr.getMeta(REFRESH_META) as RefreshMeta | undefined
            if (meta === true || (meta && meta.full)) return buildAll(newState.doc, newState.selection)
            // 文書も選択も変わっていなければ、そのまま
            if (!meta && !tr.docChanged && !tr.selectionSet) return prev

            const doc = newState.doc
            // 今までの Decoration を、位置のずれだけ反映して引き継ぐ
            let set = prev.map(tr.mapping, doc)

            // 作り直す行を集める(li の位置 → li)
            const dirty = new Map<number, PMNode>()

            // ① 文書が変わった範囲の行と、その祖先の行(子の有無で、トグルが変わるため)
            for (const [from, to] of changedRanges(tr)) {
              doc.nodesBetween(
                Math.max(0, from - 1),
                Math.min(doc.content.size, to + 1),
                (node, pos) => {
                  if (node.type.name === 'listItem') dirty.set(pos, node)
                }
              )
            }
            // ② カーソルがある行が変わった(前の選択がかかっていた行と、今の選択がかかる行)
            collectActiveRows(doc, oldState.selection.map(doc, tr.mapping), dirty)
            collectActiveRows(doc, newState.selection, dirty)
            // ③ 指定された行(折りたたみの切り替え)
            for (const pos of meta && meta !== true ? (meta.rows ?? []) : []) {
              const node = doc.nodeAt(pos)
              if (node?.type.name === 'listItem') dirty.set(pos, node)
            }

            if (dirty.size > 0) {
              const items = [...dirty].map(([pos, node]) =>
                toItemInfo(node, pos, newState.selection)
              )
              // その行だけの古い Decoration を消して、作り直す
              const stale = items.flatMap((item) =>
                set.find(item.pos, item.pos + item.node.nodeSize).filter((d) => isOwn(d, item))
              )
              set = set.remove(stale).add(doc, items.flatMap((item) => buildRow(item)))
            }

            if (DEBUG_VERIFY && signature(set) !== signature(buildAll(doc, newState.selection))) {
              console.error('[outline] 差分更新の結果が、全行の作り直しと一致しません')
            }
            return set
          },
        },

        props: { decorations: (state) => key.getState(state) },
      }),
    ]
  },
})