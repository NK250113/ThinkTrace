import { useState } from 'react'
import EditorProvider from './EditorProvider'
import { useOutline } from './EditorContext'
import OutlineEditor from './OutlineEditor'
import Toolbar from './Toolbar'
import MarkerSettingsPanel from './MarkerSettingsPanel'

// 設定画面。これもContextから設定を受け取るので、どこに置いてもよい
function SettingsArea() {
  const { settings, setSettings } = useOutline()
  const [open, setOpen] = useState(false)

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded border border-gray-300 px-3 py-1 text-sm"
      >
        マーカー設定
      </button>
      {open && (
        <div className="mt-2">
          <MarkerSettingsPanel
            settings={settings}
            onSave={(s) => {
              setSettings(s)
              setOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <SettingsArea />
      <div className="mb-4">
        <Toolbar />
      </div>
      <OutlineEditor />
    </main>
  )
}