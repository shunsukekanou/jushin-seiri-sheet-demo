// 口頭で伝えるカンペ（話す順番と、そのまま読める文）を作る
import { alsoList, effectLabel, FEEL_ITEMS, mainLabel, stockLabel } from './data'
import type { Draft, Med } from './types'

export interface Point {
  key: string
  title: string
  text: string
  sub?: string[]
}

const join = (a: string[]) => a.join('、')

export function feelGroups(d: Draft) {
  const items = [...FEEL_ITEMS, ...Object.keys(d.feel).filter((k) => !FEEL_ITEMS.includes(k))]
  const g = { hard: [] as string[], little: [] as string[], same: [] as string[], good: [] as string[], none: [] as string[] }
  for (const it of items) {
    const v = d.feel[it]
    if (v === 'hard' || v === 'little' || v === 'same' || v === 'good') g[v].push(it)
    else g.none.push(it)
  }
  return g
}

export function makeScript(d: Draft, meds: Med[]): Point[] {
  const out: Point[] = []

  // 1 いちばん伝えたいこと
  const main = mainLabel(d) || '（まだ選んでいません）'
  let t1 = `今日いちばんお伝えしたいのは、「${main}」のことです。`
  if (d.topicMemo.trim()) t1 += d.topicMemo.trim()
  const sub1: string[] = []
  if (d.also.length) sub1.push(`ほかにも気になること：${join(alsoList(d))}`)
  out.push({ key: 'main', title: '1　今日いちばん伝えたいこと', text: t1, sub: sub1 })

  // 2 いつから・どんなとき
  const w: string[] = []
  if (d.since) w.push(`${d.since}です。`)
  if (d.freq) w.push(`頻度は「${d.freq}」です。`)
  if (d.triggers.length) w.push(`${join(d.triggers)}に出やすいです。`)
  if (d.whenMemo.trim()) w.push(d.whenMemo.trim())
  out.push({ key: 'when', title: '2　いつから・どんなとき', text: w.length ? w.join('') : '（入力なし）' })

  // 3 全体感・生活の変化
  const g = feelGroups(d)
  const f: string[] = []
  if (g.hard.length) f.push(`「つらい」のは、${join(g.hard)}です。`)
  if (g.little.length) f.push(`「少しつらい」のは、${join(g.little)}です。`)
  if (g.same.length) f.push(`${join(g.same)}は、変わりません。`)
  if (g.good.length) f.push(`${join(g.good)}は、良いです。`)
  if (d.feelMemo.trim()) f.push(d.feelMemo.trim())
  out.push({
    key: 'feel',
    title: '3　全体感・生活の変化（伝え漏れしやすいところ）',
    text: f.length ? f.join('') : '（入力なし）',
  })

  // 4 お薬
  const lines: string[] = []
  for (const m of meds) {
    const l = d.medLogs[m.id]
    const parts = [m.name]
    if (l?.effect) parts.push(`${effectLabel(l.effect)}`)
    if (l?.stock && l.stock !== 'enough') parts.push(`残りは「${stockLabel(l.stock)}」`)
    if (l?.note.trim()) parts.push(l.note.trim())
    lines.push(parts.join('：'))
  }
  let t4 = meds.length ? `いま使っているお薬は${meds.length}種類です。` : 'いま使っているお薬は、ありません（登録なし）。'
  if (d.tried.trim()) t4 += d.tried.trim()
  out.push({ key: 'meds', title: '4　お薬と、これまでの対処', text: t4, sub: lines })

  // 5 聞きたいこと
  const asks = [...d.asks]
  if (d.askMemo.trim()) asks.push(d.askMemo.trim())
  out.push({
    key: 'asks',
    title: '5　先生に聞きたいこと',
    text: asks.length ? '次のことを聞きたいです。' : '（入力なし）',
    sub: asks,
  })
  return out
}


