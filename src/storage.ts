// この端末（ブラウザ）の中だけに保存する。外には送らない。
import { emptyDraft } from './data'
import type { Draft, HistoryItem, Med } from './types'

const K_MEDS = 'jushin:meds:v1'
const K_DRAFT = 'jushin:draft:v1'
const K_HIST = 'jushin:history:v1'

function read<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem(key)
    return s ? (JSON.parse(s) as T) : fallback
  } catch {
    return fallback
  }
}
function write(key: string, v: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(v))
    return true
  } catch {
    return false
  }
}

export const loadMeds = (): Med[] => {
  const a = read<Med[]>(K_MEDS, [])
  return Array.isArray(a) ? a.filter((x) => x && typeof x.id === 'string') : []
}
export const saveMeds = (m: Med[]) => write(K_MEDS, m)

export const loadDraft = (): Draft => {
  const d = read<Partial<Draft>>(K_DRAFT, {})
  // 古い形の保存でも開けるよう、足りない項目は空で補う
  return { ...emptyDraft(), ...d }
}
export const saveDraft = (d: Draft) => write(K_DRAFT, d)

export const loadHistory = (): HistoryItem[] => {
  const a = read<HistoryItem[]>(K_HIST, [])
  return Array.isArray(a) ? a : []
}
export const saveHistory = (h: HistoryItem[]) => write(K_HIST, h.slice(0, 20))

export const clearAll = () => {
  try {
    localStorage.removeItem(K_MEDS)
    localStorage.removeItem(K_DRAFT)
    localStorage.removeItem(K_HIST)
  } catch {
    /* 何もしない */
  }
}

export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3)
