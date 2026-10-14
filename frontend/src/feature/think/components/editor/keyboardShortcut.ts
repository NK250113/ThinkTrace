import { Extension } from '@tiptap/core'
import { useOutline } from "./EditorContext";
import { MARKER_DEFS } from "@/src/shared/utils/markerCatalog";
import { setMarkerForSelection, toggleFormatForSelection } from "./toolbarActions";

export const formatShortcuts = Extension.create({
  name: 'formatShortcuts',

  addKeyboardShortcuts() {
    console.log('formatShortcuts called')
    return {
      'Mod-b': () => {
        if (!this.editor) return false
        toggleFormatForSelection(this.editor, 'bold')
        return true
      },
      'Mod-i': () => {
        if (!this.editor) return false
        toggleFormatForSelection(this.editor, 'italic')
        return true
      },
      'Mod-s': () => {
        if (!this.editor) return false
        toggleFormatForSelection(this.editor, 'strike')
        return true
      },
    }
  },
})

export const markerShortcuts = Extension.create({
  name: 'markerShortcuts',

  addKeyboardShortcuts() {
    return Object.fromEntries(
      MARKER_DEFS.map((marker) => [
        `Alt-${marker.prefix}`,
        () => {
          if (!this.editor) return false
          return setMarkerForSelection(this.editor, marker.id)
        },
      ])
    )
  },
})