import { EditorContent } from '@tiptap/react'
import { useOutline } from './EditorContext'

export default function OutlineEditor() {
  const { editor } = useOutline()

  return (
    <EditorContent
      editor={editor}
      className={[
        // --row: 行の高さ = トグルの大きさ = インデント幅(この1か所だけ変えればよい)
        '[--row:1.5rem]',
        '[&_.ProseMirror]:outline-none',
        '[&_ul]:m-0 [&_ul]:p-0 [&_li]:m-0',
        '[&_li]:relative [&_li]:pl-(--row) [&_li]:leading-(--row)',
        '[&_li[data-collapsed=true]>ul]:hidden', // 折りたたみ(この人の画面だけ)
      ].join(' ')}
    />
  )
}