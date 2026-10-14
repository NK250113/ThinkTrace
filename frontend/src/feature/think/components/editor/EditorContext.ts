import { createContext, useContext } from 'react'
import type { Editor } from '@tiptap/react'
import type { MarkerSettings } from '@/src/shared/utils/markerCatalog'

export interface OutlineContextValue {
  editor: Editor | null // 作成前は null になりうる
  settings: MarkerSettings // この人のマーカー設定
  setSettings: (settings: MarkerSettings) => void
}

export const OutlineContext = createContext<OutlineContextValue | null>(null)

// <EditorProvider> の内側で使う
export function useOutline(): OutlineContextValue {
  const value = useContext(OutlineContext)
  if (!value) throw new Error('useOutline は <EditorProvider> の内側で使ってください')
  return value
}