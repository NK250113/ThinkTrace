import {
  IconPoint,
  IconBulb, IconHelpSquareRounded, IconFlag, IconTarget, IconTool, IconSparkle2,
  IconPointFilled, IconCloud, IconSettings, IconAnchor, IconClock, IconFilter,
  IconCirclesRelation, IconScale, IconSword, IconBook, IconQuote,
  type Icon,
} from '@tabler/icons-react'

// ① マーカーの種類(IDは固定。ユーザーは追加できない)。種類を増やすときはここに足す
export const MARKER_DEFS = [
  { id: 'Hypothesis', label: '仮説', prefix: 'h', icon: 'IconBulb', explain: '' },
  { id: 'question', label: '疑問', prefix: '?', icon: 'IconHelpSquareRounded', explain: '' },
  { id: 'Summary', label: 'まとめ', prefix: 's', icon: 'IconFlag', explain: '' },
  { id: 'Goal', label: '目的', prefix: 'g', icon: 'IconTarget', explain: '' },
  { id: 'Method', label: '手法', prefix: 'm', icon: 'IconTool', explain: '' },
  { id: 'important', label: '重要', prefix: '!', icon: 'IconSparkle2', explain: '' },
  { id: 'list', label: '列挙', prefix: '-', icon: 'IconPointFilled', explain: '' },
  { id: 'Abstract', label: '抽象化', prefix: 'a', icon: 'IconCloud', explain: '' },
  { id: 'Cause', label: '因果', prefix: 'c', icon: 'IconSettings', explain: '' },
  { id: 'Evidence', label: '根拠', prefix: 'e', icon: 'IconAnchor', explain: '' },
  { id: 'Time', label: '時系列', prefix: 't', icon: 'IconClock', explain: '' },
  { id: 'If', label: '条件', prefix: 'i', icon: 'IconFilter', explain: '' },
  { id: 'Dependency', label: '依存', prefix: 'd', icon: 'IconCirclesRelation', explain: '' },
  { id: 'comPare', label: '比較', prefix: 'p', icon: 'IconScale', explain: '' },
  { id: 'But', label: '反論', prefix: 'b', icon: 'IconSword', explain: '' },
  { id: 'Reference', label: '参照', prefix: 'r', icon: 'IconBook', explain: '' },
  { id: 'quote', label: '引用', prefix: '>', icon: 'IconQuote', explain: '' },
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