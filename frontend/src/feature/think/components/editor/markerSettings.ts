import {
  ICON_REGISTRY, DEFAULT_SETTINGS, MARKER_IDS, MARKER_LABELS,
  type MarkerId, type MarkerSetting, type MarkerSettings,
} from './markerCatalog'

export const hasIcon = (name: string): boolean =>
  Object.prototype.hasOwnProperty.call(ICON_REGISTRY, name)

export type Problems = Partial<Record<MarkerId, string>>

// 設定の問題点を返す(空なら保存してよい)
export function findProblems(settings: MarkerSettings): Problems {
  const problems: Problems = {}
  const owner = new Map<string, MarkerId>()
  for (const id of MARKER_IDS) {
    const { prefix, icon } = settings[id]
    if (!/^\S+$/.test(prefix)) {
      problems[id] = '行頭文字は、空白を含まない1文字以上にしてください'
    } else if (owner.has(prefix)) {
      problems[id] = `「${prefix}」は「${MARKER_LABELS[owner.get(prefix)!]}」と重複しています`
    } else if (!hasIcon(icon)) {
      problems[id] = 'アイコンを選んでください'
    } else {
      owner.set(prefix, id)
    }
  }
  return problems
}

// 行頭文字 → マーカーID(登録されていなければ null)
export function findMarkerIdByPrefix(settings: MarkerSettings, prefix: string): MarkerId | null {
  for (const id of MARKER_IDS) {
    if (settings[id].prefix === prefix) return id
  }
  return null
}

// 保存されていた値を設定として読む。足りない所は初期値で埋め、不正なら全体を初期値に戻す
export function parseSettings(raw: unknown): MarkerSettings {
  const src = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<
    string,
    Partial<MarkerSetting> | undefined
  >
  const merged = {} as MarkerSettings
  for (const id of MARKER_IDS) {
    const s = src[id]
    merged[id] = {
      prefix: typeof s?.prefix === 'string' ? s.prefix : DEFAULT_SETTINGS[id].prefix,
      icon: typeof s?.icon === 'string' ? s.icon : DEFAULT_SETTINGS[id].icon,
    }
  }
  return Object.keys(findProblems(merged)).length === 0 ? merged : DEFAULT_SETTINGS
}