import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import { Placeholder } from '@tiptap/extensions';
import { OutlineContext } from './EditorContext';
import { OutlineDocument, OutlineItem } from './extensions';
import { OutlineDecorations, REFRESH_META } from './outlineDecorations';
import { UniqueRowId } from './uniqueRowId';
import { OutlineShortcuts } from './outlineShortcuts';
import { useMarkerSettings } from './useMarkerSettings';
import { ydoc, DOC_ID } from './collab';
import { formatShortcuts, markerShortcuts } from './keyboardShortcut';

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

export default function EditorProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useMarkerSettings()

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
      OutlineShortcuts,
      formatShortcuts,
      markerShortcuts,
      Placeholder.configure({
        placeholder: 'ここに入力してください',
      }),
    ],
    immediatelyRender: false,
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

  // 値を毎回作り直すと、使う側が無駄に再描画されるので、useMemoで固定する
  const value = useMemo(() => ({ editor, settings, setSettings }), [editor, settings, setSettings])

  return <OutlineContext.Provider value={value}>{children}</OutlineContext.Provider>
}