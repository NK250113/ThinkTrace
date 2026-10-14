"use client";
import { useRef, type ReactNode } from "react";
import { useEditorState } from "@tiptap/react";
import { IconBold, IconItalic, IconStrikethrough, type Icon } from "@tabler/icons-react";
import { MarkerPaneTable } from "@/src/shared/components/layout/HelpBarContent";
import { MARKER_DEFS, ICON_REGISTRY } from "@/src/shared/utils/markerCatalog";
import { ResizerY } from "@/src/shared/components/ui/Resizer";
import { useOutline } from "./editor/EditorContext";
import type { FormatType } from "./editor/inlineMarkdown";
import { canFormatSelection, setMarkerForSelection, toggleFormatForSelection } from "./editor/toolbarActions";

const FORMAT_BUTTONS: { type: FormatType; Label: Icon; className: string }[] = [
  { type: "bold", Label: IconBold, className: "font-bold" },
  { type: "italic", Label: IconItalic, className: "italic" },
  { type: "strike", Label: IconStrikethrough, className: "line-through" },
]

export function MarkerPane() {
  const { editor, settings } = useOutline()

  // フックは、editor が null のときも呼ぶ(条件分岐や早期returnの前に置く)
  // 選択範囲が変わるたびに、書式ボタンの「押せる/押せない」が更新される
  const canFormat = useEditorState({
    editor,
    selector: ({ editor }) => (editor ? canFormatSelection(editor) : false),
  })
  const FORMAT_BUTTONS: { type: FormatType; label: string; className: string }[] = [
    { type: 'bold', label: 'B', className: 'font-bold' },
    { type: 'italic', label: 'I', className: 'italic' },
    { type: 'strike', label: 'S', className: 'line-through' },
  ]

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex gap-2">
        {FORMAT_BUTTONS.map(({ type, label, className }) => (
          <button
            key={type}
            type="button"
            disabled={!canFormat}
            onMouseDown={(e) => e.preventDefault()} // クリックで、エディタの選択が外れないように
            onClick={() => editor && toggleFormatForSelection(editor, type)}
            className={`'flex h-8 w-8 items-center justify-center rounded border border-background px-2 text-sm hover:opacity-80 disabled:opacity-40 disabled:hover:bg-transparent'
  ${className}`}
          >
            {label}
          </button>
        ))}
      </div>
      <MarkerPaneTable contents={
        MARKER_DEFS.map((marker) => {
          const Icon = ICON_REGISTRY[settings[marker.id].icon]
          return {icon: Icon, id: marker.id, onclick: () => editor && setMarkerForSelection(editor, marker.id), prefix: marker.prefix, explain: marker.explain}
        })
      }/>
    </div>
  )
}

type noteInfoPaneProps = {
  title: string;
}
export function noteInfoPane({title}: noteInfoPaneProps) {
  const firstRef = useRef(null);
  return (
    <div>
      <h1>{title}</h1>
      <button>管理者権限を譲渡</button>
      <div ref={firstRef}>
        <h4>編集を許可</h4>
      </div>
      <ResizerY targetRef={firstRef}/>
      <div ref={firstRef}>
        <h4>閲覧を許可</h4>
      </div>
    </div>
  );
}