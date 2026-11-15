// 受診前整理シートのデータの形

export type Level = 'good' | 'same' | 'little' | 'hard'

/** いつものお薬（この端末に残しておく） */
export interface Med {
  id: string
  name: string
  how: string // 飲み方・使い方
}

/** 今回の受診での、お薬ごとの記録 */
export interface MedLog {
  effect: '' | 'worked' | 'same' | 'bad' // 効いた／あまり変わらない／合わなかった
  stock: '' | 'enough' | 'low' | 'none' // 残り：十分／少ない／ない
  note: string
}

/** いま入力中の1回ぶんの記録 */
export interface Draft {
  date: string // yyyy-mm-dd
  place: string // 受診先（診療科など）
  main: string // 今日いちばん伝えたいこと
  also: string[] // ほかにも気になること
  topicMemo: string
  since: string
  freq: string
  triggers: string[]
  whenMemo: string
  feel: Record<string, Level | ''>
  feelMemo: string
  medLogs: Record<string, MedLog>
  tried: string // これまでの対処・お薬の気づき
  asks: string[] // 先生に聞きたいこと（選んだもの＋自分で足したもの）
  askMemo: string
  step: number // どこまで進んだか（0〜4）
}

/** 保存した過去の記録 */
export interface HistoryItem {
  id: string
  savedAt: string
  draft: Draft
  meds: Med[] // その時点のお薬
}

export interface SampleCase {
  id: string
  label: string
  summary: string
  draft: Draft
  meds: Med[]
}
