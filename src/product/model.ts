export type PersonId = 'dad' | 'mom';
export type Caregiver = 'Mother' | 'Pavan' | 'Ananya';
export type Period = 'Morning' | 'Afternoon' | 'Evening';
export type EventStatus = 'TAKEN' | 'MISSED' | 'UNSURE' | 'NOT_AVAILABLE' | 'NO_REPORT' | 'CONFLICT';
export type InboxStatus = 'UNPROCESSED' | 'NEEDS REVIEW' | 'CONFIRMED' | 'RESOLVED';
export type Location = 'Bedroom Cabinet' | 'Kitchen Drawer' | 'Refrigerator' | 'Travel Pouch' | 'Other';

export interface MedicineRecord {
  id: string;
  personId: PersonId;
  name: string;
  strength: string;
  routine: string;
  dailyEvents: number;
  confirmed: boolean;
  archived: boolean;
  source: string;
}

export interface MedicinePackage {
  id: string;
  recordId?: string;
  owner: PersonId | 'unassigned';
  name: string;
  strength: string;
  quantity: number | null;
  location: Location;
  shelf: string;
  expiry?: string;
  photo?: string;
  lastScanned: string;
  previousLocation?: Location;
  sourcePackageId?: string;
}

export interface CareReport {
  id: string;
  caregiver: Caregiver;
  status: Exclude<EventStatus, 'NO_REPORT' | 'CONFLICT'>;
  at: string;
  context?: string;
}

export interface CareEvent {
  id: string;
  personId: PersonId;
  recordId: string;
  period: Period;
  time: string;
  instruction: string;
  reports: CareReport[];
  resolvedReportId?: string;
}

export interface Assignment {
  id: string;
  personId: PersonId;
  period: Period;
  day: 'Today' | 'Tomorrow';
  caregiver: Caregiver | null;
  acknowledgedAt?: string;
}

export interface Handoff {
  id: string;
  from: Caregiver;
  to: Caregiver;
  assignmentId: string;
  status: 'PENDING' | 'ACKNOWLEDGED';
  at: string;
  acknowledgedAt?: string;
}

export interface InboxItem {
  id: string;
  kind: string;
  title: string;
  detail: string;
  source: string;
  personId: PersonId | 'unassigned';
  at: string;
  status: InboxStatus;
  target: 'event' | 'cabinet' | 'care' | 'visit' | 'plan';
  targetId?: string;
}

export interface Observation {
  id: string;
  personId: PersonId;
  caregiver: Caregiver;
  text: string;
  at: string;
}

export interface Purchase {
  id: string;
  personId: PersonId;
  name: string;
  strength: string;
  quantity: number;
  price?: number;
  pharmacy?: string;
  date: string;
  receipt?: string;
}

export interface Travel {
  personId: PersonId;
  start: string;
  end: string;
  status: 'PLANNING' | 'ACTIVE' | 'RETURNED';
  packed: Record<string, number | null>;
}

export interface MedicationHistoryEntry {
  id: string;
  recordId: string;
  personId: PersonId;
  type: 'PRESCRIPTION' | 'SUPPLY' | 'CARE' | 'CHANGE' | 'ATTENTION';
  title: string;
  detail: string;
  at: string;
  source: string;
}

export interface HouseholdState {
  records: MedicineRecord[];
  packages: MedicinePackage[];
  events: CareEvent[];
  assignments: Assignment[];
  handoffs: Handoff[];
  inbox: InboxItem[];
  observations: Observation[];
  purchases: Purchase[];
  activity: string[];
  travel: Travel | null;
  unavailable: { caregiver: Caregiver; day: 'Today' | 'Tomorrow' }[];
  allergies: Partial<Record<PersonId, string>>;
  contacts: Partial<Record<Caregiver, string>>;
  history: MedicationHistoryEntry[];
}

export type HouseholdAction =
  | { type: 'REPORT_EVENT'; eventId: string; report: CareReport }
  | { type: 'RESOLVE_CONFLICT'; eventId: string; reportId: string }
  | { type: 'UPDATE_PACKAGE'; packageId: string; changes: Partial<MedicinePackage> }
  | { type: 'ADD_PACKAGE'; item: MedicinePackage }
  | { type: 'ASSIGN'; assignmentId: string; caregiver: Caregiver }
  | { type: 'ACKNOWLEDGE'; assignmentId: string; at: string }
  | { type: 'SET_UNAVAILABLE'; caregiver: Caregiver; day: 'Today' | 'Tomorrow' }
  | { type: 'CREATE_HANDOFF'; handoff: Handoff }
  | { type: 'ACCEPT_HANDOFF'; handoffId: string; at: string }
  | { type: 'CREATE_TRAVEL'; travel: Travel }
  | { type: 'PACK_TRAVEL'; recordId: string; quantity: number; packageId?: string }
  | { type: 'RETURN_TRAVEL'; remaining: Record<string, number> }
  | { type: 'ADD_OBSERVATION'; observation: Observation }
  | { type: 'ADD_PURCHASES'; purchases: Purchase[] }
  | { type: 'ADD_INBOX'; item: InboxItem }
  | { type: 'SET_INBOX_STATUS'; itemId: string; status: InboxStatus }
  | { type: 'UPDATE_ROUTINE'; recordId: string; routine: string; dailyEvents: number }
  | { type: 'ARCHIVE_RECORD'; recordId: string }
  | { type: 'SET_ALLERGY'; personId: PersonId; value: string }
  | { type: 'SET_CONTACT'; caregiver: Caregiver; value: string };

export const people = {
  dad: { name: 'Ramesh Rao', label: 'Dad', age: 67, initials: 'RR' },
  mom: { name: 'Lakshmi Rao', label: 'Mom', age: 62, initials: 'LR' },
} as const;

export const caregivers: Caregiver[] = ['Mother', 'Pavan', 'Ananya'];
export const locations: Location[] = ['Bedroom Cabinet', 'Kitchen Drawer', 'Refrigerator', 'Travel Pouch', 'Other'];

export function inboxPersonLabel(item: InboxItem) {
  return item.personId === 'unassigned' ? 'Unassigned' : people[item.personId].label;
}

export function inboxPersonForNavigation(item: InboxItem): PersonId {
  return item.personId === 'unassigned' ? 'dad' : item.personId;
}

export const initialHousehold: HouseholdState = {
  records: [
    { id: 'met-dad', personId: 'dad', name: 'Metformin', strength: '500 mg', routine: 'Morning and evening, after food', dailyEvents: 2, confirmed: true, archived: false, source: 'Family confirmed, Sep 18' },
    { id: 'aml-dad', personId: 'dad', name: 'Amlodipine', strength: '5 mg', routine: 'Morning', dailyEvents: 1, confirmed: true, archived: false, source: 'Family confirmed, Sep 18' },
    { id: 'pan-dad', personId: 'dad', name: 'Pantoprazole', strength: '40 mg', routine: 'Afternoon, before food', dailyEvents: 1, confirmed: true, archived: false, source: 'Family confirmed, Aug 28; duration unclear' },
    { id: 'vit-dad', personId: 'dad', name: 'Vitamin D3', strength: '1 capsule', routine: 'Weekly; day to confirm', dailyEvents: 0, confirmed: true, archived: false, source: 'Family confirmed, Aug 28' },
    { id: 'ato-dad', personId: 'dad', name: 'Atorvastatin', strength: '10 mg', routine: 'Previously at night', dailyEvents: 0, confirmed: true, archived: true, source: 'Previous family record; current status needs review' },
    { id: 'cal-mom', personId: 'mom', name: 'Calcium', strength: '500 mg', routine: 'Morning', dailyEvents: 1, confirmed: true, archived: false, source: 'Family confirmed' },
    { id: 'vit-mom', personId: 'mom', name: 'Vitamin D3', strength: '1 capsule', routine: 'Evening', dailyEvents: 1, confirmed: true, archived: false, source: 'Family confirmed' },
  ],
  packages: [
    { id: 'pkg-met', recordId: 'met-dad', owner: 'dad', name: 'Metformin', strength: '500 mg', quantity: 5, location: 'Bedroom Cabinet', shelf: 'Top Drawer', lastScanned: 'Sep 18' },
    { id: 'pkg-aml', recordId: 'aml-dad', owner: 'dad', name: 'Amlodipine', strength: '10 mg', quantity: 12, location: 'Bedroom Cabinet', shelf: 'Middle Shelf', lastScanned: 'Sep 18' },
    { id: 'pkg-pan', recordId: 'pan-dad', owner: 'dad', name: 'Pantoprazole', strength: '40 mg', quantity: 8, location: 'Kitchen Drawer', shelf: 'Daily Care Box', lastScanned: 'Sep 18' },
    { id: 'pkg-vit-dad', recordId: 'vit-dad', owner: 'dad', name: 'Vitamin D3', strength: '1 capsule', quantity: 4, location: 'Kitchen Drawer', shelf: 'Weekly Medicines', lastScanned: 'Sep 18' },
    { id: 'pkg-ato', recordId: 'ato-dad', owner: 'dad', name: 'Atorvastatin', strength: '10 mg', quantity: null, location: 'Kitchen Drawer', shelf: 'Medicine Box', lastScanned: 'Sep 18' },
    { id: 'pkg-cal', recordId: 'cal-mom', owner: 'mom', name: 'Calcium', strength: '500 mg', quantity: 18, location: 'Kitchen Drawer', shelf: 'Medicine Box', lastScanned: 'Sep 16' },
    { id: 'pkg-vit', recordId: 'vit-mom', owner: 'mom', name: 'Vitamin D3', strength: '1 capsule', quantity: 6, location: 'Refrigerator', shelf: 'Side Shelf', lastScanned: 'Sep 12' },
  ],
  events: [
    { id: 'evt-dad-met-am', personId: 'dad', recordId: 'met-dad', period: 'Morning', time: '8:00 AM', instruction: 'After food', reports: [{ id: 'report-1', caregiver: 'Mother', status: 'TAKEN', at: '8:06 AM' }] },
    { id: 'evt-dad-aml-am', personId: 'dad', recordId: 'aml-dad', period: 'Morning', time: '8:30 AM', instruction: 'Morning routine', reports: [{ id: 'report-2', caregiver: 'Mother', status: 'TAKEN', at: '8:10 AM' }] },
    { id: 'evt-dad-pan-pm', personId: 'dad', recordId: 'pan-dad', period: 'Afternoon', time: '1:00 PM', instruction: 'Before food', reports: [] },
    { id: 'evt-dad-met-eve', personId: 'dad', recordId: 'met-dad', period: 'Evening', time: '8:00 PM', instruction: 'After food', reports: [] },
    { id: 'evt-mom-cal-am', personId: 'mom', recordId: 'cal-mom', period: 'Morning', time: '8:00 AM', instruction: 'Recorded routine', reports: [{ id: 'report-3', caregiver: 'Mother', status: 'TAKEN', at: '8:15 AM' }] },
    { id: 'evt-mom-vit-eve', personId: 'mom', recordId: 'vit-mom', period: 'Evening', time: '8:00 PM', instruction: 'Recorded routine', reports: [{ id: 'report-4', caregiver: 'Mother', status: 'TAKEN', at: '8:22 PM' }] },
  ],
  assignments: [
    { id: 'assign-dad-am', personId: 'dad', period: 'Morning', day: 'Today', caregiver: 'Mother', acknowledgedAt: '7:40 AM' },
    { id: 'assign-dad-pm', personId: 'dad', period: 'Afternoon', day: 'Today', caregiver: null },
    { id: 'assign-dad-eve', personId: 'dad', period: 'Evening', day: 'Today', caregiver: 'Pavan' },
    { id: 'assign-mom-am', personId: 'mom', period: 'Morning', day: 'Today', caregiver: 'Mother', acknowledgedAt: '7:40 AM' },
    { id: 'assign-mom-eve', personId: 'mom', period: 'Evening', day: 'Today', caregiver: 'Mother', acknowledgedAt: '7:40 AM' },
    { id: 'assign-tom-dad-am', personId: 'dad', period: 'Morning', day: 'Tomorrow', caregiver: 'Mother' },
    { id: 'assign-tom-dad-eve', personId: 'dad', period: 'Evening', day: 'Tomorrow', caregiver: 'Pavan' },
    { id: 'assign-tom-mom-am', personId: 'mom', period: 'Morning', day: 'Tomorrow', caregiver: 'Mother' },
  ],
  handoffs: [],
  inbox: [
    { id: 'inbox-plan', kind: 'PRESCRIPTION', title: 'Dad’s latest plan has changes', detail: 'New, changed, and unclear fields need family review.', source: 'Prescription', personId: 'dad', at: 'Sep 18', status: 'NEEDS REVIEW', target: 'plan' },
    { id: 'inbox-mismatch', kind: 'PACKAGE MATCH', title: 'Amlodipine strength differs', detail: 'Current plan: 5 mg. Package at home: 10 mg.', source: 'Package scan', personId: 'dad', at: 'Sep 18', status: 'NEEDS REVIEW', target: 'cabinet', targetId: 'pkg-aml' },
    { id: 'inbox-no-report', kind: 'NO REPORT', title: 'Dad’s afternoon event has no report', detail: 'No caregiver has said whether it happened.', source: 'Routine', personId: 'dad', at: 'Today', status: 'NEEDS REVIEW', target: 'event', targetId: 'evt-dad-pan-pm' },
  ],
  observations: [],
  purchases: [],
  activity: ['Mother reported Dad’s morning Metformin taken at 8:06 AM.', 'Dad’s afternoon event has no report.', 'Pavan reviewed the latest plan changes.'],
  travel: null,
  unavailable: [],
  allergies: {},
  contacts: {},
  history: [
    { id: 'hist-met-plan', recordId: 'met-dad', personId: 'dad', type: 'PRESCRIPTION', title: 'Prescription verified', detail: 'Metformin 500 mg, morning and evening after food.', at: 'Sep 15', source: 'Prescription' },
    { id: 'hist-met-home', recordId: 'met-dad', personId: 'dad', type: 'SUPPLY', title: 'Home supply recorded', detail: '5 tablets confirmed in the bedroom cabinet.', at: 'Sep 18', source: 'Cabinet check' },
    { id: 'hist-met-care', recordId: 'met-dad', personId: 'dad', type: 'CARE', title: 'Morning care reported', detail: 'Mother reported the morning event as taken.', at: 'Today, 8:06 AM', source: 'Mother' },
    { id: 'hist-pan-question', recordId: 'pan-dad', personId: 'dad', type: 'ATTENTION', title: 'Duration needs review', detail: 'The recorded duration is not clear. MediBridge has not guessed.', at: 'Aug 28', source: 'Family review' },
  ],
};

export function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function timeNow() {
  return new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
}

export function tripDays(start: string, end: string) {
  const first = new Date(`${start}T00:00:00`).getTime();
  const last = new Date(`${end}T00:00:00`).getTime();
  return Number.isFinite(first) && Number.isFinite(last) ? Math.max(0, Math.round((last - first) / 86400000) + 1) : 0;
}

export function eventStatus(event: CareEvent): EventStatus {
  if (event.reports.length === 0) return 'NO_REPORT';
  const resolved = event.reports.find((report) => report.id === event.resolvedReportId);
  if (resolved) return resolved.status;
  if (new Set(event.reports.map((report) => report.status)).size > 1) return 'CONFLICT';
  return event.reports[0].status;
}

export function packageRelation(state: HouseholdState, item: MedicinePackage) {
  const record = state.records.find((entry) => entry.id === item.recordId);
  if (record && item.owner !== record.personId) return 'OWNER NEEDS REVIEW';
  if (record?.archived) return 'ARCHIVED RECORD';
  if (record && record.strength.toLowerCase() !== item.strength.toLowerCase()) return 'STRENGTH DIFFERENCE';
  if (record && !record.archived) return 'CURRENT + FOUND';
  const sameName = state.records.find((entry) => entry.personId === item.owner && !entry.archived && entry.name.toLowerCase() === item.name.toLowerCase());
  return sameName ? sameName.strength.toLowerCase() === item.strength.toLowerCase() ? 'POSSIBLE CURRENT MATCH' : 'STRENGTH DIFFERENCE' : 'FOUND + NOT CURRENT';
}

export function supplyState(state: HouseholdState, record: MedicineRecord) {
  const matches = state.packages.filter((item) => item.recordId === record.id && item.owner === record.personId);
  if (!matches.length) return { label: 'Not found at home', days: null, quantity: null, status: 'NOT AVAILABLE' };
  const quantities = matches.map((item) => item.quantity);
  if (quantities.some((value) => value === null)) return { label: 'Quantity unknown', days: null, quantity: null, status: 'UNKNOWN' };
  const quantity = quantities.reduce<number>((sum, value) => sum + (value ?? 0), 0);
  if (quantity === 0) return { label: '0 recorded', days: 0, quantity, status: 'NOT AVAILABLE' };
  const days = record.confirmed && record.dailyEvents > 0 ? Math.floor(quantity / record.dailyEvents) : null;
  return { label: `${quantity} recorded`, days, quantity, status: days !== null && days <= 2 ? 'RUNNING LOW' : 'AVAILABLE' };
}

export type ParsedVoiceUpdate =
  | { kind: 'supply'; recordId: string; quantity: number }
  | { kind: 'event'; recordId: string; eventId: string; status: CareReport['status'] };

export function parseVoiceUpdate(state: HouseholdState, text: string): { action: ParsedVoiceUpdate; error?: never } | { action?: never; error: string } {
  const lower = text.toLowerCase();
  const mom = /\b(mom|mother)\b/.test(lower);
  const dad = /\b(dad|father)\b/.test(lower);
  if (mom && dad) return { error: 'Name one family member in this update.' };
  const person = mom ? 'mom' : dad ? 'dad' : null;
  const records = state.records.filter((item) => !item.archived && lower.includes(item.name.toLowerCase()) && (!person || item.personId === person));
  if (!records.length) return { error: 'No current family medicine record matches this update. Include a medicine name from the family records.' };
  if (records.length > 1) return { error: 'This medicine belongs to more than one family member. Say Dad or Mom.' };
  const record = records[0];
  if (/\b(finished|ran out|empty|no tablets|none left)\b/.test(lower)) {
    return { action: { kind: 'supply', recordId: record.id, quantity: 0 } };
  }
  if (/\b(left|remaining|in stock|in supply)\b/.test(lower)) {
    const withoutIdentity = lower.replace(record.name.toLowerCase(), '').replace(record.strength.toLowerCase(), '');
    const numeric = withoutIdentity.match(/\b(\d+)\b/);
    const words: Record<string, number> = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
    const word = Object.keys(words).find((key) => new RegExp(`\\b${key}\\b`).test(withoutIdentity));
    const quantity = numeric ? Number(numeric[1]) : word ? words[word] : NaN;
    if (!Number.isSafeInteger(quantity) || quantity < 0) return { error: 'A clear quantity is needed for a supply update.' };
    return { action: { kind: 'supply', recordId: record.id, quantity } };
  }
  const status: CareReport['status'] | null = /\b(unsure|not sure|don't know)\b/.test(lower) ? 'UNSURE'
    : /\b(not available|unavailable|finished|ran out)\b/.test(lower) ? 'NOT_AVAILABLE'
    : /\b(missed|forgot|not taken|wasn't taken|didn't take)\b/.test(lower) ? 'MISSED'
    : /\b(taken|took|gave|given)\b/.test(lower) ? 'TAKEN' : null;
  if (!status) return { error: 'Say whether the event was taken, missed, unsure, or medicine unavailable.' };
  const period = /\bmorning\b/.test(lower) ? 'Morning' : /\bafternoon\b/.test(lower) ? 'Afternoon' : /\b(evening|night)\b/.test(lower) ? 'Evening' : null;
  const events = state.events.filter((item) => item.recordId === record.id && (!period || item.period === period));
  if (!events.length) return { error: 'No recorded event matches this medicine and time.' };
  if (events.length > 1) return { error: 'More than one event matches. Include morning, afternoon, or evening.' };
  return { action: { kind: 'event', recordId: record.id, eventId: events[0].id, status } };
}

function addInbox(state: HouseholdState, item: InboxItem, activity: string): HouseholdState {
  return { ...state, inbox: [item, ...state.inbox], activity: [activity, ...state.activity] };
}

export function householdReducer(state: HouseholdState, action: HouseholdAction): HouseholdState {
  switch (action.type) {
    case 'REPORT_EVENT': {
      const current = state.events.find((event) => event.id === action.eventId);
      if (!current) return state;
      if (current.reports.some((report) => report.status === action.report.status)) return state;
      const next = { ...state, events: state.events.map((event) => event.id === action.eventId ? { ...event, reports: [...event.reports, action.report], resolvedReportId: undefined } : event), inbox: state.inbox.map((item) => item.targetId === action.eventId && item.kind === 'NO REPORT' ? { ...item, status: 'RESOLVED' as const } : item) };
      const name = state.records.find((record) => record.id === current.recordId)?.name ?? 'Medicine';
      const isConflict = current.reports.length > 0 && current.reports.some((report) => report.status !== action.report.status);
      return addInbox(next, { id: uid('inbox'), kind: isConflict ? 'CAREGIVER CONFLICT' : 'EVENT UPDATE', title: isConflict ? `Different reports for ${name}` : `${name}: ${action.report.status.replace('_', ' ')}`, detail: isConflict ? 'Both caregiver reports are preserved until reviewed.' : `${action.report.caregiver} reported at ${action.report.at}.`, source: action.report.caregiver, personId: current.personId, at: action.report.at, status: isConflict || action.report.status === 'UNSURE' || action.report.status === 'NOT_AVAILABLE' ? 'NEEDS REVIEW' : 'CONFIRMED', target: 'event', targetId: current.id }, `${action.report.caregiver} reported ${name} as ${action.report.status.toLowerCase().replace('_', ' ')}.`);
    }
    case 'RESOLVE_CONFLICT':
      return { ...state, events: state.events.map((event) => event.id === action.eventId ? { ...event, resolvedReportId: action.reportId } : event), inbox: state.inbox.map((item) => item.targetId === action.eventId && item.kind === 'CAREGIVER CONFLICT' ? { ...item, status: 'RESOLVED' } : item), activity: [`Caregiver conflict reviewed at ${timeNow()}; original reports kept.`, ...state.activity] };
    case 'UPDATE_PACKAGE': {
      const item = state.packages.find((entry) => entry.id === action.packageId);
      if (!item) return state;
      const owner = action.changes.owner ?? item.owner;
      const depleted = action.changes.quantity === 0 && item.quantity !== 0;
      const at = timeNow();
      const record = state.records.find((entry) => entry.id === item.recordId);
      const next = {
        ...state,
        packages: state.packages.map((entry) => entry.id === item.id ? { ...entry, ...action.changes } : entry),
        history: record && action.changes.quantity !== undefined && action.changes.quantity !== item.quantity
          ? [{ id: uid('history'), recordId: record.id, personId: record.personId, type: depleted ? 'ATTENTION' as const : 'SUPPLY' as const, title: depleted ? 'Supply reported finished' : 'Home supply updated', detail: depleted ? 'Recorded quantity changed to 0. Refill verification is required.' : `Recorded quantity changed from ${item.quantity ?? 'unknown'} to ${action.changes.quantity ?? 'unknown'}.`, at: `Today, ${at}`, source: 'Caregiver update' }, ...state.history]
          : state.history,
      };
      return addInbox(next, { id: uid('inbox'), kind: depleted ? 'SUPPLY ALERT' : 'CABINET UPDATE', title: depleted ? `Refill required: ${item.name} unavailable` : `${item.name} package updated`, detail: depleted ? `${people[record?.personId ?? 'dad'].label}'s recorded home supply changed to 0. Confirm a refill before marking available.` : `Owner: ${owner === 'unassigned' ? 'Unassigned' : people[owner].label}. Quantity or location may also have changed.`, source: depleted ? 'Confirmed care update' : 'Cabinet', personId: owner, at, status: depleted || owner === 'unassigned' ? 'NEEDS REVIEW' : 'CONFIRMED', target: 'cabinet', targetId: item.id }, depleted ? `${item.name} supply reported finished; connected medication state synchronized.` : `${item.name} package updated in the cabinet.`);
    }
    case 'ADD_PACKAGE':
      return addInbox({ ...state, packages: [action.item, ...state.packages] }, { id: uid('inbox'), kind: 'PACKAGE SCAN', title: `${action.item.name} added to cabinet`, detail: `Owner: ${action.item.owner === 'unassigned' ? 'Unassigned' : people[action.item.owner].label}.`, source: 'Package identification', personId: action.item.owner, at: timeNow(), status: action.item.recordId && !state.records.some((record) => record.id === action.item.recordId && record.archived) ? 'CONFIRMED' : 'NEEDS REVIEW', target: 'cabinet', targetId: action.item.id }, `${action.item.name} package added to ${action.item.location}.`);
    case 'ASSIGN':
      if (state.unavailable.some((item) => item.caregiver === action.caregiver && item.day === state.assignments.find((entry) => entry.id === action.assignmentId)?.day)) return state;
      return addInbox({ ...state, assignments: state.assignments.map((entry) => entry.id === action.assignmentId ? { ...entry, caregiver: action.caregiver, acknowledgedAt: undefined } : entry) }, { id: uid('inbox'), kind: 'CARE ASSIGNMENT', title: `${action.caregiver} assigned care`, detail: 'Awaiting caregiver acknowledgement.', source: 'Care coverage', personId: state.assignments.find((entry) => entry.id === action.assignmentId)?.personId ?? 'dad', at: timeNow(), status: 'NEEDS REVIEW', target: 'care', targetId: action.assignmentId }, `${action.caregiver} assigned a routine; acknowledgement pending.`);
    case 'ACKNOWLEDGE':
      return { ...state, assignments: state.assignments.map((entry) => entry.id === action.assignmentId ? { ...entry, acknowledgedAt: action.at } : entry), inbox: state.inbox.map((item) => item.targetId === action.assignmentId && item.kind === 'CARE ASSIGNMENT' ? { ...item, status: 'RESOLVED' } : item), activity: [`Care assignment acknowledged at ${action.at}.`, ...state.activity] };
    case 'SET_UNAVAILABLE': {
      const affected = state.assignments.filter((entry) => entry.day === action.day && entry.caregiver === action.caregiver);
      return addInbox({ ...state, unavailable: [...state.unavailable, { caregiver: action.caregiver, day: action.day }], assignments: state.assignments.map((entry) => affected.some((item) => item.id === entry.id) ? { ...entry, caregiver: null, acknowledgedAt: undefined } : entry) }, { id: uid('inbox'), kind: 'COVERAGE GAP', title: `${affected.length} responsibilities need reassignment`, detail: `${action.caregiver} is unavailable ${action.day.toLowerCase()}. Medication schedules are unchanged.`, source: 'Care availability', personId: affected[0]?.personId ?? 'unassigned', at: timeNow(), status: 'NEEDS REVIEW', target: 'care' }, `${action.caregiver} marked unavailable ${action.day.toLowerCase()}; ${affected.length} responsibilities opened.`);
    }
    case 'CREATE_HANDOFF':
      if (state.unavailable.some((item) => item.caregiver === action.handoff.to && item.day === state.assignments.find((entry) => entry.id === action.handoff.assignmentId)?.day)) return state;
      return addInbox({ ...state, handoffs: [action.handoff, ...state.handoffs], assignments: state.assignments.map((entry) => entry.id === action.handoff.assignmentId ? { ...entry, caregiver: action.handoff.to, acknowledgedAt: undefined } : entry) }, { id: uid('inbox'), kind: 'HANDOFF', title: `Handoff to ${action.handoff.to}`, detail: 'Pending acknowledgement.', source: action.handoff.from, personId: state.assignments.find((entry) => entry.id === action.handoff.assignmentId)?.personId ?? 'dad', at: action.handoff.at, status: 'NEEDS REVIEW', target: 'care', targetId: action.handoff.id }, `Care handoff sent to ${action.handoff.to}.`);
    case 'ACCEPT_HANDOFF': {
      const handoff = state.handoffs.find((entry) => entry.id === action.handoffId);
      if (!handoff) return state;
      return { ...state, handoffs: state.handoffs.map((entry) => entry.id === handoff.id ? { ...entry, status: 'ACKNOWLEDGED', acknowledgedAt: action.at } : entry), assignments: state.assignments.map((entry) => entry.id === handoff.assignmentId ? { ...entry, acknowledgedAt: action.at } : entry), inbox: state.inbox.map((item) => item.targetId === handoff.id ? { ...item, status: 'RESOLVED' } : item), activity: [`${handoff.to} acknowledged the handoff at ${action.at}.`, ...state.activity] };
    }
    case 'CREATE_TRAVEL':
      return addInbox({ ...state, travel: action.travel }, { id: uid('inbox'), kind: 'TRAVEL', title: `${people[action.travel.personId].label}'s travel checklist created`, detail: `${action.travel.start} to ${action.travel.end}. Confirm actual packed quantities.`, source: 'Travel mode', personId: action.travel.personId, at: timeNow(), status: 'NEEDS REVIEW', target: 'care' }, `${people[action.travel.personId].label}'s travel checklist created.`);
    case 'PACK_TRAVEL': {
      if (!state.travel || state.travel.packed[action.recordId] !== undefined || !Number.isInteger(action.quantity) || action.quantity < 1) return state;
      const record = state.records.find((item) => item.id === action.recordId && item.confirmed && !item.archived && item.personId === state.travel?.personId);
      if (!record) return state;
      const source = state.packages.find((item) => item.id === action.packageId && item.recordId === record.id && item.location !== 'Travel Pouch');
      if (action.packageId && !source) return state;
      if (source?.quantity !== null && source?.quantity !== undefined && action.quantity > source.quantity) return state;
      let packages = state.packages;
      if (source && source.quantity === action.quantity) {
        packages = packages.map((item) => item.id === source.id ? { ...item, previousLocation: item.location, location: 'Travel Pouch' } : item);
      } else {
        const pouchItem: MedicinePackage = { id: uid('pouch'), recordId: record.id, sourcePackageId: source?.id, owner: record.personId, name: record.name, strength: record.strength, quantity: action.quantity, location: 'Travel Pouch', previousLocation: source?.location ?? 'Other', shelf: 'Travel pouch', lastScanned: 'Packing confirmation' };
        packages = [pouchItem, ...packages.map((item) => item.id === source?.id && item.quantity !== null ? { ...item, quantity: item.quantity - action.quantity } : item)];
      }
      return { ...state, travel: { ...state.travel, status: 'ACTIVE', packed: { ...state.travel.packed, [action.recordId]: action.quantity } }, packages, activity: [`${record.name} marked packed (${action.quantity} recorded).`, ...state.activity] };
    }
    case 'RETURN_TRAVEL': {
      if (!state.travel || state.travel.status === 'RETURNED') return state;
      const pouch = state.packages.filter((item) => item.location === 'Travel Pouch');
      if (pouch.some((item) => !Number.isInteger(action.remaining[item.id]) || action.remaining[item.id] < 0)) return state;
      const packages = state.packages.filter((item) => !(item.location === 'Travel Pouch' && item.sourcePackageId)).map((item) => {
        const returned = pouch.find((entry) => entry.sourcePackageId === item.id);
        if (returned) return { ...item, quantity: item.quantity === null ? null : item.quantity + action.remaining[returned.id] };
        if (item.location === 'Travel Pouch') return { ...item, quantity: action.remaining[item.id], location: item.previousLocation ?? 'Other', previousLocation: undefined, shelf: item.shelf === 'Travel pouch' ? 'Location unconfirmed' : item.shelf };
        return item;
      });
      return { ...state, travel: { ...state.travel, status: 'RETURNED' }, packages, activity: ['Travel pouch returned to home cabinet with confirmed remaining quantities.', ...state.activity] };
    }
    case 'ADD_OBSERVATION':
      return addInbox({ ...state, observations: [action.observation, ...state.observations] }, { id: uid('inbox'), kind: 'CAREGIVER NOTE', title: `Observation about ${people[action.observation.personId].label}`, detail: action.observation.text, source: action.observation.caregiver, personId: action.observation.personId, at: action.observation.at, status: 'CONFIRMED', target: 'visit' }, `${action.observation.caregiver} recorded a family observation.`);
    case 'ADD_PURCHASES': {
      let packages = state.packages;
      for (const purchase of action.purchases) {
        const match = state.records.find((record) => record.personId === purchase.personId && !record.archived && record.name.toLowerCase() === purchase.name.toLowerCase() && record.strength.toLowerCase() === purchase.strength.toLowerCase());
        if (match) {
          const existing = packages.find((item) => item.recordId === match.id);
          packages = existing ? packages.map((item) => item.id === existing.id ? { ...item, quantity: item.quantity === null ? purchase.quantity : item.quantity + purchase.quantity } : item) : [{ id: uid('pkg'), recordId: match.id, owner: purchase.personId, name: purchase.name, strength: purchase.strength, quantity: purchase.quantity, location: 'Other', shelf: 'Location unconfirmed', lastScanned: purchase.date }, ...packages];
        }
      }
      return addInbox({ ...state, purchases: [...action.purchases, ...state.purchases], packages }, { id: uid('inbox'), kind: 'PHARMACY BILL', title: `${action.purchases.length} purchase items confirmed`, detail: 'Recorded purchase quantities were added to the cabinet. Purchase does not prove use.', source: 'Pharmacy bill', personId: action.purchases[0]?.personId ?? 'dad', at: timeNow(), status: 'CONFIRMED', target: 'cabinet' }, `${action.purchases.length} pharmacy purchase items confirmed.`);
    }
    case 'ADD_INBOX':
      return addInbox(state, action.item, `${action.item.kind.toLowerCase()} added for review.`);
    case 'SET_INBOX_STATUS':
      return { ...state, inbox: state.inbox.map((item) => item.id === action.itemId ? { ...item, status: action.status } : item) };
    case 'UPDATE_ROUTINE':
      return addInbox({ ...state, records: state.records.map((entry) => entry.id === action.recordId ? { ...entry, routine: action.routine, dailyEvents: action.dailyEvents, source: `Family confirmed after visit, ${new Date().toLocaleDateString('en-IN')}` } : entry) }, { id: uid('inbox'), kind: 'POST-VISIT', title: 'Confirmed routine updated', detail: 'A caregiver explicitly confirmed this routine after the visit.', source: 'Post-visit check', personId: state.records.find((entry) => entry.id === action.recordId)?.personId ?? 'dad', at: timeNow(), status: 'CONFIRMED', target: 'plan' }, 'Confirmed routine updated after visit.');
    case 'ARCHIVE_RECORD':
      return addInbox({ ...state, records: state.records.map((entry) => entry.id === action.recordId ? { ...entry, archived: true, dailyEvents: 0 } : entry) }, { id: uid('inbox'), kind: 'ARCHIVED MEDICINE', title: 'Medication record archived', detail: 'Historical record and reports remain available.', source: 'Post-visit check', personId: state.records.find((entry) => entry.id === action.recordId)?.personId ?? 'dad', at: timeNow(), status: 'CONFIRMED', target: 'plan' }, 'A confirmed medication record was archived.');
    case 'SET_ALLERGY':
      return { ...state, allergies: { ...state.allergies, [action.personId]: action.value } };
    case 'SET_CONTACT':
      return { ...state, contacts: { ...state.contacts, [action.caregiver]: action.value } };
  }
}
