import { useCallback, useState } from 'react'
import type { MarkerSettings } from '@/src/shared/utils/markerCatalog'
import { parseSettings } from './markerSettings'

// 今はlocalStorageに保存している。サーバーに保存するなら、load/saveをAPI呼び出しに置き換える
const KEY = 'outline:marker-settings'

function load(): MarkerSettings {
  try {
    return parseSettings(JSON.parse(localStorage.getItem(KEY) ?? 'null'))
  } catch {
    return parseSettings(null)
  }
}

export function useMarkerSettings(): [MarkerSettings, (s: MarkerSettings) => void] {
  const [settings, setState] = useState<MarkerSettings>(load)

  const setSettings = useCallback((s: MarkerSettings) => {
    setState(s)
    try {
      localStorage.setItem(KEY, JSON.stringify(s))
    } catch {
      /* 保存できなくても、動作は続ける */
    }
  }, [])

  return [settings, setSettings]
}