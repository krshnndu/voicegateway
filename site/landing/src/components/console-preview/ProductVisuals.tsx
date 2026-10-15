'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WheelPicker, WheelPickerWrapper } from '@/components/wheel-picker';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from '@/components/ui/card';
import { HandwrittenNote } from '@/components/HandwrittenNote';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import dynamic from 'next/dynamic';
import { ArrowRight, Phone, Robot, Timer, WarningCircle, Pause, Play } from '@phosphor-icons/react';
import { AnswerGauge, TurnStrip, type TurnDot } from './dashboard/visuals';
import { TooltipProvider } from './dashboard/tooltip';
import { capturedTurns, medianAnswer, overBudgetCount, BUDGET_MS, routeNodes } from './data';
import type { WireNode, WireLink } from './dashboard/live-wire';
import styles from './ProductVisuals.module.css';

const LiveWire = dynamic(() => import('./dashboard/live-wire').then(m => m.LiveWire), { ssr: false, loading: () => <div className={styles.flowLoading}>Loading call path…</div> });
const Capacity = dynamic(() => import('./CapacityPreview'), { ssr: false, loading: () => <div className={styles.flowLoading}>Loading capacity chart…</div> });
const dots: TurnDot[] = capturedTurns.map(t => ({ms:t.responseMs, room:String(t.session), turn:t.turn, agent:'Captured session'}));
const seconds = (ms: number) => `${(ms / 1000).toFixed(2)} s`;

const sessions = [...new Set(dots.map(d => d.room))];
const sessionOptions = [{ value: 'all', label: 'All', textValue: 'All sessions' }, ...sessions.map(value => ({ value, label: value.padStart(2, '0'), textValue: `Session ${value}` }))];

export function AnswerPreview() {
  const [picked, setPicked] = useState<TurnDot | null>(null);
  const turn = picked && capturedTurns.find(t => String(t.session) === picked.room && t.turn === picked.turn);
  const session = picked?.room ?? 'all';
  const turnOptions = picked ? dots.filter(d => d.room === session).map(d => ({ value: String(d.turn), label: String(d.turn).padStart(2, '0'), textValue: `Turn ${d.turn}` })) : [{ value: 'median', label: 'Median', textValue: 'Median answer time' }];
  return <TooltipProvider><Card className={styles.answer}>
    <CardHeader className={styles.answerHeader}>
      <CardTitle>Every reply, in one view.</CardTitle>
      <CardDescription>Answer time across {capturedTurns.length} captured turns</CardDescription>
      <CardAction><HandwrittenNote>Try a turn</HandwrittenNote></CardAction>
    </CardHeader>
    <CardContent className={styles.answerContent}>
      <div className={styles.gauge}>
        <AnswerGauge p50={picked?.ms ?? medianAnswer} budget={BUDGET_MS} />
        <strong style={{color:(picked?.ms ?? medianAnswer)>BUDGET_MS?'var(--destructive)':'var(--foreground)'}}>{seconds(picked?.ms ?? medianAnswer)}</strong>
        <span>{picked ? `Session ${picked.room} · turn ${picked.turn}` : 'median answer time'}</span>
      </div>
      <div className={styles.distribution}>
        <div className={styles.chartHeading}><span>Reply distribution</span><span>Budget 1.5 s</span></div>
        <TurnStrip dots={dots} budget={BUDGET_MS} onPick={setPicked} />
        <div className={styles.turnDetail} aria-live="polite">
          {turn ? <><span>{turn.derived ? 'Derived answer time' : 'Reported answer time'}</span><span>First token <b>{turn.firstTokenMs === null ? 'not reported' : `${turn.firstTokenMs} ms`}</b></span><span>First audio <b>{turn.firstAudioMs === null ? 'not reported' : `${turn.firstAudioMs} ms`}</b></span></> : <><span><b>{overBudgetCount} replies</b> over the 1.5 s budget</span><span>Choose a dot or scroll to a turn.</span></>}
        </div>
      </div>
      <div className={styles.turnPicker} role="group" aria-label="Inspect a captured reply">
        <div className={styles.wheelLabels}><span>Session</span><span>Turn</span></div>
        <WheelPickerWrapper>
          <WheelPicker aria-label="Session" options={sessionOptions} value={session} onValueChange={value => setPicked(dots.find(d => d.room === value) ?? null)} visibleCount={12} optionItemHeight={44} />
          <WheelPicker aria-label="Turn" options={turnOptions} value={picked ? String(picked.turn) : 'median'} onValueChange={value => setPicked(dots.find(d => d.room === session && String(d.turn) === value) ?? null)} visibleCount={12} optionItemHeight={44} />
        </WheelPickerWrapper>
        <p className={styles.wheelHint}>Scroll or drag to explore</p>
      </div>
    </CardContent>
    <CardFooter className={styles.answerFooter}><span>Captured LiveKit sessions</span><Button variant="ghost" size="sm" onClick={() => setPicked(null)} disabled={!picked}>Reset view</Button></CardFooter>
  </Card></TooltipProvider>;
}

// The vg-capture branch of Overview's Live wire, using the same captured aggregates.
const nodes: WireNode[] = [
  {id:'callers',kind:'callers',title:'Callers',sub:'3 captured calls',y:0},
  {id:'phone',kind:'phone',title:'Phone bridge',sub:'1 phone call',y:-110,issues:2,tip:'Two configured phone trunks carry unencrypted audio.'},
  {id:'media',kind:'media',title:'Media server',sub:'15 rooms watched',y:0,tip:'Project-wide room count; this route shows vg-capture only.'},
  {id:'agent',kind:'agent',title:'vg-capture',sub:'self-hosted',y:0,issues:14},
  {id:'stt',kind:'provider',title:'Deepgram',sub:'speech to text',provider:'deepgram',y:-48},
  {id:'model',kind:'provider',title:'OpenAI',sub:'LLM, voice',provider:'openai',y:48},
];
const links: WireLink[] = [
  {id:'phone-in',from:'callers',to:'phone',calls:1,ms:4980,msLabel:'setup 4.98 s',issues:false,live:false,tip:routeNodes[0].detail},
  {id:'phone-media',from:'phone',to:'media',calls:1,ms:null,issues:true,live:false,tip:'Audio transit time is not reported.'},
  {id:'web-media',from:'callers',to:'media',calls:2,ms:null,issues:false,live:false,tip:'Caller network latency is not reported.'},
  {id:'media-agent',from:'media',to:'agent',calls:3,ms:2304,issues:true,live:false,tip:routeNodes[2].detail},
  {id:'agent-stt',from:'agent',to:'stt',calls:3,ms:230,msLabel:'transcript 230 ms',issues:true,live:false,tip:routeNodes[3].detail},
  {id:'agent-model',from:'agent',to:'model',calls:3,ms:758,msLabel:'first token 758 ms · first audio 850 ms',issues:false,live:false,tip:routeNodes[4].detail},
];
export function CallPathPreview() {
  const [selected, setSelected] = useState('agent');
  const [paused, setPaused] = useState(false);
  const detail = routeNodes.find(n => n.id === selected)!;
  return <TooltipProvider><div className={styles.wire}>
    <div className={styles.wireHeader}><span>Call path</span><div className={styles.wireTools}><span>Captured example · vg-capture</span><Button variant="ghost" size="icon" aria-label={paused ? 'Play call path animation' : 'Pause call path animation'} onClick={() => setPaused(value => !value)}>{paused ? <Play /> : <Pause />}</Button></div></div>
    <div className={styles.flowScroll} role="region" aria-label="Captured call path, scroll horizontally on small screens" tabIndex={0}><LiveWire nodes={nodes} links={links} paused={paused}/></div>
    <p className={styles.scrollHint}>Scroll across to follow the call <ArrowRight size={14}/></p>
    <div className={styles.routeControls}><ToggleGroup type="single" spacing={1} value={selected} onValueChange={value => value && setSelected(value)} aria-label="Inspect a call layer" className="max-w-full flex-wrap justify-start">{routeNodes.map(n => <ToggleGroupItem key={n.id} value={n.id}>{n.title}</ToggleGroupItem>)}</ToggleGroup></div>
    <div className={styles.routeDetail} aria-live="polite"><div><strong>{detail.metric}</strong><span>{detail.metricLabel}</span></div><p>{detail.detail}</p></div>
  </div></TooltipProvider>;
}
export function CapacityPreview() { return <Capacity/>; }
export function OutcomeIcons() {
  return <div className={styles.outcomes}>
    <span><Timer size={19}/> Find slow replies</span><span><WarningCircle size={19}/> Trace failed calls</span><span><Robot size={19}/> Understand capacity</span><span><Phone size={19}/> Follow the whole call</span>
  </div>;
}
