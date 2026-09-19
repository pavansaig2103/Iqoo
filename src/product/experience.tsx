import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, CheckCircle2, CircleHelp, ClipboardCheck, Clock3, FileCheck2, FileText, HeartPulse, Home, Package, Pill, RefreshCw, Sparkles, Stethoscope, Users } from 'lucide-react';
import { useApp } from './context';
import { Badge, PersonSwitch, SmallIcon } from './shared';
import { eventStatus, inboxPersonForNavigation, people, supplyState, timeNow, uid, type EventStatus, type PersonId } from './model';

const stageDetails = [
  { label: 'Prescription', caption: 'Doctor intent', Icon: FileText },
  { label: 'Home supply', caption: 'What is available', Icon: Home },
  { label: 'Daily care', caption: 'What happened', Icon: HeartPulse },
  { label: 'Changes', caption: 'What needs review', Icon: RefreshCw },
  { label: 'Doctor', caption: 'A useful history', Icon: Stethoscope },
] as const;

function statusLabel(status: EventStatus) {
  if (status === 'NO_REPORT') return 'Not reported';
  if (status === 'NOT_AVAILABLE') return 'Not available';
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function ProductCarePage() {
  const { state, person, navigate, setDialog, openEvent, openMedication, openPackage } = useApp();
  const records = state.records.filter((item) => item.personId === person && !item.archived);
  const events = state.events.filter((item) => item.personId === person);
  const openAttention = state.inbox.filter((item) => item.personId === person && ['NEEDS REVIEW', 'UNPROCESSED'].includes(item.status));
  const unavailable = records.filter((item) => supplyState(state, item).status === 'NOT AVAILABLE');
  const low = records.filter((item) => supplyState(state, item).status === 'RUNNING LOW');
  const reported = events.filter((item) => eventStatus(item) !== 'NO_REPORT').length;
  const health = unavailable.length ? 'Attention required' : openAttention.length > 2 ? 'Needs review' : 'Mostly on track';
  const assigned = state.assignments.filter((item) => item.day === 'Today' && item.personId === person);

  function openStage(index: number) {
    if (index === 0) setDialog('prescription');
    if (index === 1) navigate('cabinet', person);
    if (index === 2) navigate('people', person);
    if (index === 3) navigate('inbox', person);
    if (index === 4) navigate('visit', person);
  }

  return <>
    <section className="care-welcome">
      <div>
        <p className="overline">Living medication record</p>
        <h1>Good evening, Pavan.</h1>
        <p>{people[person].label}'s care is <strong>{health.toLowerCase()}</strong>. Prescription intent and home reality stay connected here.</p>
      </div>
      <PersonSwitch />
    </section>

    <motion.section className="care-hero" key={person} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="care-identity"><span className={`person-avatar large ${person}`}>{people[person].initials}</span><div><small>{people[person].name}</small><h2>{people[person].label}'s care space</h2><Badge tone={unavailable.length ? 'danger' : 'good'}>{health}</Badge></div></div>
      <div className="care-metrics"><div><b>{records.length}</b><span>Active medicines</span></div><div><b>{low.length + unavailable.length}</b><span>Supply issues</span></div><div><b>{openAttention.length}</b><span>Need attention</span></div><div><b>{events.length ? Math.round((reported / events.length) * 100) : 0}%</b><span>Reported today</span></div></div>
      <button className="button primary care-hero-action" onClick={() => setDialog('add')}><Sparkles size={17} /> Care update</button>
    </motion.section>

    <section className="journey-section">
      <div className="section-heading"><div><p className="overline">Connected state</p><h2>One medication story, end to end</h2></div><p>Every confirmed update moves through the same family record.</p></div>
      <div className="medication-journey">{stageDetails.map(({ label, caption, Icon }, index) => <button key={label} onClick={() => openStage(index)}><span><Icon size={19} /></span><strong>{label}</strong><small>{caption}</small>{index < stageDetails.length - 1 && <i><ArrowRight size={16} /></i>}</button>)}</div>
    </section>

    <div className="care-layout">
      <section className="care-primary">
        <div className="section-heading"><div><p className="overline">Today</p><h2>Care events</h2></div><button className="action-link" onClick={() => navigate('care')}>Care coverage <ArrowRight size={15} /></button></div>
        <div className="care-event-list">{events.map((item) => { const status = eventStatus(item); const assignment = assigned.find((entry) => entry.period === item.period); return <button key={item.id} onClick={() => openEvent(item.id)}><time>{item.time}</time><span className={`event-marker ${status.toLowerCase()}`}>{status === 'TAKEN' ? <CheckCircle2 /> : status === 'NO_REPORT' ? <CircleHelp /> : <AlertTriangle />}</span><span><small>{item.period} · {assignment?.caregiver ? `Assigned to ${assignment.caregiver}` : 'No caregiver assigned'}</small><strong>{state.records.find((record) => record.id === item.recordId)?.name}</strong><em>{statusLabel(status)}{status === 'NO_REPORT' ? ' does not mean missed' : ''}</em></span><ArrowRight size={17} /></button>; })}</div>
      </section>

      <section className="attention-center">
        <div className="section-heading"><div><p className="overline">Attention</p><h2>{openAttention.length} things need review</h2></div><button className="action-link" onClick={() => navigate('inbox')}>View all <ArrowRight size={15} /></button></div>
        <div className="attention-compact">{openAttention.slice(0, 4).map((item) => <button key={item.id} onClick={() => item.target === 'event' && item.targetId ? openEvent(item.targetId) : item.target === 'cabinet' && item.targetId ? openPackage(item.targetId) : navigate(item.target === 'plan' ? 'people' : 'inbox', inboxPersonForNavigation(item))}><SmallIcon icon={item.kind === 'NO REPORT' ? CircleHelp : AlertTriangle} tone={item.kind === 'NO REPORT' ? 'amber' : 'coral'} /><span><strong>{item.title}</strong><small>{item.kind} · {item.source}</small></span><ArrowRight size={16} /></button>)}</div>
      </section>
    </div>

    <section className="medicine-state-strip">
      <div className="section-heading"><div><p className="overline">Medication state</p><h2>Current plan and home reality</h2></div><button className="action-link" onClick={() => navigate('cabinet', person)}>Open medicines <ArrowRight size={15} /></button></div>
      <div className="state-medicine-grid">{records.map((record) => { const supply = supplyState(state, record); return <button key={record.id} onClick={() => openMedication(record.id)}><span className="medicine-monogram">{record.name.slice(0, 2).toUpperCase()}</span><span><strong>{record.name} {record.strength}</strong><small>{record.routine}</small></span><span><Badge tone={supply.status === 'AVAILABLE' ? 'good' : supply.status === 'RUNNING LOW' ? 'warn' : 'danger'}>{supply.status.replace('_', ' ')}</Badge><small>{supply.label}</small></span><ArrowRight size={17} /></button>; })}</div>
    </section>

    <p className="product-principle"><strong>MediBridge keeps the medication story connected from prescription to everyday care.</strong><span>AI organizes care. People confirm it.</span></p>
  </>;
}

export function ProductActivityPage() {
  const { state, person, dispatch, openEvent, openMedication } = useApp();
  const [decision, setDecision] = useState<'open' | 'kept' | 'question'>('open');
  const events = state.events.filter((item) => item.personId === person);
  const history = state.history.filter((item) => item.personId === person);
  function decide(value: 'kept' | 'question') {
    setDecision(value);
    dispatch({ type: 'ADD_INBOX', item: { id: uid('inbox'), kind: 'MEDICATION CHANGE', title: value === 'question' ? 'Question added for doctor' : 'Existing plan retained', detail: value === 'question' ? 'Which medicine, strength, and routine should replace the current Atorvastatin record?' : 'The ambiguous caregiver report did not alter the confirmed plan.', source: 'Human review', personId: person, at: timeNow(), status: value === 'question' ? 'NEEDS REVIEW' : 'RESOLVED', target: 'visit' } });
  }
  return <>
    <div className="page-title activity-title"><div><p className="overline">Activity and changes</p><h1>A traceable medication history</h1><p>Reports, uncertainty, and family decisions stay visible without rewriting what happened.</p></div><PersonSwitch /></div>
    {person === 'dad' && <section className="change-review">
      <div className="change-review-head"><SmallIcon icon={RefreshCw} tone="amber" /><div><p className="overline">Possible medication change</p><h2>Specific replacement information was not provided</h2></div><Badge tone={decision === 'open' ? 'warn' : 'good'}>{decision === 'open' ? 'Needs review' : 'Reviewed'}</Badge></div>
      <div className="change-compare"><div><small>Existing confirmed plan</small><strong>Atorvastatin 10 mg</strong><span>Previously recorded at night</span></div><ArrowRight /><div><small>New information</small><strong>“Doctor changed Dad's medicine.”</strong><span>Medicine, strength, and timing are uncertain.</span></div></div>
      <p className="safety-note"><AlertTriangle size={18} /><span><strong>MediBridge has not changed the plan.</strong> Verify the specific instruction with the prescription or healthcare professional.</span></p>
      {decision === 'open' ? <div className="button-row"><button className="button primary" onClick={() => openMedication('ato-dad')}>Verify and update</button><button className="button ghost" onClick={() => decide('kept')}>Keep existing plan</button><button className="button subtle" onClick={() => decide('question')}>Add question for doctor</button></div> : <p className="decision-confirmed"><CheckCircle2 size={18} /> Decision recorded. The original report remains in history.</p>}
    </section>}
    <div className="activity-columns"><section><div className="section-heading"><div><p className="overline">State timeline</p><h2>Medication history</h2></div></div><div className="state-timeline">{history.map((item) => <button key={item.id} onClick={() => openMedication(item.recordId)}><span className={`timeline-symbol ${item.type.toLowerCase()}`}>{item.type === 'PRESCRIPTION' ? <FileCheck2 /> : item.type === 'CARE' ? <HeartPulse /> : item.type === 'ATTENTION' ? <AlertTriangle /> : <Package />}</span><span><small>{item.at} · {item.source}</small><strong>{item.title}</strong><p>{item.detail}</p></span></button>)}</div></section>
      <section><div className="section-heading"><div><p className="overline">Today</p><h2>Care reports</h2></div></div><div className="activity-event-list">{events.map((item) => <button key={item.id} onClick={() => openEvent(item.id)}><Clock3 size={17} /><span><strong>{state.records.find((record) => record.id === item.recordId)?.name}</strong><small>{item.period} · {item.time}</small></span><Badge tone={eventStatus(item) === 'TAKEN' ? 'good' : eventStatus(item) === 'NO_REPORT' ? 'warn' : 'danger'}>{statusLabel(eventStatus(item))}</Badge></button>)}</div></section></div>
  </>;
}

export function ProductDoctorPage() {
  const { state, person, navigate } = useApp();
  const [phase, setPhase] = useState<'idle' | 'generating' | 'ready'>('idle');
  const records = state.records.filter((item) => item.personId === person && item.confirmed && !item.archived);
  const events = state.events.filter((item) => item.personId === person);
  const unresolved = state.inbox.filter((item) => item.personId === person && ['NEEDS REVIEW', 'UNPROCESSED'].includes(item.status));
  const supplyIssues = records.filter((item) => supplyState(state, item).status !== 'AVAILABLE');
  const uncertain = events.filter((item) => ['UNSURE', 'NO_REPORT', 'CONFLICT'].includes(eventStatus(item)));
  const recent = state.history.filter((item) => item.personId === person).slice(0, 5);
  function generate() {
    setPhase('generating');
    window.setTimeout(() => setPhase('ready'), 900);
  }
  return <div className="doctor-bridge">
    <div className="doctor-heading"><div><p className="overline">Prepare for doctor visit</p><h1>{people[person].label}'s medication summary</h1><p>A concise bridge between the confirmed plan and what the family observed at home.</p></div><div><PersonSwitch /><button className="button primary" disabled={phase === 'generating'} onClick={generate}>{phase === 'generating' ? <><span className="button-spinner" /> Organizing summary</> : <><Sparkles size={17} /> Generate summary</>}</button></div></div>
    <div className="doctor-stats"><div><b>{records.length}</b><span>Active medicines</span></div><div><b>{supplyIssues.length}</b><span>Supply issues</span></div><div><b>{recent.filter((item) => item.type === 'CHANGE' || item.type === 'ATTENTION').length}</b><span>Recent changes</span></div><div><b>{uncertain.length}</b><span>Uncertain events</span></div></div>
    {phase === 'ready' && <motion.p className="summary-ready" initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }}><CheckCircle2 /> Summary organized from confirmed family records. No clinical interpretation was added.</motion.p>}
    <div className="doctor-document">
      <header><div><span className={`person-avatar ${person}`}>{people[person].initials}</span><div><small>Family-prepared medication summary</small><h2>{people[person].name}</h2></div></div><Badge tone="neutral">Verify during visit</Badge></header>
      <section><h3>Current confirmed plan</h3><div className="doctor-plan">{records.map((item) => { const supply = supplyState(state, item); return <div key={item.id}><Pill size={18} /><span><strong>{item.name} {item.strength}</strong><small>{item.routine}</small></span><Badge tone={supply.status === 'AVAILABLE' ? 'good' : 'danger'}>{supply.status.replace('_', ' ')}</Badge></div>; })}</div></section>
      <section><h3>Recent home events</h3>{recent.map((item) => <p className="doctor-line" key={item.id}><span>{item.at}</span><strong>{item.title}</strong><em>{item.detail}</em></p>)}</section>
      <section><h3>Questions requiring verification</h3>{unresolved.map((item) => <p className="doctor-question" key={item.id}><CircleHelp size={18} /><span><strong>{item.title}</strong><small>{item.detail}</small></span></p>)}{!unresolved.length && <p className="muted">No open questions recorded.</p>}</section>
      <footer><span><Users size={16} /> Prepared from caregiver-confirmed and clearly labeled reported information</span><span>Not medical advice or an official medical record</span></footer>
    </div>
    <div className="doctor-actions"><button className="button ghost" onClick={() => window.print()}><FileText size={17} /> Print summary</button><button className="button primary" onClick={() => navigate('postVisit', person)}><ClipboardCheck size={17} /> Start post-visit check</button></div>
  </div>;
}
