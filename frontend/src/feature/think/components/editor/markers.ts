import {
  IconBulb,
  IconHelpSquareRounded,
  IconFlag,
  IconTarget,
  IconTool,
  IconSparkle2,
  IconPointFilled,
  IconCloud,
  IconSettings,
  IconAnchor,
  IconClock,
  IconFilter,
  IconCirclesRelation,
  IconScale,
  IconSword,
  IconBook,
  IconQuote,
  type Icon,
} from '@tabler/icons-react'

// 「行頭の文字 → アイコン」の対応表。記号を増やすときはここだけ編集する
export const MARKERS: Record<string, Icon> = {
  h: IconBulb,
  '?': IconHelpSquareRounded,
  s: IconFlag,
  g: IconTarget,
  m: IconTool,
  '!': IconSparkle2,
  '-': IconPointFilled,
  a: IconCloud,
  c: IconSettings,
  e: IconAnchor,
  t: IconClock,
  i: IconFilter,
  d: IconCirclesRelation,
  p: IconScale,
  b: IconSword,
  r: IconBook,
  '>': IconQuote,
}

// 記号のない行に自動で付ける文字(MARKERSのキーのどれか)
export const DEFAULT_MARKER = '-'
export const DEFAULT_ICON: Icon = MARKERS[DEFAULT_MARKER] ?? IconPointFilled

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const keys = Object.keys(MARKERS).sort((a, b) => b.length - a.length)
// 「文字 + 空白(半角/全角)」で始まる行を、記号付きの行として扱う
const MARKER_RE = new RegExp(`^(${keys.map(escapeRe).join('|')})[ \\u3000]`)

export interface ParsedMarker {
  key: string // 例: 'i'
  length: number // 記号+空白の長さ(例: 'i ' なら 2)
}

export function parseMarker(text: string): ParsedMarker | null {
  const m = MARKER_RE.exec(text)
  return m ? { key: m[1], length: m[0].length } : null
}