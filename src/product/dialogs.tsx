import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Camera, Check, CheckCircle2, ClipboardList, FileText, History, Luggage, Mic, Package, PackageSearch, PenLine, ScanLine, Search, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react';
import { useApp } from './context';
import { changes } from '../data/commandCenterDemo';
import { Badge, Modal, PersonSwitch, recordLabel } from './shared';
import { caregivers, eventStatus, inboxPersonForNavigation, locations, packageRelation, parseVoiceUpdate, people, supplyState, timeNow, uid, type CareReport, type Caregiver, type Location, type MedicinePackage, type ParsedVoiceUpdate, type PersonId, type Purchase } from './model';

export function AppDialogs() {
  const { dialog } = useApp();
  if (dialog === 'add') return <QuickAdd />;
  if (dialog === 'identity') return <IdentityDialog />;
  if (dialog === 'event') return <EventDialog />;
  if (dialog === 'package') return <PackageDialog />;
  if (dialog === 'medication') return <MedicationDialog />;
  if (dialog === 'voice') return <EnhancedVoiceDialog />;
  if (dialog === 'bill') return <BillDialog />;
  if (dialog === 'note') return <ObservationDialog />;
  if (dialog === 'prescription') return <ScanPrescriptionDialog />;
  if (dialog === 'search') return <SearchDialog />;
  if (dialog === 'emergency') return <EmergencyCard />;
  return null;
}

function QuickAdd() {
  const { setDialog } = useApp();
  const options = [
    { id: 'voice', icon: Mic, title: 'Voice', detail: 'Say what happened at home', primary: true },
    { id: 'prescription', icon: Camera, title: 'Camera', detail: 'Scan and verify a prescription', primary: false },
    { id: 'voice', icon: PenLine, title: 'Text', detail: 'Type a care update', primary: false },
  ] as const;
  return <Modal title="How do you want to update Dad's care?"><p className="muted">AI structures the update. Nothing changes until you confirm it.</p><div className="care-update-options">{options.map(({ id, icon: Icon, title, detail, primary }, index) => <button className={primary ? 'primary-option' : ''} key={`${id}-${index}`} onClick={() => setDialog(id)}><span><Icon size={24} /></span><strong>{title}</strong><small>{detail}</small><ArrowRight size={17} /></button>)}</div><div className="quick-secondary"><button onClick={() => setDialog('identity')}><PackageSearch size={17} /> Identify medicine</button><button onClick={() => setDialog('bill')}><ShoppingBag size={17} /> Pharmacy bill</button><button onClick={() => setDialog('note')}><ClipboardList size={17} /> Observation</button></div></Modal>;
}

function EventDialog() {
  const { state, dispatch, selectedId, setDialog } = useApp();
  const event = state.events.find((item) => item.id === selectedId);
  const [mode, setMode] = useState<'guard' | 'existing' | 'report'>(event?.reports.length ? 'guard' : 'report');
  const [status, setStatus] = useState<CareReport['status']>('UNSURE');
  const [caregiver, setCaregiver] = useState<Caregiver>('Pavan');
  const [context, setContext] = useState('');
  if (!event) return null;
  const current = eventStatus(event);
  const hasReport = event.reports.length > 0;
  return <Modal title={recordLabel(state, event.recordId)}><div className="event-context"><span>{people[event.personId].label} · {event.period} · {event.time}</span><Badge tone={current === 'TAKEN' ? 'good' : current === 'MISSED' || current === 'NOT_AVAILABLE' ? 'danger' : 'warn'}>{current.replace('_', ' ')}</Badge></div><p className="muted">Recorded instruction: {event.instruction}</p>
    {current === 'CONFLICT' && <p className="notice coral"><strong>Conflict detected.</strong> Different caregiver reports are preserved until reviewed.</p>}
    {mode === 'guard' && <div className="guard-panel"><AlertCircle size={27} /><h3>Wait, this event already has an update</h3><p>{event.reports[0].caregiver} reported {event.reports[0].status.toLowerCase().replace('_', ' ')} at {event.reports[0].at}. A second report needs deliberate review.</p><div className="button-row"><button className="button primary" onClick={() => setMode('existing')}>View existing update</button><button className="button ghost" onClick={() => setMode('report')}>Report conflict</button><button className="button subtle" onClick={() => setDialog(null)}>Cancel</button></div></div>}
    {mode === 'existing' && <><div className="report-list">{event.reports.map((report) => <article key={report.id}><span className="avatar">{report.caregiver[0]}</span><div><strong>{report.caregiver} · {report.status.replace('_', ' ')}</strong><small>{report.at}{report.context ? ` · ${report.context}` : ''}</small></div>{current === 'CONFLICT' && <button className="button ghost compact" onClick={() => { dispatch({ type: 'RESOLVE_CONFLICT', eventId: event.id, reportId: report.id }); setDialog(null); }}>Use this report</button>}</article>)}</div>{current === 'CONFLICT' && <p className="muted">Resolution selects the family's current status. Other reports stay in history.</p>}<div className="button-row"><button className="button ghost" onClick={() => setMode('report')}>Add different report</button><button className="button subtle" onClick={() => setDialog(null)}>Done</button></div></>}
    {mode === 'report' && <div className="event-report-form"><h3>{hasReport ? 'Add a conflicting report' : 'Report what happened'}</h3><div className="form-grid"><label>Caregiver<select value={caregiver} onChange={(event) => setCaregiver(event.target.value as Caregiver)}>{caregivers.map((name) => <option key={name}>{name}</option>)}</select></label><label>Status<select value={status} onChange={(event) => setStatus(event.target.value as CareReport['status'])}>{(['TAKEN', 'MISSED', 'UNSURE', 'NOT_AVAILABLE'] as CareReport['status'][]).map((value) => <option key={value} value={value}>{value.replace('_', ' ')}</option>)}</select></label></div><label>Optional context<select value={context} onChange={(event) => setContext(event.target.value)}><option value="">No context</option>{['Away from home', 'Medicine unavailable', 'Forgot', 'Patient declined', 'Caregiver unavailable', 'Instruction unclear', 'Other'].map((value) => <option key={value}>{value}</option>)}</select></label>{hasReport && event.reports.some((report) => report.status === status) && <p className="notice amber">This status already has a report. View the existing update instead.</p>}<p className="muted">A report describes what a caregiver said. It does not prove a dose was administered.</p><div className="button-row"><button className="button primary" disabled={hasReport && event.reports.some((report) => report.status === status)} onClick={() => { dispatch({ type: 'REPORT_EVENT', eventId: event.id, report: { id: uid('report'), caregiver, status, context: context || undefined, at: timeNow() } }); setDialog(null); }}>Save report</button><button className="button ghost" onClick={() => setDialog(null)}>Cancel</button></div></div>}
  </Modal>;
}

function PackageDialog() {
  const { state, dispatch, selectedId, setDialog } = useApp();
  const item = state.packages.find((entry) => entry.id === selectedId);
  const [owner, setOwner] = useState<MedicinePackage['owner']>(item?.owner ?? 'unassigned');
  const [location, setLocation] = useState<Location>(item?.location ?? 'Other');
  const [shelf, setShelf] = useState(item?.shelf ?? '');
  const [quantity, setQuantity] = useState(item?.quantity?.toString() ?? '');
  const [expiry, setExpiry] = useState(item?.expiry ?? '');
  const [photo, setPhoto] = useState(item?.photo ?? '');
  if (!item) return null;
  const relation = packageRelation(state, item);
  const linked = state.records.find((record) => record.id === item.recordId);
  return <Modal title={`${item.name} ${item.strength}`}><div className="package-detail-head"><span className="package-photo large">{photo ? <img src={photo} alt={`${item.name} package`} /> : <Package size={42} />}</span><div><Badge tone={relation === 'CURRENT + FOUND' ? 'good' : relation === 'ARCHIVED RECORD' ? 'neutral' : 'warn'}>{relation}</Badge><p>Last scanned: {item.lastScanned}</p>{relation === 'ARCHIVED RECORD' && <p className="notice amber">Old medication record found. This package is not in the current confirmed plan.</p>}{relation === 'STRENGTH DIFFERENCE' && <p className="notice coral">The package strength differs from the current record. Clarification is needed.</p>}{linked && <small>Linked record: {people[linked.personId].label} · {linked.source}</small>}</div></div>
    <div className="form-grid"><label>Owner<select value={owner} onChange={(event) => setOwner(event.target.value as MedicinePackage['owner'])}><option value="dad">Dad</option><option value="mom">Mom</option><option value="unassigned">Shared / unassigned</option></select></label><label>Quantity recorded<input type="number" min="0" value={quantity} placeholder="Unknown" onChange={(event) => setQuantity(event.target.value)} /></label><label>Storage location<select value={location} onChange={(event) => setLocation(event.target.value as Location)}>{locations.map((place) => <option key={place}>{place}</option>)}</select></label><label>Shelf / drawer<input value={shelf} onChange={(event) => setShelf(event.target.value)} /></label><label>Expiry, if confirmed<input type="month" value={expiry} onChange={(event) => setExpiry(event.target.value)} /></label><label>Package photo<input type="file" accept="image/*" capture="environment" onChange={(event) => { const file = event.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = () => setPhoto(String(reader.result)); reader.readAsDataURL(file); } }} /></label></div><div className="button-row"><button className="button primary" onClick={() => { dispatch({ type: 'UPDATE_PACKAGE', packageId: item.id, changes: { owner, location, shelf, quantity: quantity === '' ? null : Number(quantity), expiry: expiry || undefined, photo: photo || undefined } }); setDialog(null); }}>Save cabinet update</button><button className="button ghost" onClick={() => setDialog(null)}>Cancel</button></div>
  </Modal>;
}

function MedicationDialog() {
  const { state, selectedId, setDialog, openPackage } = useApp();
  const record = state.records.find((item) => item.id === selectedId);
  if (!record) return null;
  const supply = supplyState(state, record);
  const events = state.events.filter((item) => item.recordId === record.id);
  const currentEvent = events.find((item) => eventStatus(item) !== 'NO_REPORT') ?? events[0];
  const assignment = state.assignments.find((item) => item.personId === record.personId && item.day === 'Today' && events.some((event) => event.period === item.period));
  const history = state.history.filter((item) => item.recordId === record.id);
  const packages = state.packages.filter((item) => item.recordId === record.id);
  return <Modal title={`${record.name} ${record.strength}`} wide>
    <div className="medication-detail-head"><div><p className="overline">Living medication state</p><h3>{people[record.personId].label}'s connected record</h3><p>{record.source}</p></div><Badge tone={record.archived ? 'neutral' : record.confirmed ? 'good' : 'warn'}>{record.archived ? 'Archived' : record.confirmed ? 'Confirmed plan' : 'Needs review'}</Badge></div>
    <div className="medication-state-grid"><div><small>Doctor plan</small><strong>{record.routine}</strong><span>Recorded instruction</span></div><div><small>Home state</small><strong>{supply.label}</strong><span>{supply.status.replace('_', ' ')}</span></div><div><small>Caregiver</small><strong>{assignment?.caregiver ?? 'Not assigned'}</strong><span>{assignment?.acknowledgedAt ? `Accepted ${assignment.acknowledgedAt}` : 'Today'}</span></div><div><small>Today's status</small><strong>{currentEvent ? eventStatus(currentEvent).replace('_', ' ') : 'No event'}</strong><span>{currentEvent ? `${currentEvent.period} · ${currentEvent.time}` : 'No daily event recorded'}</span></div></div>
    {supply.status === 'NOT AVAILABLE' && <p className="notice coral"><strong>Refill required.</strong> Home supply is recorded as unavailable. This is a family-reported state, not a dispensing record.</p>}
    <div className="medication-detail-columns"><section><div className="section-heading"><div><p className="overline">State + history</p><h3>Medication timeline</h3></div></div><div className="medication-timeline">{history.map((item) => <article key={item.id}><span className={`timeline-symbol ${item.type.toLowerCase()}`}>{item.type === 'PRESCRIPTION' ? <FileText /> : item.type === 'CARE' ? <CheckCircle2 /> : item.type === 'ATTENTION' ? <AlertCircle /> : <Package />}</span><div><small>{item.at} · {item.source}</small><strong>{item.title}</strong><p>{item.detail}</p></div></article>)}{history.length === 0 && <p className="empty-state">No timeline entries recorded yet.</p>}</div></section><section><div className="section-heading"><div><p className="overline">At home</p><h3>Linked packages</h3></div></div><div className="linked-packages">{packages.map((item) => <button key={item.id} onClick={() => openPackage(item.id)}><Package size={20} /><span><strong>{item.quantity ?? 'Unknown'} · {item.location}</strong><small>{item.shelf} · checked {item.lastScanned}</small></span><ArrowRight size={16} /></button>)}{!packages.length && <p className="notice amber">No confirmed package is linked to this plan.</p>}</div><p className="ai-boundary"><ShieldCheck size={18} /><span><strong>Information boundary</strong>This view organizes family records. It does not prescribe, diagnose, or infer missing instructions.</span></p></section></div>
    <div className="button-row"><button className="button subtle" onClick={() => setDialog(null)}>Close</button></div>
  </Modal>;
}

function IdentityDialog() {
  const { state, person, dispatch, setDialog, navigate } = useApp();
  const [sample, setSample] = useState('Metformin|500 mg');
  const [name, setName] = useState('Metformin');
  const [strength, setStrength] = useState('500 mg');
  const [photo, setPhoto] = useState('');
  const [searched, setSearched] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState<Location>('Bedroom Cabinet');
  const [shelf, setShelf] = useState('Top Drawer');
  const [owner, setOwner] = useState<MedicinePackage['owner']>('unassigned');
  const [recordId, setRecordId] = useState('');
  const matches = state.records.filter((record) => record.name.toLowerCase() === name.trim().toLowerCase() && record.strength.toLowerCase() === strength.trim().toLowerCase());
  const chosen = matches.find((record) => record.id === recordId);
  function add() {
    const item: MedicinePackage = { id: uid('pkg'), name: name.trim(), strength: strength.trim(), owner: chosen?.personId ?? owner, recordId: chosen?.id, quantity: quantity === '' ? null : Number(quantity), location, shelf, photo: photo || undefined, lastScanned: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) };
    dispatch({ type: 'ADD_PACKAGE', item }); navigate('cabinet', item.owner === 'unassigned' ? person : item.owner);
  }
  return <Modal title="Whose medicine is this?" wide><p className="muted">Compare the label with family records. Confirm ownership before adding a package.</p><div className="identity-grid"><section><label>Demo label<select value={sample} onChange={(event) => { const [n, s] = event.target.value.split('|'); setSample(event.target.value); setName(n); setStrength(s); setSearched(false); setRecordId(''); }}><option value="Metformin|500 mg">Metformin 500 mg · Dad match</option><option value="Vitamin D3|1 capsule">Vitamin D3 · multiple matches</option><option value="Atorvastatin|10 mg">Atorvastatin 10 mg · archived record</option><option value="Unknown|20 mg">Unknown 20 mg · no match</option></select></label><div className="form-grid"><label>Medicine name<input value={name} onChange={(event) => { setName(event.target.value); setSearched(false); }} /></label><label>Strength<input value={strength} onChange={(event) => { setStrength(event.target.value); setSearched(false); }} /></label></div><label>Package photo, optional<input type="file" accept="image/*" capture="environment" onChange={(event) => { const file = event.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = () => setPhoto(String(reader.result)); reader.readAsDataURL(file); } }} /></label><button className="button primary" disabled={!name.trim() || !strength.trim()} onClick={() => setSearched(true)}><Camera size={18} /> Find family matches</button><p className="muted mini">Demo matching uses the label fields you confirm. Photos are attached without OCR.</p></section><section className="match-results"><h3>Family record matches</h3>{!searched && <p className="empty-state">Confirm the label to search family records.</p>}{searched && !matches.length && <p className="notice amber">No matching family record. Keep the package unassigned for review.</p>}{searched && matches.length > 1 && <p className="notice amber">Multiple possible matches. Choose the correct record.</p>}{searched && matches.map((record) => <button className={`match-option ${recordId === record.id ? 'selected' : ''}`} key={record.id} onClick={() => { setRecordId(record.id); setOwner(record.personId); }}><span className={`person-avatar ${record.personId}`}>{people[record.personId].initials}</span><span><strong>{people[record.personId].label} · {record.name} {record.strength}</strong><small>{record.archived ? 'Archived history; not in current plan' : `Current record · ${record.routine}`}</small></span><Badge tone={record.archived ? 'warn' : 'good'}>{record.archived ? 'Archived' : 'Verified record'}</Badge></button>)}{searched && matches.some((record) => record.personId !== person) && <p className="notice soft">You are viewing {people[person].label}. A match may belong to another person; confirm before assigning.</p>}</section></div>
    {searched && <div className="identity-footer"><div className="form-grid three"><label>Owner<select value={chosen ? chosen.personId : owner} onChange={(event) => { setRecordId(''); setOwner(event.target.value as MedicinePackage['owner']); }}><option value="unassigned">Shared / unassigned</option><option value="dad">Dad</option><option value="mom">Mom</option></select></label><label>Quantity<input type="number" min="0" placeholder="Unknown" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label><label>Location<select value={location} onChange={(event) => setLocation(event.target.value as Location)}>{locations.map((place) => <option key={place}>{place}</option>)}</select></label></div><label>Drawer / shelf<input value={shelf} onChange={(event) => setShelf(event.target.value)} /></label><div className="button-row"><button className="button primary" onClick={add}>{chosen ? `Add to ${people[chosen.personId].label}'s cabinet` : 'Keep unassigned in cabinet'}</button><button className="button ghost" onClick={() => setDialog(null)}>Cancel</button></div></div>}
  </Modal>;
}

interface SpeechCapture {
  lang: string;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}
type SpeechWindow = Window & { SpeechRecognition?: new () => SpeechCapture; webkitSpeechRecognition?: new () => SpeechCapture };

function VoiceDialog() {
  const { state, dispatch, navigate, openEvent } = useApp();
  const [text, setText] = useState('Only four Metformin tablets are left.');
  const [parsed, setParsed] = useState<ParsedVoiceUpdate | null>(null);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechCapture | null>(null);
  const speechAvailable = typeof window !== 'undefined' && Boolean((window as SpeechWindow).SpeechRecognition ?? (window as SpeechWindow).webkitSpeechRecognition);
  useEffect(() => () => { recognitionRef.current?.stop(); }, []);
  function startDictation() {
    if (recognitionRef.current) { recognitionRef.current.stop(); return; }
    const Constructor = (window as SpeechWindow).SpeechRecognition ?? (window as SpeechWindow).webkitSpeechRecognition;
    if (!Constructor) return;
    const recognition = new Constructor();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.onresult = (event) => { setText(event.results[0][0].transcript); setParsed(null); setError(''); };
    recognition.onerror = (event) => setError(`Voice capture could not complete (${event.error}). You can type the update instead.`);
    recognition.onend = () => { setListening(false); recognitionRef.current = null; };
    recognitionRef.current = recognition;
    try { recognition.start(); setListening(true); } catch { recognitionRef.current = null; setError('Voice capture could not start. You can type the update instead.'); }
  }
  function parse() {
    const result = parseVoiceUpdate(state, text);
    if (!result.action) { setParsed(null); setError(result.error); return; }
    setParsed(result.action); setError('');
  }
  const record = parsed ? state.records.find((item) => item.id === parsed.recordId) : undefined;
  const pkg = parsed?.kind === 'supply' ? state.packages.find((item) => item.recordId === parsed.recordId) : undefined;
  const event = parsed?.kind === 'event' ? state.events.find((item) => item.id === parsed.eventId) : undefined;
  return <Modal title="Voice update"><p className="muted">Turn a family report into a structured action. Review it before saving.</p><label>What happened?<textarea value={text} onChange={(event) => { setText(event.target.value); setParsed(null); }} /></label><div className="button-row">{speechAvailable && <button className="button ghost" aria-pressed={listening} onClick={startDictation}><Mic size={17} /> {listening ? 'Stop listening' : 'Start dictation'}</button>}<button className="button primary" onClick={parse}><ClipboardList size={17} /> Create action card</button></div>{error && <p className="notice amber">{error}</p>}{parsed && record && <div className="action-preview"><p className="overline">Review action</p><h3>{record.name} {record.strength}</h3><p>{people[record.personId].label} · {parsed.kind === 'supply' ? `${parsed.quantity} tablets recorded` : `${event?.period} event · ${parsed.status.replace('_', ' ')}`}</p>{parsed.kind === 'supply' && <p className="muted">{pkg ? `Cabinet quantity will change from ${pkg.quantity ?? 'unknown'} to ${parsed.quantity}.` : 'No matched package exists. Add one before recording quantity.'}</p>}{event && event.reports.length > 0 && <p className="notice amber">An update already exists. Review it through the duplicate-event guard.</p>}<div className="button-row">{parsed.kind === 'supply' && pkg && <button className="button primary" onClick={() => { dispatch({ type: 'UPDATE_PACKAGE', packageId: pkg.id, changes: { quantity: parsed.quantity } }); navigate('cabinet', record.personId); }}>Confirm supply update</button>}{parsed.kind === 'event' && event && (event.reports.length ? <button className="button primary" onClick={() => openEvent(event.id)}>Review existing update</button> : <button className="button primary" onClick={() => { dispatch({ type: 'REPORT_EVENT', eventId: event.id, report: { id: uid('report'), caregiver: 'Pavan', status: parsed.status, at: timeNow() } }); navigate('people', record.personId); }}>Confirm event report</button>)}<button className="button ghost" onClick={() => setParsed(null)}>Edit</button></div></div>}</Modal>;
}

function EnhancedVoiceDialog() {
  const { state, dispatch, navigate, openEvent, setDialog } = useApp();
  const [text, setText] = useState("Dad's Metformin is finished.");
  const [parsed, setParsed] = useState<ParsedVoiceUpdate | null>(null);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const recognitionRef = useRef<SpeechCapture | null>(null);
  const speechAvailable = typeof window !== 'undefined' && Boolean((window as SpeechWindow).SpeechRecognition ?? (window as SpeechWindow).webkitSpeechRecognition);
  useEffect(() => () => { recognitionRef.current?.stop(); }, []);
  function startDictation() {
    if (recognitionRef.current) { recognitionRef.current.stop(); return; }
    const Constructor = (window as SpeechWindow).SpeechRecognition ?? (window as SpeechWindow).webkitSpeechRecognition;
    if (!Constructor) return;
    const recognition = new Constructor();
    recognition.lang = 'en-IN'; recognition.interimResults = false;
    recognition.onresult = (event) => { setText(event.results[0][0].transcript); setParsed(null); setError(''); };
    recognition.onerror = () => setError('Voice capture could not complete. Type the update instead.');
    recognition.onend = () => { setListening(false); recognitionRef.current = null; };
    recognitionRef.current = recognition;
    try { recognition.start(); setListening(true); } catch { setError('Voice capture could not start. Type the update instead.'); }
  }
  function parse() {
    setProcessing(true); setError('');
    window.setTimeout(() => {
      const result = parseVoiceUpdate(state, text);
      if (!result.action) { setParsed(null); setError(result.error); setProcessing(false); return; }
      setParsed(result.action); setProcessing(false);
    }, 650);
  }
  const record = parsed ? state.records.find((item) => item.id === parsed.recordId) : undefined;
  const pkg = parsed?.kind === 'supply' ? state.packages.find((item) => item.recordId === parsed.recordId) : undefined;
  const event = parsed?.kind === 'event' ? state.events.find((item) => item.id === parsed.eventId) : undefined;

  if (confirmed && record) return <Modal title="Care update confirmed"><motion.div className="sync-moment" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><span className="sync-pulse"><Check size={34} /></span><p className="overline">Medication state updated</p><h3>Everything is synchronized.</h3><p>{record.name} now reflects the caregiver-confirmed update everywhere it matters.</p><div>{['Home supply', 'Care status', 'Attention center', 'Medication history', 'Doctor summary'].map((label, index) => <motion.span key={label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * .1 }}><CheckCircle2 size={18} /> {label}</motion.span>)}</div><div className="button-row"><button className="button primary" onClick={() => navigate('visit', record.personId)}>See doctor summary <ArrowRight size={16} /></button><button className="button ghost" onClick={() => navigate('today', record.personId)}>Back to care</button></div></motion.div></Modal>;

  return <Modal title="Care update"><div className="voice-intro"><span><Mic size={22} /></span><div><p className="overline">Voice first</p><h3>What happened with Dad's care?</h3><p>Speak naturally or edit the text. MediBridge will propose a structured update.</p></div></div><label className="voice-field">Caregiver report<textarea value={text} onChange={(e) => { setText(e.target.value); setParsed(null); }} /></label><div className="button-row">{speechAvailable && <button className="button ghost" aria-pressed={listening} onClick={startDictation}><Mic size={17} /> {listening ? 'Stop listening' : 'Start dictation'}</button>}<button className="button primary" disabled={processing || !text.trim()} onClick={parse}>{processing ? <><span className="button-spinner" /> Structuring care update</> : <><Sparkles size={17} /> Detect care update</>}</button></div>{error && <p className="notice amber"><strong>Information uncertain.</strong> {error} MediBridge has not guessed.</p>}{parsed && record && <motion.div className="detected-update" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><div className="detected-heading"><div><p className="overline">Care update detected</p><h3>{people[record.personId].label} · {record.name} {record.strength}</h3></div><Badge tone="good">High confidence</Badge></div>{parsed.kind === 'supply' ? <div className="state-change-preview"><div><small>Supply</small><strong>{pkg?.quantity ?? 'Unknown'} <ArrowRight /> {parsed.quantity}</strong></div><div><small>Availability</small><strong>{pkg && (pkg.quantity ?? 0) > 0 ? 'Available' : 'Unknown'} <ArrowRight /> {parsed.quantity === 0 ? 'Unavailable' : 'Available'}</strong></div><div><small>Attention</small><strong>{parsed.quantity === 0 ? 'Refill required' : 'Supply updated'}</strong></div></div> : <div className="state-change-preview"><div><small>Care event</small><strong>{event?.period} · {event?.time}</strong></div><div><small>Reported state</small><strong>Not reported <ArrowRight /> {parsed.status.replace('_', ' ')}</strong></div></div>}<details className="ai-transparency"><summary><ShieldCheck size={17} /> AI transparency</summary><dl><div><dt>Patient</dt><dd>{people[record.personId].label}</dd></div><div><dt>Medicine</dt><dd>{record.name}</dd></div><div><dt>Event</dt><dd>{parsed.kind === 'supply' ? 'Supply finished' : parsed.status.replace('_', ' ')}</dd></div><div><dt>Confidence</dt><dd>High</dd></div><div><dt>Source</dt><dd>Caregiver voice update</dd></div><div><dt>Action</dt><dd>Waiting for confirmation</dd></div></dl></details>{!pkg && parsed.kind === 'supply' && <p className="notice amber">No linked package exists. Add one before recording quantity.</p>}{event && event.reports.length > 0 && <p className="notice amber">An update already exists. Review it through the duplicate-event guard.</p>}<p className="human-confirm"><ShieldCheck size={18} /><span><strong>AI proposes. You confirm.</strong> This update has not changed the family record yet.</span></p><div className="button-row">{parsed.kind === 'supply' && pkg && <button className="button primary confirm-update" onClick={() => { dispatch({ type: 'UPDATE_PACKAGE', packageId: pkg.id, changes: { quantity: parsed.quantity } }); setConfirmed(true); }}>Confirm update</button>}{parsed.kind === 'event' && event && (event.reports.length ? <button className="button primary" onClick={() => openEvent(event.id)}>Review existing update</button> : <button className="button primary confirm-update" onClick={() => { dispatch({ type: 'REPORT_EVENT', eventId: event.id, report: { id: uid('report'), caregiver: 'Pavan', status: parsed.status, at: timeNow() } }); setConfirmed(true); }}>Confirm update</button>)}<button className="button ghost" onClick={() => setParsed(null)}>Edit</button><button className="button subtle" onClick={() => setDialog(null)}>Cancel</button></div></motion.div>}</Modal>;
}

function BillDialog() {
  const { state, dispatch, navigate, setDialog } = useApp();
  const [pharmacy, setPharmacy] = useState('Family Pharmacy');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [receipt, setReceipt] = useState('');
  const [lines, setLines] = useState([{ id: 'met-dad', selected: true, quantity: 20, price: 240 }, { id: 'aml-dad', selected: true, quantity: 10, price: 180 }]);
  const selected = lines.filter((item) => item.selected);
  function confirm() {
    const purchases: Purchase[] = selected.map((line) => { const record = state.records.find((item) => item.id === line.id)!; return { id: uid('purchase'), personId: record.personId, name: record.name, strength: record.strength, quantity: line.quantity, price: line.price, pharmacy: pharmacy.trim() || undefined, date, receipt: receipt || undefined }; });
    dispatch({ type: 'ADD_PURCHASES', purchases }); navigate('cabinet', 'dad');
  }
  return <Modal title="Pharmacy bill"><p className="muted">Demo purchase lines. Confirm each item before it updates recorded cabinet quantity. A purchase is not proof of use.</p><div className="form-grid"><label>Pharmacy<input value={pharmacy} onChange={(event) => setPharmacy(event.target.value)} /></label><label>Purchase date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label></div><label>Receipt photo, optional<input type="file" accept="image/*" capture="environment" onChange={(event) => { const file = event.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = () => setReceipt(String(reader.result)); reader.readAsDataURL(file); } }} /></label><div className="bill-lines">{lines.map((line, index) => { const record = state.records.find((item) => item.id === line.id)!; return <div key={line.id}><input aria-label={`Include ${record.name}`} type="checkbox" checked={line.selected} onChange={(event) => setLines(lines.map((item, i) => i === index ? { ...item, selected: event.target.checked } : item))} /><strong>{record.name} {record.strength}</strong><label>Qty<input type="number" min="1" value={line.quantity} onChange={(event) => setLines(lines.map((item, i) => i === index ? { ...item, quantity: Number(event.target.value) } : item))} /></label><label>₹<input type="number" min="0" value={line.price} onChange={(event) => setLines(lines.map((item, i) => i === index ? { ...item, price: Number(event.target.value) } : item))} /></label></div>; })}</div><div className="button-row"><button className="button primary" disabled={!selected.length || selected.some((item) => item.quantity < 1)} onClick={confirm}>Confirm {selected.length} purchase items</button><button className="button ghost" onClick={() => setDialog(null)}>Cancel</button></div></Modal>;
}

function ObservationDialog() {
  const { dispatch, navigate, setDialog } = useApp();
  const [personId, setPersonId] = useState<PersonId>('dad'); const [caregiver, setCaregiver] = useState<Caregiver>('Pavan'); const [text, setText] = useState('');
  return <Modal title="Family observation"><p className="muted">Record what someone said or observed. MediBridge does not diagnose or assign a cause.</p><div className="form-grid"><label>Person<select value={personId} onChange={(event) => setPersonId(event.target.value as PersonId)}><option value="dad">Dad</option><option value="mom">Mom</option></select></label><label>Caregiver<select value={caregiver} onChange={(event) => setCaregiver(event.target.value as Caregiver)}>{caregivers.map((name) => <option key={name}>{name}</option>)}</select></label></div><label>Original note<textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="For example: Dad said he felt dizzy around 6 PM." /></label><div className="button-row"><button className="button primary" disabled={!text.trim()} onClick={() => { dispatch({ type: 'ADD_OBSERVATION', observation: { id: uid('note'), personId, caregiver, text: text.trim(), at: timeNow() } }); navigate('care', personId); }}>Save observation</button><button className="button ghost" onClick={() => setDialog(null)}>Cancel</button></div></Modal>;
}

function PrescriptionDialog() {
  const { dispatch, navigate, setDialog } = useApp();
  const [personId, setPersonId] = useState<PersonId>('dad'); const [text, setText] = useState('');
  return <Modal title="New prescription or instruction"><p className="muted">Add information to the family inbox for review. Confirmed routines do not change automatically.</p><label>Person<select value={personId} onChange={(event) => setPersonId(event.target.value as PersonId)}><option value="dad">Dad</option><option value="mom">Mom</option></select></label><label>Instruction or question<textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Enter the information exactly as received" /></label><div className="button-row"><button className="button primary" disabled={!text.trim()} onClick={() => { dispatch({ type: 'ADD_INBOX', item: { id: uid('inbox'), kind: 'PRESCRIPTION', title: 'New instructions need review', detail: text.trim(), source: 'Caregiver entry', personId, at: timeNow(), status: 'UNPROCESSED', target: 'plan' } }); navigate('inbox', personId); }}>Add to inbox</button><button className="button ghost" onClick={() => setDialog(null)}>Cancel</button></div></Modal>;
}

function ScanPrescriptionDialog() {
  const { dispatch, navigate } = useApp();
  const [stage, setStage] = useState<'capture' | 'processing' | 'review'>('capture');
  const [photo, setPhoto] = useState('');
  const [created, setCreated] = useState(false);
  function scan() {
    setStage('processing');
    window.setTimeout(() => setStage('review'), 850);
  }
  function createPlan() {
    dispatch({ type: 'ADD_INBOX', item: { id: uid('inbox'), kind: 'PRESCRIPTION IMPORT', title: 'Metformin verified from prescription', detail: '500 mg · Morning and evening · High confidence extraction confirmed by caregiver.', source: 'Prescription scan', personId: 'dad', at: timeNow(), status: 'CONFIRMED', target: 'plan' } });
    dispatch({ type: 'ADD_INBOX', item: { id: uid('inbox'), kind: 'PRESCRIPTION REVIEW', title: 'Pantoprazole duration needs review', detail: 'The duration was not clearly readable. MediBridge did not infer it.', source: 'Prescription scan', personId: 'dad', at: timeNow(), status: 'NEEDS REVIEW', target: 'plan' } });
    setCreated(true);
  }
  if (created) return <Modal title="Care plan created"><div className="scan-success"><span><Check size={30} /></span><h3>Prescription connected to Dad's care space</h3><p>Verified information is part of the medication state. The unclear duration remains visible for review.</p><div><CheckCircle2 size={18} /> 2 verified medicines connected</div><div><AlertCircle size={18} /> 1 instruction kept uncertain</div><button className="button primary" onClick={() => navigate('today', 'dad')}>Open Dad's care space <ArrowRight size={16} /></button></div></Modal>;
  return <Modal title="Scan prescription" wide>{stage === 'capture' && <div className="scan-capture"><div className="camera-frame">{photo ? <img src={photo} alt="Prescription preview" /> : <><ScanLine size={48} /><strong>Place prescription inside the frame</strong><small>Use clear lighting and keep all instructions visible.</small></>}</div><label className="button ghost upload-button"><Camera size={18} /> Use camera<input type="file" accept="image/*" capture="environment" onChange={(event) => { const file = event.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = () => setPhoto(String(reader.result)); reader.readAsDataURL(file); } }} /></label><button className="button primary" onClick={scan}><Sparkles size={17} /> Use demo prescription</button><p className="muted mini">For this offline demo, the sample prescription uses deterministic extracted fields.</p></div>}{stage === 'processing' && <div className="scan-processing"><span className="scan-line" /><ScanLine size={44} /><h3>Structuring medication information...</h3><p>Reading medicines, strengths, routines, and uncertain fields separately.</p></div>}{stage === 'review' && <div className="scan-review"><div className="scan-review-heading"><div><p className="overline">Prescription detected</p><h3>3 medications identified</h3></div><Badge tone="warn">Human verification required</Badge></div><div className="extraction-list"><article><CheckCircle2 /><span><strong>Metformin · 500 mg</strong><small>Morning and evening · after food</small></span><Badge tone="good">High confidence</Badge></article><article><CheckCircle2 /><span><strong>Amlodipine · 5 mg</strong><small>Morning</small></span><Badge tone="good">High confidence</Badge></article><article className="uncertain"><AlertCircle /><span><strong>Pantoprazole · 40 mg</strong><small>Duration unclear. No value inferred.</small></span><Badge tone="warn">Needs review</Badge></article></div><p className="human-confirm"><ShieldCheck size={18} /><span><strong>Scan, verify, then create state.</strong> Unclear information stays uncertain instead of being guessed.</span></p><div className="button-row"><button className="button primary" onClick={createPlan}>Create care plan</button><button className="button ghost" onClick={() => setStage('capture')}>Retake</button></div></div>}</Modal>;
}
function SearchDialog() {
  const { state, navigate, openPackage, openEvent } = useApp();
  const [query, setQuery] = useState('');
  const q = query.toLowerCase().trim();
  const namedRecords = state.records.filter((item) => q.includes(item.name.toLowerCase()));
  const owner = q.includes('mom') || q.includes('mother') ? 'mom' : q.includes('dad') || q.includes('father') ? 'dad' : null;
  const matchingPackages = state.packages.filter((item) => q && ((namedRecords.some((record) => record.name.toLowerCase() === item.name.toLowerCase()) && (!owner || item.owner === owner)) || `${item.name} ${item.strength} ${item.location} ${item.shelf}`.toLowerCase().includes(q)));
  const matchingEvents = state.events.filter((item) => q && (`${recordLabel(state, item.recordId)} ${item.period} ${people[item.personId].label} ${eventStatus(item)}`.toLowerCase().includes(q) || (q.includes('no report') && eventStatus(item) === 'NO_REPORT')));
  const showUnresolved = q.includes('unresolved') || q.includes('attention') || q.includes('open question');
  const matchingInbox = state.inbox.filter((item) => q && (showUnresolved ? ['NEEDS REVIEW', 'UNPROCESSED'].includes(item.status) : `${item.title} ${item.detail} ${item.kind}`.toLowerCase().includes(q)));
  const low = q.includes('low') || q.includes('supply') ? state.records.filter((item) => !item.archived && supplyState(state, item).status === 'RUNNING LOW') : [];
  const gaps = q.includes('uncovered') || q.includes('no caregiver') || q.includes('coverage') ? state.assignments.filter((item) => item.day === 'Today' && !item.caregiver) : [];
  const pouch = q.includes('travel') || q.includes('pouch') ? state.packages.filter((item) => item.location === 'Travel Pouch') : [];
  const changed = q.includes('change') || q.includes('last visit') ? changes : [];
  const count = matchingPackages.length + matchingEvents.length + matchingInbox.length + low.length + gaps.length + pouch.length + changed.length;
  return <Modal title="Search family records" wide>
    <div className="search-input"><Search size={20} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Medicine, location, no report, supply, caregiver..." /></div>
    {!q && <div className="search-suggestions">{["Where is Dad's Metformin?", 'Which medicines are running low?', "What's unresolved?", "What changed after Dad's last visit?", 'Show medicines in travel pouch', 'Which routine has no caregiver?'].map((value) => <button key={value} onClick={() => setQuery(value)}>{value}</button>)}</div>}
    {q && <div className="search-results">
      {matchingPackages.map((item) => <button key={`pkg-${item.id}`} onClick={() => openPackage(item.id)}><Package size={17} /><span><strong>{item.name} {item.strength}</strong><small>{item.owner === 'unassigned' ? 'Unassigned' : people[item.owner].label} · {item.location} · {item.shelf}</small></span><ArrowRight size={16} /></button>)}
      {matchingEvents.map((item) => <button key={`evt-${item.id}`} onClick={() => openEvent(item.id)}><Package size={17} /><span><strong>{recordLabel(state, item.recordId)}</strong><small>{people[item.personId].label} · {item.period} · {eventStatus(item).replace('_', ' ')}</small></span><ArrowRight size={16} /></button>)}
      {matchingInbox.map((item) => <button key={`in-${item.id}`} onClick={() => navigate('inbox', inboxPersonForNavigation(item))}><Package size={17} /><span><strong>{item.title}</strong><small>{item.status} · {item.source}</small></span><ArrowRight size={16} /></button>)}
      {changed.map((item) => <button key={`change-${item.id}`} onClick={() => navigate('visit', 'dad')}><FileText size={17} /><span><strong>{item.medicine}: {item.type}</strong><small>{item.detail}</small></span><ArrowRight size={16} /></button>)}
      {low.map((item) => <button key={`low-${item.id}`} onClick={() => navigate('cabinet', item.personId)}><Package size={17} /><span><strong>{item.name} running low</strong><small>{supplyState(state, item).label}</small></span><ArrowRight size={16} /></button>)}
      {gaps.map((item) => <button key={`gap-${item.id}`} onClick={() => navigate('care')}><Package size={17} /><span><strong>{people[item.personId].label} · {item.period} uncovered</strong><small>Assign a caregiver</small></span><ArrowRight size={16} /></button>)}
      {pouch.map((item) => <button key={`pouch-${item.id}`} onClick={() => navigate('travel')}><Luggage size={17} /><span><strong>{item.name} in travel pouch</strong><small>{item.quantity ?? 'Unknown'} recorded</small></span><ArrowRight size={16} /></button>)}
      {count === 0 && <p className="empty-state">No matching structured family records.</p>}
    </div>}
  </Modal>;
}

function EmergencyCard() {
  const { state, person, setDialog } = useApp();
  return <Modal title="Emergency information card"><div className="emergency-card"><p className="overline">Family-maintained information · Verify with healthcare professional</p><PersonSwitch /><h3>{people[person].name}</h3><h4>Current confirmed records</h4>{state.records.filter((item) => item.personId === person && item.confirmed && !item.archived).map((item) => <p key={item.id}>{item.name} {item.strength} · {item.routine}</p>)}<h4>Family caregiver contacts</h4>{caregivers.map((name) => <p key={name}>{name}{state.contacts[name] ? ` · ${state.contacts[name]}` : ''}</p>)}{state.allergies[person] && <><h4>Family-entered allergies</h4><p>{state.allergies[person]}</p></>}<h4>Open medication information</h4>{state.inbox.filter((item) => item.personId === person && (item.status === 'NEEDS REVIEW' || item.status === 'UNPROCESSED')).slice(0, 4).map((item) => <p key={item.id}>{item.title}</p>)}<small>Read-only card. No diagnosis or emergency treatment guidance.</small></div><div className="button-row"><button className="button ghost" onClick={() => window.print()}><FileText size={17} /> Print card</button><button className="button subtle" onClick={() => setDialog(null)}>Close</button></div></Modal>;
}
