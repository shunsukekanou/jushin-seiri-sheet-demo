import { useState } from 'react'
import { ASKS, EFFECTS, FEEL_ITEMS, FREQ, LEVELS, SINCE, STOCKS, TOPICS, TRIGGERS } from './data'
import type { Draft, Level, Med, MedLog } from './types'

export const STEP_NAMES = ['伝えたいこと', 'いつから', '全体の様子', 'お薬', '聞きたいこと']

interface Props {
  d: Draft
  meds: Med[]
  setD: (f: (d: Draft) => Draft) => void
  goMeds: () => void
}

function Chips({
  options,
  value,
  onChange,
  multi,
}: {
  options: string[]
  value: string | string[]
  onChange: (v: string | string[]) => void
  multi?: boolean
}) {
  const sel = (o: string) => (multi ? (value as string[]).includes(o) : value === o)
  return (
    <div className="chips" role={multi ? 'group' : 'radiogroup'}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          className={'chip' + (sel(o) ? ' on' : '')}
          aria-pressed={sel(o)}
          onClick={() => {
            if (multi) {
              const v = value as string[]
              onChange(v.includes(o) ? v.filter((x) => x !== o) : [...v, o])
            } else onChange(value === o ? '' : o)
          }}
        >
          {sel(o) ? '✓ ' : ''}
          {o}
        </button>
      ))}
    </div>
  )
}

function Step1({ d, setD }: Props) {
  return (
    <>
      <h2 className="qh">
        <span className="no">1</span>今日、いちばん伝えたいことは？
      </h2>
      <p className="hint">ひとつだけ選びます。決められないときは、あとで直せます。</p>
      <Chips options={TOPICS} value={d.main} onChange={(v) => setD((x) => ({ ...x, main: v as string, also: x.also.filter((a) => a !== v) }))} />
      <label className="lab" htmlFor="tm">
        ひとことメモ（任意）
      </label>
      <textarea
        id="tm"
        rows={3}
        value={d.topicMemo}
        placeholder="例：夕方になると頭が重く、仕事の後半に集中できない"
        onChange={(e) => setD((x) => ({ ...x, topicMemo: e.target.value }))}
      />
      <h3 className="sh">ほかにも気になることは？（いくつでも）</h3>
      <Chips
        multi
        options={TOPICS.filter((t) => t !== d.main)}
        value={d.also}
        onChange={(v) => setD((x) => ({ ...x, also: v as string[] }))}
      />
      <h3 className="sh">これから受診する病院について（任意）</h3>
      <p className="hint">シートの右上に載ります。書かなくても大丈夫です。</p>
      <label className="lab" htmlFor="pl">
        受診する病院・診療科
      </label>
      <input id="pl" value={d.place} placeholder="例：内科、○○クリニック" onChange={(e) => setD((x) => ({ ...x, place: e.target.value }))} />
      <label className="lab" htmlFor="dt">
        受診する日（今日の日付が入っています）
      </label>
      <input id="dt" type="date" value={d.date} onChange={(e) => setD((x) => ({ ...x, date: e.target.value }))} />
    </>
  )
}

function Step2({ d, setD }: Props) {
  return (
    <>
      <h2 className="qh">
        <span className="no">2</span>いつから、どんなときに？
      </h2>
      <h3 className="sh">いつから</h3>
      <Chips options={SINCE} value={d.since} onChange={(v) => setD((x) => ({ ...x, since: v as string }))} />
      <h3 className="sh">どのくらいの頻度で</h3>
      <Chips options={FREQ} value={d.freq} onChange={(v) => setD((x) => ({ ...x, freq: v as string }))} />
      <h3 className="sh">出やすいとき・きっかけ（いくつでも）</h3>
      <Chips multi options={TRIGGERS} value={d.triggers} onChange={(v) => setD((x) => ({ ...x, triggers: v as string[] }))} />
      <label className="lab" htmlFor="wm">
        ひとことメモ（任意）
      </label>
      <textarea
        id="wm"
        rows={2}
        value={d.whenMemo}
        placeholder="例：忙しい週ほどひどい気がする"
        onChange={(e) => setD((x) => ({ ...x, whenMemo: e.target.value }))}
      />
    </>
  )
}

function Step3({ d, setD }: Props) {
  const set = (item: string, k: Level) =>
    setD((x) => ({ ...x, feel: { ...x.feel, [item]: x.feel[item] === k ? '' : k } }))
  return (
    <>
      <h2 className="qh">
        <span className="no">3</span>最近の、体と生活の様子は？
      </h2>
      <p className="hint">診察では、一番の悩み以外の変化を言い忘れがちです。ボタンを押すだけで大丈夫です。</p>
      <div className="feelList">
        {FEEL_ITEMS.map((it) => (
          <div className="feelRow" key={it}>
            <div className="feelName">{it}</div>
            <div className="lv" role="radiogroup" aria-label={it}>
              {LEVELS.map((l) => (
                <button
                  key={l.k}
                  type="button"
                  className={`lvBtn ${l.k}` + (d.feel[it] === l.k ? ' on' : '')}
                  aria-pressed={d.feel[it] === l.k}
                  onClick={() => set(it, l.k)}
                >
                  <span className="mk">{l.mark}</span>
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <label className="lab" htmlFor="fm">
        ほかの変化（体重・熱・便通・めまいなど。任意）
      </label>
      <textarea id="fm" rows={2} value={d.feelMemo} onChange={(e) => setD((x) => ({ ...x, feelMemo: e.target.value }))} />
    </>
  )
}

function Step4({ d, meds, setD, goMeds }: Props) {
  const log = (id: string): MedLog => d.medLogs[id] ?? { effect: '', stock: '', note: '' }
  const upd = (id: string, p: Partial<MedLog>) =>
    setD((x) => ({ ...x, medLogs: { ...x.medLogs, [id]: { ...log(id), ...p } } }))
  return (
    <>
      <h2 className="qh">
        <span className="no">4</span>お薬の様子と、これまでの対処
      </h2>
      <p className="hint">登録したお薬ごとに、今回の効き目と残りを選びます。</p>
      {meds.length === 0 && <p className="empty">登録されたお薬はありません。このまま、次へ進めます。</p>}
      {meds.map((m) => {
        const l = log(m.id)
        return (
          <div className="medCard" key={m.id}>
            <div className="medTitle">
              {m.name}
              {m.how && <small>{m.how}</small>}
            </div>
            <div className="miniLab">効き目</div>
            <div className="chips tight">
              {EFFECTS.map((e) => (
                <button
                  key={e.k}
                  type="button"
                  className={'chip' + (l.effect === e.k ? ' on' : '')}
                  aria-pressed={l.effect === e.k}
                  onClick={() => upd(m.id, { effect: l.effect === e.k ? '' : e.k })}
                >
                  {e.label}
                </button>
              ))}
            </div>
            <div className="miniLab">残り</div>
            <div className="chips tight">
              {STOCKS.map((e) => (
                <button
                  key={e.k}
                  type="button"
                  className={'chip' + (l.stock === e.k ? ' on' : '')}
                  aria-pressed={l.stock === e.k}
                  onClick={() => upd(m.id, { stock: l.stock === e.k ? '' : e.k })}
                >
                  {e.label}
                </button>
              ))}
            </div>
            <input
              className="medNote"
              aria-label="お薬のメモ"
              value={l.note}
              placeholder="メモ（例：かぶれた、眠くなる）"
              onChange={(e) => upd(m.id, { note: e.target.value })}
            />
          </div>
        )
      })}
      <button type="button" className="btn ghost small medsLink" onClick={goMeds}>
        お薬の登録を直す・追加する
      </button>
      <label className="lab" htmlFor="tr">
        これまでの対処・お薬の気づき（任意）
      </label>
      <textarea
        id="tr"
        rows={3}
        value={d.tried}
        placeholder="例：市販薬を週2回飲んだ、早く寝るようにした"
        onChange={(e) => setD((x) => ({ ...x, tried: e.target.value }))}
      />
    </>
  )
}

function Step5({ d, setD }: Props) {
  const [custom, setCustom] = useState('')
  const extra = d.asks.filter((a) => !ASKS.includes(a))
  const toggle = (a: string) =>
    setD((x) => ({ ...x, asks: x.asks.includes(a) ? x.asks.filter((y) => y !== a) : [...x.asks, a] }))
  const add = () => {
    const c = custom.trim()
    if (!c) return
    if (!d.asks.includes(c)) setD((x) => ({ ...x, asks: [...x.asks, c] }))
    setCustom('')
  }
  return (
    <>
      <h2 className="qh">
        <span className="no">5</span>今日、先生に聞きたいことは？
      </h2>
      <p className="hint">聞き忘れ防止のチェックリストです。当てはまるものを押してください。</p>
      <div className="checks">
        {[...ASKS, ...extra].map((a) => {
          const on = d.asks.includes(a)
          return (
            <button key={a} type="button" className={'check' + (on ? ' on' : '')} aria-pressed={on} onClick={() => toggle(a)}>
              <span className="box">{on ? '☑' : '☐'}</span>
              {a}
            </button>
          )
        })}
      </div>
      <div className="addMed">
        <div className="miniLab">自分の質問を足す</div>
        <input
          value={custom}
          placeholder="例：市販薬と一緒に飲んでよいか"
          aria-label="自分の質問"
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') add()
          }}
        />
        <button type="button" className="btn" onClick={add} disabled={!custom.trim()}>
          ＋ 質問を足す
        </button>
      </div>
      <label className="lab" htmlFor="am">
        自由メモ（任意）
      </label>
      <textarea id="am" rows={3} value={d.askMemo} onChange={(e) => setD((x) => ({ ...x, askMemo: e.target.value }))} />
    </>
  )
}

export function StepBody({ step, ...p }: Props & { step: number }) {
  const C = [Step1, Step2, Step3, Step4, Step5][step]
  return <C key={step} {...p} />
}
