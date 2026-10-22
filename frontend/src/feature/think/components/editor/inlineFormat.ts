import { FORMATS, FORMAT_TYPES, parseInline, type FormatType } from './inlineMarkdown'

// 表示される1文字と、その書式(記号の文字は含まない)
export interface Cell {
  ch: string
  formats: Set<FormatType>
}

export interface ParsedRow {
  cells: Cell[]
  positions: number[] // cells[k] の文字が、元の文字列の何文字目か
  cellBefore: number[] // 元の文字列の i 文字目より前にある、表示される文字の数(長さは text.length + 1)
}

// 文字列 → 表示される文字ごとの書式
export function toCells(text: string): ParsedRow {
  const spans = parseInline(text)
  const isDelimiter: boolean[] = new Array(text.length).fill(false)
  const formats: Set<FormatType>[] = Array.from({ length: text.length }, () => new Set<FormatType>())

  for (const span of spans) {
    for (let i = span.open[0]; i < span.open[1]; i++) isDelimiter[i] = true
    for (let i = span.close[0]; i < span.close[1]; i++) isDelimiter[i] = true
    for (let i = span.open[1]; i < span.close[0]; i++) formats[i]!.add(span.type)
  }

  const cells: Cell[] = []
  const positions: number[] = []
  const cellBefore: number[] = []
  for (let i = 0; i < text.length; i++) {
    cellBefore.push(cells.length)
    if (!isDelimiter[i]) {
      cells.push({ ch: text[i]!, formats: formats[i]! })
      positions.push(i)
    }
  }
  cellBefore.push(cells.length)
  return { cells, positions, cellBefore }
}

// 範囲 [from, to) の全ての文字に、その書式が付いているか
export function isFormatted(cells: Cell[], from: number, to: number, type: FormatType): boolean {
  for (let k = from; k < to; k++) {
    if (!cells[k]!.formats.has(type)) return false
  }
  return true
}

// 範囲 [from, to) に、書式を付ける(on = true)/外す(on = false)
export function setFormat(cells: Cell[], from: number, to: number, type: FormatType, on: boolean): void {
  for (let k = from; k < to; k++) {
    if (on) cells[k]!.formats.add(type)
    else cells[k]!.formats.delete(type)
  }
}

// ---- 記号つきの文字列に戻す -------------------------------------------

interface Run {
  type: FormatType
  from: number // 書式が付いている、連続した範囲 [from, to)(セルの番号)
  to: number
}

const isSpace = (ch: string) => /\s/.test(ch)

// 種類ごとに、書式が連続している範囲を集める
function makeRuns(cells: Cell[]): Run[] {
  const runs: Run[] = []
  for (const type of FORMAT_TYPES) {
    let from = -1
    for (let k = 0; k <= cells.length; k++) {
      const has = k < cells.length && cells[k]!.formats.has(type)
      if (has && from < 0) from = k
      if (!has && from >= 0) {
        runs.push({ type, from, to: k })
        from = -1
      }
    }
  }
  return runs
}

// 範囲の端の空白を外す(「** foo **」は太字として読み取れないため)。空になった範囲は捨てる
function trimRuns(runs: Run[], cells: Cell[]): Run[] {
  return runs
    .map((r) => {
      let { from, to } = r
      while (from < to && isSpace(cells[from]!.ch)) from++
      while (to > from && isSpace(cells[to - 1]!.ch)) to--
      return { ...r, from, to }
    })
    .filter((r) => r.from < r.to)
}

// 記号は入れ子にしかできないので、交差している範囲(a の途中で b が始まり、b の途中で a が終わる)を、
// b を a の終わりで2つに分けて、解消する
function splitCrossing(runs: Run[]): Run[] {
  const result = [...runs]
  for (let guard = 0; guard < 1000; guard++) {
    let found: { a: Run; b: Run } | null = null
    for (const a of result) {
      for (const b of result) {
        if (!found && a.from < b.from && b.from < a.to && a.to < b.to) found = { a, b }
      }
    }
    if (!found) break
    const { a, b } = found
    result.splice(result.indexOf(b), 1, { ...b, to: a.to }, { ...b, from: a.to })
  }
  return result
}

const order = (t: FormatType) => FORMAT_TYPES.indexOf(t)
// 同じ位置で閉じる順: 内側(始まりが後ろ)が先。同じ範囲なら、開いた順の逆
const byCloseOrder = (x: Run, y: Run) => y.from - x.from || order(y.type) - order(x.type)
// 同じ位置で開く順: 外側(終わりが後ろ)が先。同じ範囲なら、決まった順
const byOpenOrder = (x: Run, y: Run) => y.to - x.to || order(x.type) - order(y.type)

export interface Serialized {
  text: string // 記号つきの文字列
  starts: number[] // cells[k] の文字の、text の中での位置
  ends: number[] // cells[k] の文字の、直後の位置
}

// 表示される文字ごとの書式 → 記号つきの文字列
export function fromCells(cells: Cell[]): Serialized {
  const runs = trimRuns(splitCrossing(trimRuns(makeRuns(cells), cells)), cells)

  let text = ''
  const starts: number[] = []
  const ends: number[] = []
  for (let b = 0; b <= cells.length; b++) {
    // 境目 b で、閉じる記号(内側から) → 開く記号(外側から)の順に出す
    for (const r of runs.filter((r) => r.to === b).sort(byCloseOrder)) text += FORMATS[r.type].delimiter
    for (const r of runs.filter((r) => r.from === b).sort(byOpenOrder)) text += FORMATS[r.type].delimiter
    if (b < cells.length) {
      starts.push(text.length)
      text += cells[b]!.ch
      ends.push(text.length)
    }
  }
  return { text, starts, ends }
}