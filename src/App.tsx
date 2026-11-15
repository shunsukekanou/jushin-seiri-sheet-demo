import { useEffect, useRef, useState } from 'react'
import { emptyDraft, fmtDate, mainLabel, SAMPLES } from './data'
import { Kanpe } from './Kanpe'
import { MedsEditor } from './Meds'
import { Sheet } from './Sheet'
import { STEP_NAMES, StepBody } from './Steps'
import { clearAll, loadDraft, loadHistory, loadMeds, saveDraft, saveHistory, saveMeds, uid } from './storage'
import type { Draft, HistoryItem, Med } from './types'

type Screen = 'home' | 'meds' | 'step' | 'result'
type View = 'kanpe' | 'sheet'

const hasContent = (d: Draft) =>
  !!(d.main || d.topicMemo || d.since || d.freq || d.triggers.length || d.asks.length || d.tried || Object.keys(d.feel).length || d.also.length || d.mainOther || Object.keys(d.medLogs).length || d.place || d.whenMemo || d.feelMemo || d.askMemo)

export default function App() {
  const [mineMeds, setMineMeds] = useState<Med[]>(loadMeds)
  const [mineDraft, setMineDraft] = useState<Draft>(loadDraft)
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory)
  const [sample, setSample] = useState<{ id: string; label: string; draft: Draft; meds: Med[] } | null>(null)
  const [screen, setScreen] = useState<Screen>('home')
  const [view, setView] = useState<View>('kanpe')
  const [medsFrom, setMedsFrom] = useState<'home' | 'step'>('home')
  const [toast, setToast] = useState('')
  const [storeOk, setStoreOk] = useState(true)
  const tt = useRef<number | undefined>(undefined)

  const d = sample ? sample.draft : mineDraft
  const meds = sample ? sample.meds : mineMeds

  const setD = (f: (x: Draft) => Draft) => {
    if (sample) setSample((s) => (s ? { ...s, draft: f(s.draft) } : s))
    else setMineDraft(f)
  }
  const setMeds = (f: (x: Med[]) => Med[]) => {
    if (sample) setSample((s) => (s ? { ...s, meds: f(s.meds) } : s))
    else setMineMeds(f)
  }

  // 自分の記録だけを、この端末に保存する（見本は保存しない）
  useEffect(() => {
    setStoreOk((ok) => saveMeds(mineMeds) && ok)
  }, [mineMeds])
  useEffect(() => {
    setStoreOk((ok) => saveDraft(mineDraft) && ok)
  }, [mineDraft])
  useEffect(() => {
    setStoreOk((ok) => saveHistory(history) && ok)
  }, [history])

  const say = (s: string) => {
    setToast(s)
    window.clearTimeout(tt.current)
    tt.current = window.setTimeout(() => setToast(''), 2600)
  }
  const go = (s: Screen) => {
    setScreen(s)
    window.scrollTo(0, 0)
  }
  const goStep = (i: number) => {
    setD((x) => ({ ...x, step: i }))
    go('step')
  }

  // お薬の登録は、問診とは別の画面。どこから来たかで、戻り先と、ボタンの言葉が変わる
  const openMeds = (from: 'home' | 'step') => {
    setMedsFrom(from)
    go('meds')
  }

  const startNew = () => {
    if (!sample && hasContent(mineDraft) && !confirm('入力中の内容を消して、新しく始めますか？\n（いつものお薬は残ります）')) return
    setSample(null)
    setMineDraft(emptyDraft())
    goStep(0)
  }
  const fromHistory = (h: HistoryItem, keepDate: boolean) => {
    // 保存時のお薬のうち、いまの一覧に無いものは足す（記録を開いても欠けないように）
    setMineMeds((cur) => [...cur, ...h.meds.filter((m) => !cur.some((c) => c.id === m.id))])
    setSample(null)
    setMineDraft({ ...h.draft, date: keepDate ? h.draft.date : emptyDraft().date, step: 0 })
  }
  const startSample = (id: string) => {
    const s = SAMPLES.find((x) => x.id === id)!
    setSample({ id, label: s.label, draft: structuredClone(s.draft), meds: structuredClone(s.meds) })
    setView('kanpe')
    go('result')
  }
  const leaveSample = () => {
    setSample(null)
    go('home')
  }
  const saveRecord = () => {
    const item: HistoryItem = { id: uid(), savedAt: new Date().toISOString(), draft: { ...mineDraft, step: 0 }, meds: mineMeds }
    setHistory((h) => [item, ...h].slice(0, 20))
    say('保存しました（この端末の中だけ）')
  }
  const wipe = () => {
    if (!confirm('この端末に保存した、お薬・入力中の内容・保存した記録を、すべて消します。よろしいですか？')) return
    clearAll()
    setMineMeds([])
    setMineDraft(emptyDraft())
    setHistory([])
    say('すべて消しました')
  }

  const showResult = (v: View) => {
    setView(v)
    go('result')
  }

  const canContinue = !sample && hasContent(mineDraft)

  return (
    <div className="app">
      {screen !== 'home' && (
        <header className="top noPrint">
          <button type="button" className="brand" onClick={() => go('home')} aria-label="最初の画面へ">
            <span className="logo" aria-hidden="true">
              ✚
            </span>
            受診前整理シート
          </button>
          <button type="button" className="btn ghost small" onClick={() => go('home')}>
            最初へ
          </button>
        </header>
      )}

      {sample && (
        <div className="sampleBar noPrint" role="status">
          <span>
            <b>見本を表示中：</b>
            {sample.label}（架空のケースです。入力しても保存されません）
          </span>
          <button type="button" className="btn ghost small" onClick={leaveSample}>
            自分の記録に戻る
          </button>
        </div>
      )}
      {!storeOk && (
        <div className="warnBar noPrint" role="alert">
          この端末に保存できませんでした（プライベートモードや保存の制限が考えられます）。入力は、この画面を閉じると消えます。
        </div>
      )}

      {screen === 'home' && (
        <main className="home noPrint">
          <div className="hero">
            <span className="logo big" aria-hidden="true">
              ✚
            </span>
            <h1>受診前整理シート</h1>
          </div>
          <p className="tag">受診前の、伝え漏れを防ぐ。</p>
          <p className="lead">
            <b>5つの質問に答えるだけ</b>で、医師に伝えたいことが気軽にまとめられます。待合室で<b>約3分</b>。
            <b>A4用紙への印刷</b>にも対応しています。
          </p>

          <div className="homeBtns">
            <button type="button" className="btn big" onClick={startNew}>
              問診を始める
              <small>今日の状況をまとめる（約3分）</small>
            </button>
            <button
              type="button"
              className="btn big green"
              onClick={() => {
                setSample(null)
                openMeds('home')
              }}
            >
              お薬の記録を追加する
              <small>
                {mineMeds.length
                  ? `登録済み ${mineMeds.length}件`
                  : '飲んでいるお薬を登録しておく（任意）'}
              </small>
            </button>
            {canContinue && (
              <button type="button" className="btn big alt" onClick={() => goStep(Math.min(d.step, 4))}>
                入力中の問診の、続きから
              </button>
            )}
            {history[0] && (
              <button
                type="button"
                className="btn big alt"
                onClick={() => {
                  fromHistory(history[0], false)
                  goStep(0)
                }}
              >
                前回の記録から、問診を始める
                <small>
                  {fmtDate(history[0].draft.date)}
                  {history[0].draft.place ? `・${history[0].draft.place}` : ''}
                </small>
              </button>
            )}
          </div>

          {history.length > 0 && (
            <section className="card">
              <h2>保存した記録</h2>
              <ul className="hist">
                {history.map((h) => (
                  <li key={h.id}>
                    <span>
                      {fmtDate(h.draft.date)}
                      {h.draft.place ? `・${h.draft.place}` : ''}
                      <small>{mainLabel(h.draft) || '（伝えたいこと未入力）'}</small>
                    </span>
                    <span className="histBtns">
                      <button
                        type="button"
                        className="btn ghost small"
                        onClick={() => {
                          fromHistory(h, true)
                          showResult('sheet')
                        }}
                      >
                        開く
                      </button>
                      <button
                        type="button"
                        className="btn ghost small"
                        onClick={() => confirm('この記録を消しますか？') && setHistory((x) => x.filter((y) => y.id !== h.id))}
                      >
                        消す
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="card sampleCard">
            <h2>見本のケースで試す</h2>
            <p>架空の受診ケースが1タップで開きます。自分の記録には影響せず、保存もされません。</p>
            <div className="sampleBtns">
              {SAMPLES.map((s) => (
                <button key={s.id} type="button" className="btn ghost sample" onClick={() => startSample(s.id)}>
                  <b>{s.label}</b>
                  <small>{s.summary}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="note">
            <p>
              入力した内容は、この端末（ブラウザ）の中だけに保存されます。外のサーバーやAIには送りません。
              診断や治療の判断をするものではなく、診察で伝えるためのメモを整えるアプリです。
            </p>
            <button type="button" className="linkBtn" onClick={wipe}>
              この端末に保存したデータを、すべて消す
            </button>
          </section>
        </main>
      )}

      {screen === 'step' && (
        <main className="stepPage">
          <nav className="pills noPrint" aria-label="ステップ">
            {STEP_NAMES.map((n, i) => (
              <button
                key={n}
                type="button"
                className={'pill' + (i === d.step ? ' cur' : i < d.step ? ' past' : '')}
                aria-current={i === d.step ? 'step' : undefined}
                onClick={() => goStep(i)}
              >
                <span>{i + 1}</span>
                {n}
              </button>
            ))}
          </nav>
          <div className="stepBody">
            <StepBody step={d.step} d={d} meds={meds} setD={setD} goMeds={() => openMeds('step')} />
          </div>
          <div className="navBar noPrint">
            <button type="button" className="btn ghost" disabled={d.step === 0} onClick={() => goStep(d.step - 1)}>
              ← 前へ
            </button>
            <button type="button" className="btn ghost" onClick={() => showResult('kanpe')}>
              ここまでで結果を見る
            </button>
            {d.step < 4 ? (
              <button type="button" className="btn" onClick={() => goStep(d.step + 1)}>
                次へ →
              </button>
            ) : (
              <button type="button" className="btn" onClick={() => showResult('kanpe')}>
                シートを作る
              </button>
            )}
          </div>
        </main>
      )}

      {screen === 'meds' && (
        <main className="stepPage">
          <div className="stepBody">
            <h2 className="qh">
              <span className="no">✚</span>いつものお薬の記録
            </h2>
            <p className="hint">
              飲んでいるお薬を一度登録しておくと、問診で毎回使えます（書き直しは要りません）。
            </p>
            <MedsEditor meds={meds} setMeds={setMeds} />
          </div>
          <div className="navBar noPrint">
            {medsFrom === 'home' && (
              <button type="button" className="btn ghost" onClick={() => go('home')}>
                ← 最初へ
              </button>
            )}
            <button type="button" className="btn" onClick={() => (medsFrom === 'step' ? goStep(d.step) : go('home'))}>
              {medsFrom === 'step' ? '← 問診に戻る' : '登録を終える'}
            </button>
          </div>
        </main>
      )}

      {screen === 'result' && (
        <main className="resultPage">
          <div className="tools noPrint">
            <div className="seg" role="tablist" aria-label="表示の切り替え">
              <button type="button" role="tab" aria-selected={view === 'kanpe'} className={view === 'kanpe' ? 'on' : ''} onClick={() => setView('kanpe')}>
                カンペ<small>口で伝える</small>
              </button>
              <button type="button" role="tab" aria-selected={view === 'sheet'} className={view === 'sheet' ? 'on' : ''} onClick={() => setView('sheet')}>
                シート<small>医師に見せる</small>
              </button>
            </div>
            <div className="acts">
              <button type="button" className="btn" onClick={() => window.print()}>
                A4で印刷・PDF保存
              </button>
              {!sample && (
                <button type="button" className="btn ghost" onClick={saveRecord}>
                  この記録を保存
                </button>
              )}
              <button type="button" className="btn ghost" onClick={() => goStep(0)}>
                入力を直す
              </button>
            </div>
          </div>

          {view === 'kanpe' ? (
            <>
              <div className="noPrint">
                <Kanpe d={d} meds={meds} />
              </div>
              <div className="printOnly">
                <Sheet d={d} meds={meds} />
              </div>
            </>
          ) : (
            <div className="sheetWrap">
              <Sheet d={d} meds={meds} />
            </div>
          )}
        </main>
      )}

      {toast && (
        <div className="toast noPrint" role="status">
          {toast}
        </div>
      )}
    </div>
  )
}
