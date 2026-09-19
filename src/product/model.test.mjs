import assert from 'node:assert/strict';
import test from 'node:test';
import { eventStatus, householdReducer, initialHousehold, packageRelation, parseVoiceUpdate, supplyState } from './model.ts';

const fresh = () => structuredClone(initialHousehold);

test('no report stays distinct from missed, then resolves its inbox item after a report', () => {
  const before = fresh();
  assert.equal(eventStatus(before.events.find((item) => item.id === 'evt-dad-pan-pm')), 'NO_REPORT');
  const after = householdReducer(before, { type: 'REPORT_EVENT', eventId: 'evt-dad-pan-pm', report: { id: 'r-new', caregiver: 'Pavan', status: 'NOT_AVAILABLE', at: '2:00 PM', context: 'Medicine unavailable' } });
  assert.equal(eventStatus(after.events.find((item) => item.id === 'evt-dad-pan-pm')), 'NOT_AVAILABLE');
  assert.equal(after.inbox.find((item) => item.id === 'inbox-no-report').status, 'RESOLVED');
  assert.equal(after.inbox[0].status, 'NEEDS REVIEW');
});

test('duplicate reports are ignored while conflicting reports are kept and can be resolved', () => {
  const before = fresh();
  const duplicate = householdReducer(before, { type: 'REPORT_EVENT', eventId: 'evt-dad-met-am', report: { id: 'r-duplicate', caregiver: 'Pavan', status: 'TAKEN', at: '8:11 AM' } });
  assert.equal(duplicate, before);
  const conflict = householdReducer(before, { type: 'REPORT_EVENT', eventId: 'evt-dad-met-am', report: { id: 'r-conflict', caregiver: 'Pavan', status: 'UNSURE', at: '8:11 AM' } });
  const event = conflict.events.find((item) => item.id === 'evt-dad-met-am');
  assert.equal(eventStatus(event), 'CONFLICT');
  assert.equal(event.reports.length, 2);
  assert.equal(conflict.inbox[0].kind, 'CAREGIVER CONFLICT');
  const resolved = householdReducer(conflict, { type: 'RESOLVE_CONFLICT', eventId: event.id, reportId: 'report-1' });
  assert.equal(eventStatus(resolved.events.find((item) => item.id === event.id)), 'TAKEN');
  assert.equal(resolved.events.find((item) => item.id === event.id).reports.length, 2);
  assert.equal(resolved.inbox.find((item) => item.kind === 'CAREGIVER CONFLICT').status, 'RESOLVED');
});

test('absence opens coverage without changing medication events', () => {
  const before = fresh();
  const absent = householdReducer(before, { type: 'SET_UNAVAILABLE', caregiver: 'Pavan', day: 'Tomorrow' });
  assert.equal(absent.assignments.find((item) => item.id === 'assign-tom-dad-eve').caregiver, null);
  assert.deepEqual(absent.events, before.events);
  const blocked = householdReducer(absent, { type: 'ASSIGN', assignmentId: 'assign-tom-dad-eve', caregiver: 'Pavan' });
  assert.equal(blocked, absent);
  const covered = householdReducer(absent, { type: 'ASSIGN', assignmentId: 'assign-tom-dad-eve', caregiver: 'Mother' });
  assert.equal(covered.assignments.find((item) => item.id === 'assign-tom-dad-eve').caregiver, 'Mother');
  assert.equal(covered.assignments.find((item) => item.id === 'assign-tom-dad-eve').acknowledgedAt, undefined);
});

test('travel pouch splits a package and returns only confirmed remaining quantity', () => {
  const before = fresh();
  const planning = householdReducer(before, { type: 'CREATE_TRAVEL', travel: { personId: 'dad', start: '2026-09-25', end: '2026-09-29', status: 'PLANNING', packed: {} } });
  const packed = householdReducer(planning, { type: 'PACK_TRAVEL', recordId: 'met-dad', packageId: 'pkg-met', quantity: 2 });
  const pouch = packed.packages.find((item) => item.location === 'Travel Pouch' && item.recordId === 'met-dad');
  assert.equal(packed.packages.find((item) => item.id === 'pkg-met').quantity, 3);
  assert.equal(pouch.quantity, 2);
  assert.equal(packed.travel.packed['met-dad'], 2);
  const duplicate = householdReducer(packed, { type: 'PACK_TRAVEL', recordId: 'met-dad', packageId: 'pkg-met', quantity: 1 });
  assert.equal(duplicate, packed);
  const returned = householdReducer(packed, { type: 'RETURN_TRAVEL', remaining: { [pouch.id]: 1 } });
  assert.equal(returned.packages.find((item) => item.id === 'pkg-met').quantity, 4);
  assert.equal(returned.packages.some((item) => item.id === pouch.id), false);
  assert.equal(returned.travel.status, 'RETURNED');
});

test('archived medicines remain identifiable and need review when scanned', () => {
  const before = fresh();
  assert.equal(packageRelation(before, before.packages.find((item) => item.id === 'pkg-ato')), 'ARCHIVED RECORD');
  const after = householdReducer(before, { type: 'ADD_PACKAGE', item: { id: 'new-ato', recordId: 'ato-dad', owner: 'dad', name: 'Atorvastatin', strength: '10 mg', quantity: 4, location: 'Other', shelf: 'Loose strip', lastScanned: 'Today' } });
  assert.equal(after.inbox[0].status, 'NEEDS REVIEW');
  assert.equal(after.records.find((item) => item.id === 'ato-dad').archived, true);
});

test('unassigned packages stay unassigned in the inbox', () => {
  const before = fresh();
  const after = householdReducer(before, { type: 'ADD_PACKAGE', item: { id: 'loose-strip', owner: 'unassigned', name: 'Unknown', strength: '20 mg', quantity: null, location: 'Other', shelf: 'Loose strip', lastScanned: 'Today' } });
  assert.equal(after.packages[0].owner, 'unassigned');
  assert.equal(after.inbox[0].personId, 'unassigned');
  assert.equal(after.inbox[0].status, 'NEEDS REVIEW');
});

test('confirmed bill updates purchase history and recorded supply, not event reports', () => {
  const before = fresh();
  const after = householdReducer(before, { type: 'ADD_PURCHASES', purchases: [{ id: 'purchase-1', personId: 'dad', name: 'Metformin', strength: '500 mg', quantity: 20, price: 240, date: '2026-09-19' }] });
  assert.equal(after.purchases.length, 1);
  assert.equal(supplyState(after, after.records.find((item) => item.id === 'met-dad')).quantity, 25);
  assert.deepEqual(after.events, before.events);
});

test('voice parsing uses family records and rejects ambiguous updates', () => {
  const state = fresh();
  assert.deepEqual(parseVoiceUpdate(state, 'Only four Metformin 500 mg tablets are left.').action, { kind: 'supply', recordId: 'met-dad', quantity: 4 });
  assert.match(parseVoiceUpdate(state, 'Vitamin D3 taken.').error, /more than one family member/i);
  assert.match(parseVoiceUpdate(state, 'Dad took Metformin.').error, /more than one event/i);
  assert.deepEqual(parseVoiceUpdate(state, 'Dad took evening Metformin.').action, { kind: 'event', recordId: 'met-dad', eventId: 'evt-dad-met-eve', status: 'TAKEN' });
  assert.match(parseVoiceUpdate(state, 'Dad evening Metformin.').error, /say whether/i);
});

test('finished supply update synchronizes cabinet, attention, history, and doctor data', () => {
  const before = fresh();
  const parsed = parseVoiceUpdate(before, "Dad's Metformin is finished.").action;
  assert.deepEqual(parsed, { kind: 'supply', recordId: 'met-dad', quantity: 0 });
  const after = householdReducer(before, { type: 'UPDATE_PACKAGE', packageId: 'pkg-met', changes: { quantity: parsed.quantity } });
  assert.equal(supplyState(after, after.records.find((item) => item.id === 'met-dad')).status, 'NOT AVAILABLE');
  assert.equal(after.inbox[0].kind, 'SUPPLY ALERT');
  assert.equal(after.inbox[0].status, 'NEEDS REVIEW');
  assert.equal(after.history[0].recordId, 'met-dad');
  assert.equal(after.history[0].title, 'Supply reported finished');
  assert.match(after.activity[0], /synchronized/i);
});
