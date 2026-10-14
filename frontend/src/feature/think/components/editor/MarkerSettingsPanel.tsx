import { useState } from 'react'
import {
  MARKER_IDS, MARKER_LABELS, ICON_REGISTRY, DEFAULT_SETTINGS,
  type MarkerId, type MarkerSetting, type MarkerSettings,
} from '@/src/shared/utils/markerCatalog'
import { findProblems } from './markerSettings'

interface Props {
  settings: MarkerSettings
  onSave: (settings: MarkerSettings) => void
}

export default function MarkerSettingsPanel({ settings, onSave }: Props) {
  const [draft, setDraft] = useState<MarkerSettings>(settings)
  const problems = findProblems(draft)
  const valid = Object.keys(problems).length === 0

  const update = (id: MarkerId, patch: Partial<MarkerSetting>) =>
    setDraft((d) => ({ ...d, [id]: { ...d[id], ...patch } }))

  return (
    <section className="mb-6 rounded border border-gray-200 p-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-700">マーカー設定</h2>

      <ul className="space-y-2">
        {MARKER_IDS.map((id) => {
          const Icon = ICON_REGISTRY[draft[id].icon]
          return (
            <li key={id} className="flex flex-wrap items-center gap-2 text-sm">
              <span className="w-24 text-gray-600">{MARKER_LABELS[id]}</span>
              <span className="flex h-6 w-6 items-center justify-center">
                {Icon && <Icon size={18} />}
              </span>
              <select
                value={draft[id].icon}
                onChange={(e) => update(id, { icon: e.target.value })}
                className="rounded border border-gray-300 px-1 py-0.5"
              >
                {Object.keys(ICON_REGISTRY).map((name) => (
                  <option key={name} value={name}>
                    {name.replace(/^Icon/, '')}
                  </option>
                ))}
              </select>
              <input
                value={draft[id].prefix}
                onChange={(e) => update(id, { prefix: e.target.value })}
                aria-label={`${MARKER_LABELS[id]}の行頭文字`}
                className="w-16 rounded border border-gray-300 px-1 py-0.5 font-mono"
              />
              {problems[id] && <span className="text-xs text-red-600">{problems[id]}</span>}
            </li>
          )
        })}
      </ul>

      <div className="mt-4 flex gap-2 text-sm">
        <button
          type="button"
          disabled={!valid}
          onClick={() => onSave(draft)}
          className="rounded bg-gray-900 px-3 py-1 text-white disabled:opacity-40"
        >
          保存
        </button>
        <button
          type="button"
          onClick={() => setDraft(DEFAULT_SETTINGS)}
          className="rounded border border-gray-300 px-3 py-1"
        >
          初期値に戻す
        </button>
      </div>
    </section>
  )
}