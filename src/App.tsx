import { useEffect, useState } from 'react'
import * as Progress from '@radix-ui/react-progress'
import * as Select from '@radix-ui/react-select'
import * as Switch from '@radix-ui/react-switch'
import * as Tabs from '@radix-ui/react-tabs'
import * as Tooltip from '@radix-ui/react-tooltip'
import {
  Activity, AlertTriangle, ArrowDown, ArrowUp, BarChart3, Bot,
  Check, ChevronDown, CircleCheck, CircleX, Clock3, Coins,
  Filter, FlaskConical, Gauge, GitCompareArrows, Layers3, Play,
  Radar, RefreshCw, Search, Wrench,
} from 'lucide-react'
import './App.css'

const variants = [
  { id: 'baseline', name: 'Baseline', model: 'GPT-4.1 mini', quality: 82.4, latency: 1240, cost: .0142, pass: 88, color: '#2447d8' },
  { id: 'candidate', name: 'Candidate', model: 'Claude Sonnet 4', quality: 89.7, latency: 980, cost: .0186, pass: 94, color: '#dd5b38' },
  { id: 'control', name: 'Control', model: 'Gemini 2.5 Flash', quality: 78.9, latency: 720, cost: .0084, pass: 83, color: '#278064' },
]

const traces = [
  { id: 'tr_8f42a1', input: 'Summarize the Q3 renewal risks', status: 'passed', model: 'Candidate', latency: 842, cost: '$0.016', score: .94, time: '12:42:18' },
  { id: 'tr_8f429e', input: 'Draft a response to the refund request', status: 'failed', model: 'Baseline', latency: 1860, cost: '$0.021', score: .48, time: '12:41:52' },
  { id: 'tr_8f4297', input: 'Compare enterprise pricing tiers', status: 'passed', model: 'Candidate', latency: 1104, cost: '$0.019', score: .91, time: '12:41:31' },
  { id: 'tr_8f428b', input: 'Find unresolved security questions', status: 'warning', model: 'Control', latency: 694, cost: '$0.007', score: .72, time: '12:40:58' },
  { id: 'tr_8f427c', input: 'Generate an onboarding checklist', status: 'passed', model: 'Baseline', latency: 1328, cost: '$0.015', score: .86, time: '12:40:16' },
]

const evaluators = [
  { name: 'Groundedness', score: 94, delta: 6.2 },
  { name: 'Answer relevance', score: 91, delta: 3.8 },
  { name: 'Instruction following', score: 88, delta: 1.4 },
  { name: 'Style adherence', score: 85, delta: -2.1 },
]

const spans = [
  { label: 'request', start: 0, width: 100, duration: '842 ms', type: 'root' },
  { label: 'retrieve_context', start: 4, width: 31, duration: '261 ms', type: 'retrieval' },
  { label: 'rerank_documents', start: 36, width: 15, duration: '126 ms', type: 'tool' },
  { label: 'chat_completion', start: 52, width: 44, duration: '371 ms', type: 'model' },
]

const chartPoints = [64, 68, 67, 72, 75, 71, 79, 82, 80, 84, 86, 90, 88, 92]

function App() {
  const [dataset, setDataset] = useState('support-golden')
  const [selectedTrace, setSelectedTrace] = useState(traces[0])
  const [statusFilter, setStatusFilter] = useState('all')
  const [live, setLive] = useState(true)
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(100)
  const [lastRun, setLastRun] = useState('4 min ago')

  const filteredTraces = statusFilter === 'all' ? traces : traces.filter((trace) => trace.status === statusFilter)

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 100) {
          window.clearInterval(timer)
          setRunning(false)
          setLastRun('just now')
          return 100
        }
        return Math.min(value + 8, 100)
      })
    }, 180)
    return () => window.clearInterval(timer)
  }, [running])

  const runEvaluation = () => {
    setProgress(0)
    setRunning(true)
  }

  const selectedIndex = traces.findIndex((trace) => trace.id === selectedTrace.id)
  const linePath = chartPoints.map((point, index) => `${index === 0 ? 'M' : 'L'} ${index * (100 / (chartPoints.length - 1))} ${100 - point}`).join(' ')

  return (
    <Tooltip.Provider delayDuration={250}>
      <div className="app-shell">
        <aside className="sidebar">
          <a className="brand" href="#top"><span><Radar size={19} /></span><strong>LLM Dashboard</strong></a>
          <nav>
            <a className="active" href="#overview"><BarChart3 size={17} /><span>Overview</span></a>
            <a href="#experiments"><FlaskConical size={17} /><span>Experiments</span><small>3</small></a>
            <a href="#traces"><Activity size={17} /><span>Traces</span></a>
            <a href="#evaluators"><Gauge size={17} /><span>Evaluators</span></a>
          </nav>
          <div className="environment"><span>ENVIRONMENT</span><button><i /> Production <ChevronDown size={13} /></button></div>
          <div className="sidebar-foot"><div>N</div><span>Name<br /><small>Personal workspace</small></span></div>
        </aside>

        <div className="main-shell">
          <header className="topbar">
            <div><p>LLM EVALUATION & OBSERVABILITY</p></div>
            <div className="top-actions"><label className="live-toggle"><Switch.Root checked={live} onCheckedChange={setLive} className="switch"><Switch.Thumb className="switch-thumb" /></Switch.Root><span>{live ? 'Live stream' : 'Paused'}</span></label><button className="icon-button" aria-label="Refresh"><RefreshCw size={16} /></button><button className="run-button" onClick={runEvaluation} disabled={running}><Play size={15} fill="currentColor" />{running ? 'Running...' : 'Run evaluation'}</button></div>
          </header>

          <main id="top">
            <section className="control-row">
              <div><span>DATASET</span><Select.Root value={dataset} onValueChange={setDataset}><Select.Trigger className="select-trigger"><Select.Value /><Select.Icon><ChevronDown size={14} /></Select.Icon></Select.Trigger><Select.Portal><Select.Content className="select-content" position="popper"><Select.Viewport><Select.Item value="support-golden" className="select-item"><Select.ItemText>Support Golden Set · 250 rows</Select.ItemText><Select.ItemIndicator><Check size={13} /></Select.ItemIndicator></Select.Item><Select.Item value="sales-eval" className="select-item"><Select.ItemText>Sales QA · 180 rows</Select.ItemText><Select.ItemIndicator><Check size={13} /></Select.ItemIndicator></Select.Item><Select.Item value="safety" className="select-item"><Select.ItemText>Safety Suite · 420 rows</Select.ItemText><Select.ItemIndicator><Check size={13} /></Select.ItemIndicator></Select.Item></Select.Viewport></Select.Content></Select.Portal></Select.Root></div>
              <div><span>TIME RANGE</span><button className="plain-control">Last 24 hours <ChevronDown size={14} /></button></div>
              <div className="run-state"><span>LAST EVALUATION</span><strong><i className={running ? 'running' : ''} />{running ? `${progress}% complete` : lastRun}</strong></div>
              <Progress.Root className="run-progress" value={progress}><Progress.Indicator style={{ transform:`translateX(-${100 - progress}%)` }} /></Progress.Root>
            </section>

            <section className="metrics" id="overview">
              <article><div><span>QUALITY SCORE</span><Tooltip.Root><Tooltip.Trigger asChild><CircleCheck size={15} /></Tooltip.Trigger><Tooltip.Portal><Tooltip.Content className="tooltip">Aggregate evaluator score</Tooltip.Content></Tooltip.Portal></Tooltip.Root></div><strong>89.7</strong><p className="positive"><ArrowUp size={12} /> 7.3% vs baseline</p><div className="micro-bars">{[45,58,52,68,71,66,79,84].map((height, index) => <i key={index} style={{ height:`${height}%` }} />)}</div></article>
              <article><div><span>P95 LATENCY</span><Clock3 size={15} /></div><strong>1.28<small>s</small></strong><p className="positive"><ArrowDown size={12} /> 14.2% faster</p><svg className="sparkline" viewBox="0 0 100 30"><path d="M0 8 L15 12 L28 9 L42 18 L55 15 L70 23 L84 19 L100 26" /></svg></article>
              <article><div><span>COST / TRACE</span><Coins size={15} /></div><strong>$0.018</strong><p className="negative"><ArrowUp size={12} /> $0.004 vs baseline</p><div className="cost-split"><i style={{ width:'68%' }} /><i style={{ width:'22%' }} /><i style={{ width:'10%' }} /></div></article>
              <article><div><span>ERROR RATE</span><AlertTriangle size={15} /></div><strong>1.6<small>%</small></strong><p className="positive"><ArrowDown size={12} /> 0.8 pts</p><div className="error-dots">{Array.from({ length:20 }, (_, index) => <i className={index === 17 ? 'bad' : ''} key={index} />)}</div></article>
            </section>

            <section className="analysis-grid" id="experiments">
              <div className="quality-chart">
                <div className="section-head"><div><span>QUALITY TREND</span><h2>Evaluator score</h2></div><div className="legend">{variants.map((variant) => <span key={variant.id}><i style={{ background:variant.color }} />{variant.name}</span>)}</div></div>
                <div className="chart-wrap"><div className="y-labels"><span>100</span><span>75</span><span>50</span><span>25</span></div><svg viewBox="0 0 100 100" preserveAspectRatio="none"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2447d8" stopOpacity=".18" /><stop offset="1" stopColor="#2447d8" stopOpacity="0" /></linearGradient></defs><path className="area" d={`${linePath} L100 100 L0 100 Z`} /><path className="line" d={linePath} /></svg></div>
                <div className="x-labels"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>Now</span></div>
              </div>
              <div className="evaluator-panel" id="evaluators"><div className="section-head"><div><span>EVALUATORS</span><h2>Score breakdown</h2></div><button>Configure</button></div><div className="evaluator-list">{evaluators.map((evaluator) => <div key={evaluator.name}><div><strong>{evaluator.name}</strong><span className={evaluator.delta > 0 ? 'up' : 'down'}>{evaluator.delta > 0 ? '+' : ''}{evaluator.delta}</span></div><Progress.Root className="score-progress" value={evaluator.score}><Progress.Indicator style={{ transform:`translateX(-${100 - evaluator.score}%)` }} /></Progress.Root><b>{evaluator.score}</b></div>)}</div></div>
            </section>

            <section className="comparison"><div className="section-head"><div><span>EXPERIMENT COMPARISON</span><h2>Model variants</h2></div><button><GitCompareArrows size={14} /> Compare selected</button></div><div className="variant-table"><div className="table-header"><span>VARIANT</span><span>QUALITY</span><span>PASS RATE</span><span>LATENCY</span><span>COST</span><span>STATUS</span></div>{variants.map((variant, index) => <div className="variant-row" key={variant.id}><div><i style={{ background:variant.color }} /><strong>{variant.name}</strong><small>{variant.model}</small></div><span>{variant.quality}</span><span>{variant.pass}%</span><span>{variant.latency} ms</span><span>${variant.cost}</span><b>{index === 1 ? 'Best overall' : index === 2 ? 'Lowest cost' : 'Reference'}</b></div>)}</div></section>

            <section className="traces-section" id="traces">
              <div className="trace-list-panel"><div className="section-head"><div><span>RECENT TRACES</span><h2>Production requests</h2></div><div className="trace-actions"><button><Search size={14} /></button><Select.Root value={statusFilter} onValueChange={setStatusFilter}><Select.Trigger className="filter-trigger"><Filter size={13} /><Select.Value /><ChevronDown size={12} /></Select.Trigger><Select.Portal><Select.Content className="select-content" position="popper"><Select.Viewport>{['all','passed','failed','warning'].map((status) => <Select.Item className="select-item" value={status} key={status}><Select.ItemText>{status[0].toUpperCase()+status.slice(1)}</Select.ItemText></Select.Item>)}</Select.Viewport></Select.Content></Select.Portal></Select.Root></div></div><div className="trace-table"><div className="trace-header"><span>TRACE</span><span>MODEL</span><span>LATENCY</span><span>SCORE</span></div>{filteredTraces.map((trace) => <button className={selectedTrace.id === trace.id ? 'selected' : ''} onClick={() => setSelectedTrace(trace)} key={trace.id}><div><i className={trace.status} /> <strong>{trace.input}</strong><small>{trace.id} · {trace.time}</small></div><span>{trace.model}</span><span>{trace.latency} ms</span><b>{trace.score}</b></button>)}</div></div>

              <div className="trace-detail">
                <div className="detail-head"><div><span>TRACE DETAIL</span><h2>{selectedTrace.id}</h2></div><span className={`status ${selectedTrace.status}`}>{selectedTrace.status}</span></div>
                <div className="detail-meta"><div><span>MODEL</span><strong>{selectedTrace.model}</strong></div><div><span>DURATION</span><strong>{selectedTrace.latency} ms</strong></div><div><span>COST</span><strong>{selectedTrace.cost}</strong></div><div><span>SCORE</span><strong>{selectedTrace.score}</strong></div></div>
                <Tabs.Root defaultValue="timeline" className="detail-tabs"><Tabs.List><Tabs.Trigger value="timeline">Timeline</Tabs.Trigger><Tabs.Trigger value="input">Input / output</Tabs.Trigger><Tabs.Trigger value="scores">Scores</Tabs.Trigger></Tabs.List><Tabs.Content value="timeline" className="timeline">
                  <div className="timeline-scale"><span>0</span><span>250ms</span><span>500ms</span><span>750ms</span></div>{spans.map((span) => <div className="span-row" key={span.label}><div><i className={span.type}>{span.type === 'model' ? <Bot size={12} /> : span.type === 'tool' ? <Wrench size={12} /> : <Layers3 size={12} />}</i><strong>{span.label}</strong></div><div className="span-track"><i className={span.type} style={{ left:`${span.start}%`, width:`${span.width}%` }} /></div><span>{span.duration}</span></div>)}
                  {selectedIndex === 1 && <div className="failure-callout"><CircleX size={16} /><div><strong>Groundedness threshold failed</strong><span>Response contains one unsupported claim about refund timing.</span></div></div>}
                </Tabs.Content><Tabs.Content value="input" className="io-panel"><div><span>INPUT</span><p>{selectedTrace.input}</p></div><div><span>OUTPUT</span><p>Based on the available account context, the primary risks are contract timing, unresolved implementation requirements, and stakeholder alignment.</p></div></Tabs.Content><Tabs.Content value="scores" className="score-details">{evaluators.map((item) => <div key={item.name}><span>{item.name}</span><strong>{(item.score / 100).toFixed(2)}</strong></div>)}</Tabs.Content></Tabs.Root>
              </div>
            </section>
          </main>
        </div>
      </div>
    </Tooltip.Provider>
  )
}

export default App