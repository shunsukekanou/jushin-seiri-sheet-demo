import { alsoList, effectLabel, FEEL_ITEMS, fmtDate, levelLabel, levelOf, mainLabel, stockLabel } from './data'
import type { Draft, Med } from './types'

const none = <span className="none">（未入力）</span>

/** A4・1枚の要約シート（医師に見せる／印刷・PDF） */
export function Sheet({ d, meds }: { d: Draft; meds: Med[] }) {
  const items = [...FEEL_ITEMS, ...Object.keys(d.feel).filter((k) => !FEEL_ITEMS.includes(k))]
  const asks = [...d.asks, ...(d.askMemo.trim() ? [d.askMemo.trim()] : [])]
  const when = [d.since, d.freq].filter(Boolean)
  // 内容が多いときは、印刷の文字を自動で小さくして、A4・1枚に収める
  const chars = [d.topicMemo, d.whenMemo, d.feelMemo, d.tried, ...asks, ...meds.map((m) => m.name + m.how)].join('').length
  const load = chars / 90 + meds.length * 1.4 + asks.length * 0.5
  const dense = load > 26 ? ' denser' : load > 17 ? ' dense' : ''
  return (
    <article className={'sheet' + dense} aria-label="受診前整理シート">
      <header className="shHead">
        <div className="shTitle">受診前 整理シート</div>
        <div className="shMeta">
          <span>{fmtDate(d.date)}</span>
          {d.place && <span>{d.place}</span>}
        </div>
      </header>

      <section className="shMain">
        <div className="shLab">① 今日いちばん伝えたいこと</div>
        <div className="shBig">{mainLabel(d) || none}</div>
        {d.topicMemo.trim() && <p className="shText">{d.topicMemo.trim()}</p>}
        <dl className="shWhen">
          <div>
            <dt>いつから・頻度</dt>
            <dd>{when.length ? when.join('／') : none}</dd>
          </div>
          <div>
            <dt>出やすいとき</dt>
            <dd>{d.triggers.length ? d.triggers.join('、') : none}</dd>
          </div>
          {d.also.length > 0 && (
            <div>
              <dt>ほかにも</dt>
              <dd>{alsoList(d).join('、')}</dd>
            </div>
          )}
        </dl>
        {d.whenMemo.trim() && <p className="shText">{d.whenMemo.trim()}</p>}
      </section>

      <section>
        <div className="shLab">② 全体感・生活の変化</div>
        <div className="shFeel">
          {items.map((it) => {
            const l = levelOf(d.feel[it] ?? '')
            return (
              <div key={it} className={'fcell ' + (l?.k ?? 'blank')}>
                <span className="fname">{it}</span>
                <span className="fval">
                  {l ? (
                    <>
                      <b>{l.mark}</b> {levelLabel(it, l.k)}
                    </>
                  ) : (
                    '―'
                  )}
                </span>
              </div>
            )
          })}
        </div>
        {d.feelMemo.trim() && <p className="shText">{d.feelMemo.trim()}</p>}
      </section>

      <section>
        <div className="shLab">③ いまのお薬と変化</div>
        {meds.length === 0 ? (
          <p className="shText">お薬の登録なし</p>
        ) : (
          <table className="shTable">
            <thead>
              <tr>
                <th>お薬</th>
                <th>飲み方</th>
                <th>効き目</th>
                <th>残り</th>
                <th>メモ</th>
              </tr>
            </thead>
            <tbody>
              {meds.map((m) => {
                const l = d.medLogs[m.id]
                return (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{m.how}</td>
                    <td className={l?.effect === 'bad' ? 'warn' : ''}>{effectLabel(l?.effect ?? '')}</td>
                    <td className={l?.stock === 'low' || l?.stock === 'none' ? 'warn' : ''}>{stockLabel(l?.stock ?? '')}</td>
                    <td>{l?.note}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
        {d.tried.trim() && <p className="shText">これまでの対処：{d.tried.trim()}</p>}
      </section>

      <section>
        <div className="shLab">④ 先生への質問</div>
        {asks.length === 0 ? (
          <p className="shText">{none}</p>
        ) : (
          <ul className="shAsks">
            {asks.map((a, i) => (
              <li key={i}>
                <span className="cb">☐</span>
                {a}
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="shFoot">この端末の中だけで作成した、本人用のメモです（診断をするものではありません）。</footer>
    </article>
  )
}
