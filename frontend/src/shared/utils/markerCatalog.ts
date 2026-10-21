import {
  IconPoint,
  IconBulb, IconHelpSquareRounded, IconFlag, IconTargetArrow, IconTool, IconSparkle2,
  IconPointFilled, IconCloud, IconSettings, IconAnchor, IconClock, IconFilter,
  IconCirclesRelation, IconScale, IconSword, IconBook, IconQuote,
  type Icon,
} from '@tabler/icons-react'

// ① マーカーの種類(IDは固定。ユーザーは追加できない)。種類を増やすときはここに足す
export const MARKER_DEFS = [
  { id: 'Hypothesis', label: '仮説', prefix: 'h', icon: 'IconBulb', explain: '提唱する仮説、議題' },
  { id: 'question', label: '疑問', prefix: '?', icon: 'IconHelpSquareRounded', explain: '検証していく疑問' },
  { id: 'Summary', label: 'まとめ', prefix: 's', icon: 'IconFlag', explain: '仮説や疑問の結論' },
  { id: 'Goal', label: '目的', prefix: 'g', icon: 'IconTargetArrow', explain: '達成したい目標' },
  { id: 'Method', label: '手法', prefix: 'm', icon: 'IconTool', explain: '目標達成の方法' },
  { id: 'important', label: '重要', prefix: '!', icon: 'IconSparkle2', explain: '重要な情報' },
  { id: 'list', label: '列挙', prefix: '-', icon: 'IconPointFilled', explain: '自由に使える項目の列挙' },
  { id: 'Abstract', label: '抽象化', prefix: 'a', icon: 'IconCloud', explain: '一連の話の抽象化・一般化' },
  { id: 'Cause', label: '因果', prefix: 'c', icon: 'IconSettings', explain: '一連の流れ・因果関係' },
  { id: 'Evidence', label: '根拠', prefix: 'e', icon: 'IconAnchor', explain: '理論を支持する情報や証拠' },
  { id: 'Time', label: '時系列', prefix: 't', icon: 'IconClock', explain: '時間の経過や順序' },
  { id: 'If', label: '条件', prefix: 'i', icon: 'IconFilter', explain: '前提条件や状況' },
  { id: 'Dependency', label: '依存', prefix: 'd', icon: 'IconCirclesRelation', explain: '上の要素の前提条件' },
  { id: 'comPare', label: '比較', prefix: 'p', icon: 'IconScale', explain: '比較の対象物' },
  { id: 'But', label: '反論', prefix: 'b', icon: 'IconSword', explain: '理論を否定する要素' },
  { id: 'Reference', label: '参照', prefix: 'r', icon: 'IconBook', explain: '上の要素の出典' },
  { id: 'quote', label: '引用', prefix: '>', icon: 'IconQuote', explain: '引用する内容' },
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
  IconBulb, IconHelpSquareRounded, IconFlag, IconTargetArrow, IconTool, IconSparkle2,
  IconPointFilled, IconCloud, IconSettings, IconAnchor, IconClock, IconFilter,
  IconCirclesRelation, IconScale, IconSword, IconBook, IconQuote,
}

export const DEFAULT_ICON_NAME = 'IconPoint'