import {
  IconPoint,
  IconBulb, IconHelpSquareRounded, IconFlag, IconTarget, IconTool, IconSparkle2,
  IconPointFilled, IconCloud, IconSettings, IconAnchor, IconClock, IconFilter,
  IconCirclesRelation, IconScale, IconSword, IconBook, IconQuote,
  type Icon,
} from '@tabler/icons-react'

// ① マーカーの種類(IDは固定。ユーザーは追加できない)。種類を増やすときはここに足す
export const MARKER_DEFS = [
    { id: '仮説', label: 'Hypothesis', prefix: 'h', icon: 'IconBulb' },
  { id: '疑問', label: 'question', prefix: '?', icon: 'IconHelpSquareRounded' },
  { id: 'まとめ', label: 'Summary', prefix: 's', icon: 'IconFlag' },
  { id: '目的', label: 'Goal', prefix: 'g', icon: 'IconTarget' },
  { id: '手法', label: 'Method', prefix: 'm', icon: 'IconTool' },
  { id: '重要', label: 'important', prefix: '!', icon: 'IconSparkle2' },
  { id: '列挙', label: 'list', prefix: '-', icon: 'IconPointFilled' },
  { id: '抽象化', label: 'Abstract', prefix: 'a', icon: 'IconCloud' },
  { id: '因果', label: 'Cause', prefix: 'c', icon: 'IconSettings' },
  { id: '根拠', label: 'Evidence', prefix: 'e', icon: 'IconAnchor' },
  { id: '時系列', label: 'Time', prefix: 't', icon: 'IconClock' },
  { id: '条件', label: 'If', prefix: 'i', icon: 'IconFilter' },
  { id: '依存', label: 'Dependency', prefix: 'd', icon: 'IconCirclesRelation' },
  { id: '比較', label: 'comPare', prefix: 'p', icon: 'IconScale' },
  { id: '反論', label: 'But', prefix: 'b', icon: 'IconSword' },
  { id: '参照', label: 'Reference', prefix: 'r', icon: 'IconBook' },
  { id: '引用', label: 'quote', prefix: '>', icon: 'IconQuote' },
] as const

export type MarkerId = (typeof MARKER_DEFS)[number]['id']
export const MARKER_IDS: readonly MarkerId[] = MARKER_DEFS.map((d) => d.id)
export const MARKER_LABELS = Object.fromEntries(
  MARKER_DEFS.map((d) => [d.id, d.label])
) as Record<MarkerId, string>

// ユーザーごとの設定: マーカーID → 行頭文字とアイコン(全マーカーに必ず設定する)
export interface MarkerSetting {
  prefix: string // このユーザーが入力に使う行頭文字
  icon: string // ICON_REGISTRY のキー
}
export type MarkerSettings = Record<MarkerId, MarkerSetting>

export const DEFAULT_SETTINGS = Object.fromEntries(
  MARKER_DEFS.map((d) => [d.id, { prefix: d.prefix, icon: d.icon }])
) as MarkerSettings

// ② 設定画面で選べるアイコン。増やすときはimportして、ここに足す
export const ICON_REGISTRY: Record<string, Icon> = {
  IconPoint,
  IconBulb, IconHelpSquareRounded, IconFlag, IconTarget, IconTool, IconSparkle2,
  IconPointFilled, IconCloud, IconSettings, IconAnchor, IconClock, IconFilter,
  IconCirclesRelation, IconScale, IconSword, IconBook, IconQuote,
}

export const DEFAULT_ICON_NAME = 'IconPoint'