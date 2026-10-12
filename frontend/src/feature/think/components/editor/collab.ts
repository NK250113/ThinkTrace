import * as Y from 'yjs'

export const DOC_ID = 'demo'

// 今はローカルだけのY.Doc。共同編集にするときは、ここにプロバイダーをつなぐ:
//   import { HocuspocusProvider } from '@hocuspocus/provider'
//   export const provider = new HocuspocusProvider({ url: 'wss://...', name: DOC_ID, document: ydoc })
export const ydoc = new Y.Doc()