'use client';
import { useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HandwrittenNote } from '@/components/HandwrittenNote';
import { CapacityChart, capacityRun } from './dashboard/capacity';
import styles from './ProductVisuals.module.css';
export default function CapacityPreview() {
 const [step, setStep] = useState(16);
 const steps = capacityRun.steps.filter(s=>s.step<=step);
 const last=steps[steps.length-1];
 return <div className={styles.capacity}>
   <div className={styles.wireHeader}><span>Agent capacity</span><span>Captured feasibility run</span></div>
   <div className={styles.capacityReadout}><strong>{last.joined}<small> / {step}</small></strong><span>calls joined<br/><b>{last.pending ? `${last.pending} stayed pending` : 'Every call joined'}</b></span></div>
   <CapacityChart steps={steps} all={capacityRun.steps.map(s=>s.step)} ceiling={step===16?10:null}/>
   <HandwrittenNote className="mt-5">Compare the steps</HandwrittenNote>
   <div className={styles.stepControls} aria-label="Show captured capacity step"><span>Calls at once</span><ToggleGroup type="single" spacing={1} value={String(step)} onValueChange={value=>value && setStep(Number(value))} aria-label="Calls at once">{capacityRun.steps.map(s=><ToggleGroupItem key={s.step} value={String(s.step)}>{s.step}</ToggleGroupItem>)}</ToggleGroup></div>
   <p className={styles.capacityNote}>This run reached the tester’s limit, not a proven agent limit. Collected October 14, 2026.</p>
   <Accordion type="single" collapsible className="mt-2"><AccordionItem value="source"><AccordionTrigger>How this was measured</AccordionTrigger><AccordionContent><p>{capacityRun.source}</p><p className="mt-3">The worker logged: {capacityRun.workerLog}.</p></AccordionContent></AccordionItem></Accordion>
 </div>;
}
