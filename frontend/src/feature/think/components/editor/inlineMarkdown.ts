// 書式の種類。記号は全ユーザー共通(設定では変えられない)
export type FormatType = 'bold' | 'italic' | 'strike'

export const FORMAT_TYPES: readonly FormatType[] = ['bold', 'italic', 'strike']

export const FORMATS: Record<FormatType, { mark: string; delimiter: string; className: string }> = {
  bold: { mark: 'bold', delimiter: '**', className: 'font-bold' },
  italic: { mark: 'italic', delimiter: '*', className: 'italic' },
  strike: { mark: 'strike', delimiter: '~~', className: 'line-through' },
}

export interface Span {
  type: FormatType
  open: [number, number] // 開き記号の範囲(段落のテキストの中のオフセット。[開始, 終了))
  close: [number, number] // 閉じ記号の範囲
}

interface Run {
  char: '*' | '~'
  start: number // 記号の連なりのうち、まだ使っていない部分の範囲
  end: number
  canOpen: boolean
  canClose: boolean
}

const isSpace = (c: string | undefined): boolean => c === undefined || /\s/.test(c)

// 「*」「~」の連なりを取り出す。次の文字が空白でなければ開ける、前の文字が空白でなければ閉じられる
function tokenize(text: string): Run[] {
  const runs: Run[] = []
  let i = 0
  while (i < text.length) {
    const c = text[i]
    if (c === '*' || c === '~') {
      let j = i
      while (text[j] === c) j++
      // 「~」は、ちょうど2つの連なりだけを記号として扱う
      if (c === '*' || j - i === 2) {
        runs.push({
          char: c,
          start: i,
          end: j,
          canOpen: !isSpace(text[j]),
          canClose: !isSpace(text[i - 1]),
        })
      }
      i = j
    } else {
      i++
    }
  }
  return runs
}

// 文字列から、記号で囲まれた範囲を見つける(Markdownの強調の規則を単純にしたもの)
export function parseInline(text: string): Span[] {
  const spans: Span[] = []
  const stack: Run[] = [] // 開ける可能性のある記号(まだ使い切っていないもの)

  for (const run of tokenize(text)) {
    if (run.canClose) {
      while (run.end > run.start) {
        // 同じ種類の、いちばん近い開き記号を探す
        let idx = -1
        for (let k = stack.length - 1; k >= 0; k--) {
          if (stack[k]?.char === run.char) {
            idx = k
            break
          }
        }
        const opener = stack[idx]
        if (!opener) break

        const openLen = opener.end - opener.start
        const closeLen = run.end - run.start
        const use = run.char === '~' || (openLen >= 2 && closeLen >= 2) ? 2 : 1
        spans.push({
          type: run.char === '~' ? 'strike' : use === 2 ? 'bold' : 'italic',
          open: [opener.end - use, opener.end], // 開き記号は、内側(後ろ)の文字から使う
          close: [run.start, run.start + use], // 閉じ記号は、内側(前)の文字から使う
        })
        opener.end -= use
        run.start += use
        stack.length = idx + 1 // 間に残った未完の記号は、もう閉じられない
        if (opener.end <= opener.start) stack.pop()
      }
    }
    if (run.canOpen && run.end > run.start) stack.push(run)
  }
  return spans
}