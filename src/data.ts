import type { Draft, Level, Med, SampleCase } from './types'

export const TOPICS = [
  'ずっと続く痛み',
  '頭痛・頭の重さ',
  'だるさ・疲れやすさ',
  '眠れない・眠りが浅い',
  '食欲がない・胃の不調',
  'せき・のど・熱',
  'かゆみ・湿疹',
  '気分の落ち込み・不安',
  'めまい・ふらつき',
  'お薬のことで相談したい',
  '検査結果が気になる',
  'その他',
]

export const SINCE = [
  '今日',
  '数日前から',
  '1週間ほど前から',
  '2〜3週間前から',
  '1〜3か月前から',
  '半年以上前から',
  '前回の受診のあとから',
]

export const FREQ = ['ずっと続いている', '毎日', '週に数回', 'ときどき', '突然1回だけ']

export const TRIGGERS = [
  '朝',
  '夜・寝る前',
  '食事のあと',
  '動いたとき',
  '仕事・家事のあと',
  'お風呂のあと',
  '天気・気温の変化',
  'ストレスを感じたとき',
  '特にきっかけはない',
]

export const FEEL_ITEMS = ['睡眠', '食事', '気分', 'だるさ・体力', '仕事や家事', '外出・人と会う']

export const LEVELS: { k: Level; label: string; mark: string }[] = [
  { k: 'good', label: '良い', mark: '◎' },
  { k: 'same', label: '変わらない', mark: '○' },
  { k: 'little', label: '少しつらい', mark: '△' },
  { k: 'hard', label: 'つらい', mark: '×' },
]

/** 全体の様子：項目ごとに合う言葉（良い・変わらない・少し悪い・悪い の4段階に対応） */
export const FEEL_LABELS: Record<string, [string, string, string, string]> = {
  睡眠: ['良く眠れる', '変わらない', '眠りづらい', '眠れない'],
  食事: ['食べられる', '変わらない', '食べづらい', '食べられない'],
  気分: ['良い', '変わらない', '沈みがち', 'とても沈む'],
  'だるさ・体力': ['元気', '変わらない', 'だるい', '動けない'],
  仕事や家事: ['できる', '変わらない', 'やりづらい', 'できない'],
  '外出・人と会う': ['できる', '変わらない', 'おっくう', 'できない'],
}
/** 項目ごとの、質問の文 */
export const FEEL_Q: Record<string, string> = {
  睡眠: '最近、よく眠れていますか？',
  食事: '最近、食事はとれていますか？',
  気分: '最近の気分は、どうですか？',
  'だるさ・体力': '最近のだるさ・体力は、どうですか？',
  仕事や家事: '最近、仕事や家事はできていますか？',
  '外出・人と会う': '最近、外出したり、人と会ったりできていますか？',
}
const LV_ORDER = ['good', 'same', 'little', 'hard']
/** 項目ごとの、段階の言葉（知らない項目は、共通の言葉） */
export const levelLabel = (item: string, k: Level | ''): string => {
  const i = LV_ORDER.indexOf(k)
  if (i < 0) return ''
  return FEEL_LABELS[item]?.[i] ?? LEVELS[i].label
}

export const EFFECTS = [
  { k: 'worked', label: '効いた' },
  { k: 'same', label: 'あまり変わらない' },
  { k: 'bad', label: '合わなかった' },
] as const

export const STOCKS = [
  { k: 'enough', label: '十分ある' },
  { k: 'low', label: '少ない' },
  { k: 'none', label: 'もうない' },
] as const

export const ASKS = [
  '原因（診断）は何ですか？',
  '検査は必要ですか？',
  'お薬を続けてよいか、変えられるか',
  '副作用で気をつけることは？',
  '日常生活で気をつけることは？',
  '仕事・学校を休む必要はありますか？',
  '治るまでの目安はどのくらい？',
  '別の診療科・専門の病院に行くべき？',
  '次の受診はいつ頃？',
  'お薬の処方（残りが少ない）をお願いしたい',
]

/** 「その他」を選んで内容を書いたときは、「その他（内容）」と表示する */
export const mainLabel = (d: Draft) => (d.main === 'その他' && d.mainOther?.trim() ? `その他（${d.mainOther.trim()}）` : d.main)
export const alsoList = (d: Draft) => d.also.map((a) => (a === 'その他' && d.alsoOther?.trim() ? `その他（${d.alsoOther.trim()}）` : a))

export const levelOf = (k: Level | '') => LEVELS.find((l) => l.k === k)
export const effectLabel = (k: string) => EFFECTS.find((e) => e.k === k)?.label ?? ''
export const stockLabel = (k: string) => STOCKS.find((e) => e.k === k)?.label ?? ''

const iso = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
export const today = () => iso(new Date())

export const emptyDraft = (): Draft => ({
  date: today(),
  place: '',
  main: '',
  mainOther: '',
  also: [],
  alsoOther: '',
  topicMemo: '',
  since: '',
  freq: '',
  triggers: [],
  whenMemo: '',
  feel: {},
  feelMemo: '',
  medLogs: {},
  tried: '',
  asks: [],
  askMemo: '',
  step: 0,
})

// ---- 見本の受診ケース（すべて架空。一般的な内容だけ） ----
const m = (id: string, name: string, how: string): Med => ({ id, name, how })

const naika: Draft = {
  ...emptyDraft(),
  place: '内科',
  main: '頭痛・頭の重さ',
  also: ['だるさ・疲れやすさ', '眠れない・眠りが浅い'],
  topicMemo: 'ここ2週間、夕方になると頭が重くなり、仕事の後半に集中できません。',
  since: '2〜3週間前から',
  freq: '週に数回',
  triggers: ['仕事・家事のあと', '夜・寝る前'],
  whenMemo: '忙しい週ほどひどい気がします。',
  feel: { 睡眠: 'little', 食事: 'same', 気分: 'same', 'だるさ・体力': 'hard', 仕事や家事: 'little', '外出・人と会う': 'same' },
  feelMemo: '体重は変わりません。熱はありません。',
  medLogs: {
    n1: { effect: 'same', stock: 'enough', note: '' },
    n2: { effect: 'worked', stock: 'low', note: '' },
    n3: { effect: 'worked', stock: 'low', note: '週に2回ほど飲んだ' },
  },
  tried: '早めに寝る、水分を多めにとる。市販の頭痛薬を週2回ほど飲みました。',
  asks: ['検査は必要ですか？', 'お薬を続けてよいか、変えられるか', '日常生活で気をつけることは？', '市販の頭痛薬と、いつものお薬を一緒に飲んでよいか'],
  askMemo: '',
}
const hifuka: Draft = {
  ...emptyDraft(),
  place: '皮膚科',
  main: 'かゆみ・湿疹',
  also: ['眠れない・眠りが浅い'],
  topicMemo: '腕と首まわりのかゆみ。夜にかゆくて目が覚めます。',
  since: '1週間ほど前から',
  freq: 'ずっと続いている',
  triggers: ['お風呂のあと', '夜・寝る前'],
  whenMemo: '汗をかいた日は特にかゆいです。',
  feel: { 睡眠: 'hard', 食事: 'good', 気分: 'little', 'だるさ・体力': 'same', 仕事や家事: 'same', '外出・人と会う': 'same' },
  feelMemo: '',
  medLogs: {
    h1: { effect: 'worked', stock: 'low', note: 'ぬるとかゆみが少し楽になる' },
    h2: { effect: 'same', stock: 'enough', note: '' },
  },
  tried: '入浴後に保湿をしました。かゆい所をかかないようにしています。',
  asks: ['原因（診断）は何ですか？', '日常生活で気をつけることは？', 'お薬の処方（残りが少ない）をお願いしたい'],
  askMemo: '洗剤を変えたことは関係ありますか？',
}
const seikei: Draft = {
  ...emptyDraft(),
  place: '整形外科',
  main: 'ずっと続く痛み',
  also: [],
  topicMemo: '腰の右側が、朝起きたときと、長く座ったあとに痛みます。',
  since: '1〜3か月前から',
  freq: 'ときどき',
  triggers: ['朝', '動いたとき'],
  whenMemo: '重い物を持った日の翌朝がひどいです。',
  feel: { 睡眠: 'same', 食事: 'good', 気分: 'same', 'だるさ・体力': 'same', 仕事や家事: 'little', '外出・人と会う': 'little' },
  feelMemo: '足のしびれはありません。',
  medLogs: {
    s1: { effect: 'worked', stock: 'enough', note: '' },
    s2: { effect: 'bad', stock: 'none', note: 'かぶれた' },
    s3: { effect: 'same', stock: 'enough', note: '' },
  },
  tried: '温めると少し楽になります。湿布はかぶれたので、やめました。',
  asks: ['検査は必要ですか？', '仕事・学校を休む必要はありますか？', '治るまでの目安はどのくらい？', '自宅でできる運動・リハビリはありますか？'],
  askMemo: '',
}

export const SAMPLES: SampleCase[] = [
  {
    id: 'naika',
    label: '内科：頭痛とだるさ',
    summary: '2〜3週間、夕方の頭痛とだるさが続く',
    draft: naika,
    meds: [m('n1', '血圧の薬', '朝食後 1錠'), m('n2', '胃薬', '朝・夕食後'), m('n3', '頭痛薬（市販）', '頭痛のとき 1錠')],
  },
  {
    id: 'hifuka',
    label: '皮膚科：かゆみ',
    summary: '夜にかゆくて眠れない。塗り薬が残り少ない',
    draft: hifuka,
    meds: [m('h1', '塗り薬（かゆみ止め）', '1日2回 かゆい所に'), m('h2', '飲み薬（抗アレルギー）', '夕食後 1錠')],
  },
  {
    id: 'seikei',
    label: '整形外科：腰の痛み',
    summary: '朝と座ったあとの腰痛。湿布でかぶれた',
    draft: seikei,
    meds: [m('s1', '痛み止め（飲み薬）', '痛いとき 1錠・1日3回まで'), m('s2', '湿布', '1日1回 痛い所に'), m('s3', '胃薬', '痛み止めと一緒に')],
  },
]

export const fmtDate = (s: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  return m ? `${m[1]}年${Number(m[2])}月${Number(m[3])}日` : s
}
