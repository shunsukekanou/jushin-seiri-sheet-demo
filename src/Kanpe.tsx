import { useState } from 'react'
import { makeScript } from './script'
import type { Draft, Med } from './types'

/** 口頭で伝えるカンペ。伝えたら押して✓を付けると、言い忘れが分かる */
export function Kanpe({ d, meds }: { d: Draft; meds: Med[] }) {
  const pts = makeScript(d, meds)
  const [done, setDone] = useState<Record<string, boolean>>({})
  const left = pts.filter((p) => !done[p.key]).length
  return (
    <div className="kanpe">
      <p className="hint">
        話す順番に並べました。<b>伝えたら、その枠を押して✓</b>を付けると、言い忘れが分かります。
        {left === 0 ? '（全部伝えました）' : `（あと ${left} 個）`}
      </p>
      {pts.map((p) => {
        const on = !!done[p.key]
        return (
          <button
            key={p.key}
            type="button"
            className={'kp' + (on ? ' done' : '')}
            aria-pressed={on}
            onClick={() => setDone((x) => ({ ...x, [p.key]: !x[p.key] }))}
          >
            <span className="kpTitle">
              <span className="kpMark">{on ? '✓' : '○'}</span>
              {p.title}
            </span>
            <span className="kpText">{p.text}</span>
            {p.sub && p.sub.length > 0 && (
              <ul className="kpSub">
                {p.sub.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            )}
          </button>
        )
      })}
    </div>
  )
}
