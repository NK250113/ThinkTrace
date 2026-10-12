import { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import { OutlineDocument, OutlineItem } from './extensions'
import { OutlineDecorations, REFRESH_META } from './outlineDecorations'
import { UniqueRowId } from './uniqueRowId'
import { useMarkerSettings } from './useMarkerSettings'
import MarkerSettingsPanel from './MarkerSettingsPanel'
import { ydoc, DOC_ID } from './collab'
import { OutlineInline, OutlineBold, OutlineItalic, OutlineStrike } from './inlineSync'

// デモ用の初期データ(Y.Docが空のときだけ入れる)。サーバーにつなぐときは不要
const DEMO_CONTENT = `
  <ul>
    <li><p>親項目</p>
      <ul>
        <li data-marker="check"><p>子項目A</p></li>
        <li><p>子項目B</p></li>
      </ul>
    </li>
    <li data-marker="idea"><p>もう一つの親項目</p></li>
  </ul>`

export default function App() {
  const [settings, setSettings] = useMarkerSettings()
  const [showSettings, setShowSettings] = useState(false)

  // エディタは1回だけ作るので、最新の設定は ref 経由で読ませる
  const settingsRef = useRef(settings)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        document: false,
        listItem: false,
        undoRedo: false,
        hardBreak: false,
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        orderedList: false,
        bold: false, // 自前の OutlineBold に差し替え
        italic: false,
        strike: false,
        code: false, // コード書式は使わない
        underline: false,
        link: false,
      }),
      OutlineDocument,
      OutlineItem.configure({ getSettings: () => settingsRef.current }),
      OutlineDecorations.configure({ getSettings: () => settingsRef.current, docId: DOC_ID }),
      UniqueRowId,
      Collaboration.configure({ document: ydoc }),
    ],
  })

  // 初期データの投入(デモ用)
  useEffect(() => {
    if (editor && ydoc.getXmlFragment('default').length === 0) {
      editor.commands.setContent(DEMO_CONTENT)
    }
  }, [editor])

  // 設定が変わったら、表示を作り直す
  useEffect(() => {
    settingsRef.current = settings
    editor?.view.dispatch(editor.state.tr.setMeta(REFRESH_META, true))
  }, [settings, editor])

  return (
    <main className="mx-auto max-w-2xl">
      <button
        type="button"
        onClick={() => setShowSettings((v) => !v)}
        className="mb-4 rounded border border-gray-300 px-3 py-1 text-sm"
      >
        マーカー設定
      </button>
      {showSettings && (
        <MarkerSettingsPanel
          settings={settings}
          onSave={(s) => {
            setSettings(s)
            setShowSettings(false)
          }}
        />
      )}

      <EditorContent
        editor={editor}
        className={[
          // --row: 行の高さ = トグルの大きさ = インデント幅(この1か所だけ変えればよい)
          '[--row:1.5rem]',
          '[&_.ProseMirror]:outline-none',
          '[&_ul]:m-0 [&_ul]:p-0 [&_li]:m-0',
          '[&_li]:relative [&_li]:pl-(--row) [&_li]:leading-(--row)',
          '[&_li[data-collapsed=true]>ul]:hidden', // 折りたたみ(この人の画面だけ)
          '[&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.9em]',
        ].join(' ')}
      />
    </main>
  )
}