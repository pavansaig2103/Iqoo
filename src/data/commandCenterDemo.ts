import type { MedicationState } from '../domain/medications/state';

export type PatientId = 'father' | 'mother';
export type TabId = 'today' | 'medicines' | 'changes' | 'cabinet' | 'history' | 'careTeam' | 'nextVisit';
export type EventStatus = 'TAKEN' | 'MISSED' | 'UNSURE' | 'NOT_AVAILABLE' | 'PENDING';
export type AttentionKind = 'PRESCRIPTION CHANGE' | 'MEDICINE MISMATCH' | 'SUPPLY' | 'UNSURE EVENT';

export interface FamilyMember {
  id: PatientId;
  name: string;
  label: string;
  age: number;
  todayDots: string;
  todaySummary: string;
  next: string;
  attention: number;
  supply: string;
  routineComplete: boolean;
}

export interface CareEvent {
  id: string;
  patientId: PatientId;
  period: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
  time: string;
  medicines: string[];
  instruction: string;
  status: EventStatus;
  reportedBy?: string;
  reportedAt?: string;
  reason?: string;
  sourcePrescription: string;
}

export interface AttentionItem {
  id: string;
  kind: AttentionKind;
  patientId: PatientId;
  title: string;
  detail: string;
  action: string;
}

export interface CabinetItem {
  id: string;
  patientId: PatientId;
  name: string;
  strength: string;
  matchState: 'MATCHED' | 'STRENGTH DIFFERENCE' | 'NOT IN CURRENT CONFIRMED PLAN' | 'NOT FOUND AT HOME' | 'EXPIRY NEEDS REVIEW' | 'UNKNOWN PACKAGE';
  quantity?: number;
}

export interface ChangeItem {
  id: string;
  patientId: PatientId;
  type: 'NEWLY LISTED' | 'CHANGED' | 'NOT FOUND IN NEW DOCUMENT' | 'UNCLEAR';
  medicine: string;
  previous?: string;
  current?: string;
  status: string;
  detail: string;
}

export interface StoryEvent {
  id: string;
  date: string;
  title: string;
  detail: string;
  meta: string;
}

export const familyMembers: FamilyMember[] = [
  {
    id: 'father',
    name: 'Ramesh Rao',
    label: 'Father',
    age: 67,
    todayDots: '●●●●○',
    todaySummary: '4 of 5 medication events updated',
    next: '8:00 PM · 2 medicines',
    attention: 2,
    supply: '1 medicine running low',
    routineComplete: false,
  },
  {
    id: 'mother',
    name: 'Lakshmi Rao',
    label: 'Mother',
    age: 62,
    todayDots: '●●●',
    todaySummary: '3 of 3 updated',
    next: 'Routine complete',
    attention: 0,
    supply: 'No unresolved items',
    routineComplete: true,
  },
];

export const medicineStates: MedicationState[] = [
  {
    medicationIdentity: 'Metformin 500 mg',
    prescriptionStatus: 'Confirmed',
    verificationStatus: 'Verified by Pavan',
    homeAvailability: 'Available at home',
    homePackageMatch: 'Package matched',
    supplyStatus: '4 tablets remaining',
    scheduleStatus: 'Morning updated · Evening pending',
    latestEvent: 'Morning dose marked taken by Mother',
    latestPrescriptionChange: 'Sep 18 · Frequency changed',
    assignedCaregiver: 'Pavan tonight',
    unresolvedIssues: [],
  },
  {
    medicationIdentity: 'Amlodipine 5 mg',
    prescriptionStatus: 'Confirmed in plan',
    verificationStatus: 'Verified by Pavan',
    homeAvailability: 'Amlodipine 10 mg found',
    homePackageMatch: 'Strength difference',
    supplyStatus: '12 tablets recorded',
    scheduleStatus: 'Morning updated',
    latestEvent: 'Morning status taken',
    latestPrescriptionChange: 'Sep 18 · Newly listed',
    assignedCaregiver: 'Mother',
    unresolvedIssues: ['Package strength needs review'],
  },
  {
    medicationIdentity: 'Atorvastatin 10 mg',
    prescriptionStatus: 'Not found in latest document',
    verificationStatus: 'Needs clarification',
    homeAvailability: 'Package in cabinet',
    homePackageMatch: 'Not in current confirmed plan',
    supplyStatus: 'Quantity unknown',
    scheduleStatus: 'Held for review',
    latestEvent: 'No current event',
    latestPrescriptionChange: 'Sep 18 · Not detected',
    assignedCaregiver: 'Pavan',
    unresolvedIssues: ['Previous medicine absent from latest prescription'],
  },
  {
    medicationIdentity: 'Pantoprazole 40 mg',
    prescriptionStatus: 'Confirmed',
    verificationStatus: 'Verified by Mother',
    homeAvailability: 'Current plan medicine not found in cabinet',
    homePackageMatch: 'Not found at home',
    supplyStatus: 'Unknown',
    scheduleStatus: 'Before breakfast pending',
    latestEvent: 'No update today',
    latestPrescriptionChange: 'Aug 28 · First appeared',
    assignedCaregiver: 'Mother',
    unresolvedIssues: ['Current plan medicine not found in cabinet'],
  },
  {
    medicationIdentity: 'Vitamin D3',
    prescriptionStatus: 'Confirmed',
    verificationStatus: 'Verified by Pavan',
    homeAvailability: 'Available',
    homePackageMatch: 'Matched',
    supplyStatus: '6 capsules remaining',
    scheduleStatus: 'Weekly dose not due today',
    latestEvent: 'Last weekly event completed',
    latestPrescriptionChange: 'Stable',
    assignedCaregiver: 'Pavan',
    unresolvedIssues: [],
  },
];

export const todayEvents: CareEvent[] = [
  { id: 'morning-metformin', patientId: 'father', period: 'MORNING', time: '8:00 AM', medicines: ['Metformin 500 mg'], instruction: 'After food', status: 'TAKEN', reportedBy: 'Mother', reportedAt: '8:07 AM', sourcePrescription: 'Prescription v3' },
  { id: 'morning-amlodipine', patientId: 'father', period: 'MORNING', time: '8:30 AM', medicines: ['Amlodipine 5 mg'], instruction: 'With morning routine', status: 'TAKEN', reportedBy: 'Mother', reportedAt: '8:10 AM', sourcePrescription: 'Prescription v3' },
  { id: 'afternoon-med', patientId: 'father', period: 'AFTERNOON', time: '1:00 PM', medicines: ['Pantoprazole 40 mg'], instruction: 'Before food', status: 'UNSURE', reportedBy: 'Mother', reportedAt: '1:14 PM', reason: 'Mother was not sure', sourcePrescription: 'Prescription v3' },
  { id: 'evening-metformin', patientId: 'father', period: 'EVENING', time: '8:00 PM', medicines: ['Metformin 500 mg', 'Atorvastatin 10 mg'], instruction: 'Evening routine', status: 'PENDING', sourcePrescription: 'Prescription v3' },
  { id: 'night-vitd', patientId: 'father', period: 'NIGHT', time: '9:30 PM', medicines: ['Vitamin D3'], instruction: 'Weekly capsule if due', status: 'TAKEN', reportedBy: 'Pavan', reportedAt: '9:34 PM', sourcePrescription: 'Prescription v2' },
];

export const attentionItems: AttentionItem[] = [
  { id: 'change-radar', kind: 'PRESCRIPTION CHANGE', patientId: 'father', title: 'Dad\'s latest prescription differs from the previous one.', detail: '3 changes need review', action: 'Review Changes' },
  { id: 'mismatch', kind: 'MEDICINE MISMATCH', patientId: 'father', title: 'Dad · Amlodipine strength differs', detail: 'Prescription: Amlodipine 5 mg · Medicine at home: Amlodipine 10 mg', action: 'Review' },
  { id: 'supply-low', kind: 'SUPPLY', patientId: 'father', title: 'Metformin', detail: 'Approx. 4 doses remaining', action: 'Update Supply' },
  { id: 'unsure-event', kind: 'UNSURE EVENT', patientId: 'father', title: 'Dad\'s 1:00 PM medicine was marked "Unsure"', detail: 'Resolve without assuming missed or taken', action: 'Resolve' },
];

export const changes: ChangeItem[] = [
  { id: 'new-amlodipine', patientId: 'father', type: 'NEWLY LISTED', medicine: 'Amlodipine 5 mg', current: '5 mg morning', status: 'Ready for caregiver review', detail: 'Newly listed in latest document.' },
  { id: 'changed-metformin', patientId: 'father', type: 'CHANGED', medicine: 'Metformin', previous: 'Once daily', current: 'Twice daily', status: 'Verified by Pavan', detail: 'Frequency changed.' },
  { id: 'not-found-atorvastatin', patientId: 'father', type: 'NOT FOUND IN NEW DOCUMENT', medicine: 'Atorvastatin', previous: '10 mg at night', current: 'Not detected', status: 'Needs clarification', detail: 'Not found in new document. We do not infer discontinued.' },
  { id: 'unclear-duration', patientId: 'father', type: 'UNCLEAR', medicine: 'Pantoprazole', current: 'Duration not detected', status: 'We won\'t guess', detail: 'No duration detected.' },
];

export const cabinetItems: CabinetItem[] = [
  { id: 'cab-metformin', patientId: 'father', name: 'Metformin', strength: '500 mg', matchState: 'MATCHED', quantity: 4 },
  { id: 'cab-amlodipine', patientId: 'father', name: 'Amlodipine', strength: '10 mg', matchState: 'STRENGTH DIFFERENCE', quantity: 12 },
  { id: 'cab-atorvastatin', patientId: 'father', name: 'Atorvastatin', strength: '10 mg', matchState: 'NOT IN CURRENT CONFIRMED PLAN' },
  { id: 'cab-pantoprazole', patientId: 'father', name: 'Pantoprazole', strength: '40 mg', matchState: 'NOT FOUND AT HOME' },
];

export const medicationStories: Record<string, StoryEvent[]> = {
  'Metformin 500 mg': [
    { id: 'met-1', date: 'SEP 19', title: 'Morning dose marked taken', detail: 'Reported by Mother', meta: 'Medication event' },
    { id: 'met-2', date: 'SEP 18', title: 'Prescription updated', detail: 'Frequency changed: Once daily to Twice daily', meta: 'Verified by Pavan' },
    { id: 'met-3', date: 'SEP 18', title: 'Medicine package scanned', detail: 'Metformin 500 mg matched', meta: 'Medicine cabinet' },
    { id: 'met-4', date: 'AUG 28', title: 'Medicine first appeared', detail: 'Captured in prescription history', meta: 'Prescription v1' },
  ],
};

export const careTeam = [
  { id: 'pavan', name: 'Pavan', role: 'Primary caregiver', accent: 'blue' },
  { id: 'mother', name: 'Mother', role: 'Morning routine', accent: 'lavender' },
  { id: 'ananya', name: 'Ananya', role: 'Backup caregiver', accent: 'green' },
];

export const careActivity = [
  '8:07 AM · Mother marked morning medicine taken.',
  '1:14 PM · Mother marked Medicine B unsure.',
  '5:42 PM · Pavan reviewed new prescription change.',
];

export const history = [
  'Sep 19 · Morning dose marked taken by Mother',
  'Sep 19 · Afternoon event unresolved',
  'Sep 18 · New prescription received',
  'Sep 18 · Change Radar found 1 new, 1 changed, 1 not found, 1 unclear',
  'Sep 18 · Amlodipine 10 mg package scanned at home',
  'Sep 17 · Metformin supply updated to 4 tablets',
  'Sep 16 · Evening routine handed to Pavan',
];

export const nextVisit = {
  sinceLastVisit: [
    '2 prescription changes',
    '3 missed medication events',
    '2 unavailable-medication events',
    '1 unresolved medication status',
    '1 medicine-package mismatch',
  ],
  questions: [
    'Atorvastatin was not found in the latest prescription. Should its status be clarified?',
    'Amlodipine package at home is 10 mg while plan says 5 mg. Please confirm what the family should do next.',
  ],
  notes: ['Reported dizziness Tuesday evening.', 'Metformin supply appears low based on recorded quantity.'],
};
