import { useState } from 'react'
import { uid } from './storage'
import type { Med } from './types'

/** いつものお薬の登録画面（問診とは別の画面） */
export function MedsEditor({ meds, setMeds }: { meds: Med[]; setMeds: (f: (m: Med[]) => Med[]) => void }) {
  const [name, setName] = useState('')
  const [how, setHow] = useState('')
  const add = () => {
    const n = name.trim()
    if (!n) return
    setMeds((m) => [...m, { id: uid(), name: n, how: how.trim() }])
    setName('')
    setHow('')
  }
  return (
    <div className="medsPage">
      {meds.length === 0 && <p className="empty">まだ登録されていません。お薬を飲んでいなければ、このままスキップできます。</p>}
      {meds.map((m) => (
        <div className="medCard" key={m.id}>
          <div className="medHead">
            <input
              className="medName"
              aria-label="お薬の名前"
              value={m.name}
              onChange={(e) => setMeds((a) => a.map((x) => (x.id === m.id ? { ...x, name: e.target.value } : x)))}
            />
            <button
              type="button"
              className="btn ghost small"
              onClick={() => {
                if (confirm(`「${m.name}」を、いつものお薬から外しますか？`)) setMeds((a) => a.filter((x) => x.id !== m.id))
              }}
            >
              外す
            </button>
          </div>
          <input
            className="medHow"
            aria-label="飲み方"
            value={m.how}
            placeholder="飲み方（例：朝食後 1錠）"
            onChange={(e) => setMeds((a) => a.map((x) => (x.id === m.id ? { ...x, how: e.target.value } : x)))}
          />
        </div>
      ))}
      <div className="addMed">
        <div className="miniLab">お薬を追加する</div>
        <input value={name} placeholder="お薬の名前" aria-label="追加するお薬の名前" onChange={(e) => setName(e.target.value)} />
        <input
          value={how}
          placeholder="飲み方（任意）"
          aria-label="追加するお薬の飲み方"
          onChange={(e) => setHow(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') add()
          }}
        />
        <button type="button" className="btn" onClick={add} disabled={!name.trim()}>
          ＋ 追加する
        </button>
      </div>
    </div>
  )
}
