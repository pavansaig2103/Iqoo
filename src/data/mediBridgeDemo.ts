import type { CareCircle, Caregiver, MedicationResponsibility, Patient } from '../domain/careCircle/models';
import type { ClarificationItem } from '../domain/clarifications/models';
import type { MedicationEvent } from '../domain/events/models';
import type { MedicationSupply, SupplyEstimate } from '../domain/inventory/models';
import type { MedicationPlanEntry } from '../domain/medications/models';
import type { PrescriptionVersion } from '../domain/prescriptions/models';
import type { HomeMedicinePackage, ReconciliationResult } from '../domain/reconciliation/models';
import type { ScheduledDose } from '../domain/schedule/models';
import type { PatternDetection, TimelineItem } from '../domain/timeline/models';
import type { SafetyInvariant } from '../domain/trust/models';
import type { VisitQuestion, VisitSummary } from '../domain/visitSummary/models';

const source = (sourceId: string, sourceLabel: string, sourceText: string | null) => ({
  sourceId,
  sourceLabel,
  sourceText,
  capturedAt: '2026-09-18T09:00:00.000Z',
});

export const safetyInvariants: SafetyInvariant[] = [
  { id: 'missing', text: 'Missing medication information is never guessed.' },
  { id: 'absence', text: 'Absence from a newer prescription is shown as verification needed, not discontinued.' },
  { id: 'taken', text: 'Taken means self or caregiver reported taken, not verified ingestion.' },
  { id: 'voice', text: 'Voice parsing only creates a proposed action until confirmed.' },
];

export const patients: Patient[] = [
  { id: 'father', name: 'Ramesh Rao', relation: 'Father', age: 67 },
  { id: 'mother', name: 'Lakshmi Rao', relation: 'Mother', age: 62 },
];

export const caregivers: Caregiver[] = [
  { id: 'mother', name: 'Mother', role: 'Primary caregiver', initials: 'M' },
  { id: 'pavan', name: 'Pavan', role: 'Son', initials: 'P' },
  { id: 'home-caregiver', name: 'Home Caregiver', role: 'Day support', initials: 'H' },
];

export const careCircle: CareCircle = {
  id: 'circle-father',
  patientId: 'father',
  caregiverIds: ['mother', 'pavan', 'home-caregiver'],
};

export const prescriptionVersions: PrescriptionVersion[] = [
  {
    id: 'rx-v1',
    versionNumber: 1,
    patientId: 'father',
    doctorName: 'Dr. Meera Iyer',
    capturedAt: '2026-09-11T09:00:00.000Z',
    status: 'verified',
    rawText: 'TAB METFORMIN 500MG\n1 TAB BD AFTER FOOD\nTAB AMLODIPINE 5MG\n1 TAB MORNING',
    changesFromPrevious: [],
    medications: [
      {
        id: 'snap-metformin-v1',
        planMedicationId: 'plan-metformin',
        displayName: 'Metformin',
        medicineName: { value: 'Metformin', confidence: 0.98, sourceText: 'TAB METFORMIN', source: source('rx-v1', 'Prescription v1', 'TAB METFORMIN'), verificationStatus: 'user_verified' },
        strength: { value: '500 mg', confidence: 0.96, sourceText: '500MG', source: source('rx-v1', 'Prescription v1', '500MG'), verificationStatus: 'user_verified' },
        dose: { value: '1 tablet', confidence: 0.94, sourceText: '1 TAB', source: source('rx-v1', 'Prescription v1', '1 TAB'), verificationStatus: 'user_verified' },
        frequency: { value: 'Twice daily', confidence: 0.9, sourceText: 'BD', source: source('rx-v1', 'Prescription v1', 'BD'), verificationStatus: 'user_verified' },
        timingText: { value: 'Morning and night', confidence: 0.9, sourceText: 'BD', source: source('rx-v1', 'Prescription v1', 'BD'), verificationStatus: 'user_verified' },
        foodInstruction: { value: 'After food', confidence: 0.92, sourceText: 'AFTER FOOD', source: source('rx-v1', 'Prescription v1', 'AFTER FOOD'), verificationStatus: 'user_verified' },
        duration: { value: '30 days', confidence: 0.88, sourceText: '30 days', source: source('rx-v1', 'Prescription v1', '30 days'), verificationStatus: 'user_verified' },
        specialInstruction: { value: null, confidence: 0, sourceText: null, verificationStatus: 'missing' },
      },
      {
        id: 'snap-amlodipine-v1',
        planMedicationId: 'plan-amlodipine',
        displayName: 'Amlodipine',
        medicineName: { value: 'Amlodipine', confidence: 0.97, sourceText: 'TAB AMLODIPINE', source: source('rx-v1', 'Prescription v1', 'TAB AMLODIPINE'), verificationStatus: 'user_verified' },
        strength: { value: '5 mg', confidence: 0.94, sourceText: '5MG', source: source('rx-v1', 'Prescription v1', '5MG'), verificationStatus: 'user_verified' },
        dose: { value: '1 tablet', confidence: 0.9, sourceText: '1 TAB', source: source('rx-v1', 'Prescription v1', '1 TAB'), verificationStatus: 'user_verified' },
        frequency: { value: 'Once daily', confidence: 0.89, sourceText: 'MORNING', source: source('rx-v1', 'Prescription v1', 'MORNING'), verificationStatus: 'user_verified' },
        timingText: { value: 'Morning', confidence: 0.91, sourceText: 'MORNING', source: source('rx-v1', 'Prescription v1', 'MORNING'), verificationStatus: 'user_verified' },
        foodInstruction: { value: null, confidence: 0, sourceText: null, verificationStatus: 'missing' },
        duration: { value: '30 days', confidence: 0.85, sourceText: '30 days', source: source('rx-v1', 'Prescription v1', '30 days'), verificationStatus: 'user_verified' },
        specialInstruction: { value: null, confidence: 0, sourceText: null, verificationStatus: 'missing' },
      },
    ],
  },
  {
    id: 'rx-v2',
    versionNumber: 2,
    patientId: 'father',
    doctorName: 'Dr. Meera Iyer',
    capturedAt: '2026-09-18T09:00:00.000Z',
    status: 'extracted',
    rawText: 'TAB METFORMIN 850MG\n1 TAB BD AFTER FOOD\nTAB ATORVASTATIN 10MG\n1 TAB NIGHT\nDuration: not legible',
    medications: [
      {
        id: 'snap-metformin-v2',
        planMedicationId: 'plan-metformin',
        displayName: 'Metformin',
        medicineName: { value: 'Metformin', confidence: 0.98, sourceText: 'TAB METFORMIN', source: source('rx-v2', 'Prescription v2', 'TAB METFORMIN'), verificationStatus: 'user_verified' },
        strength: { value: '850 mg', confidence: 0.94, sourceText: '850MG', source: source('rx-v2', 'Prescription v2', '850MG'), verificationStatus: 'user_verified' },
        dose: { value: '1 tablet', confidence: 0.93, sourceText: '1 TAB', source: source('rx-v2', 'Prescription v2', '1 TAB'), verificationStatus: 'user_verified' },
        frequency: { value: 'Twice daily', confidence: 0.88, sourceText: 'BD', source: source('rx-v2', 'Prescription v2', 'BD'), verificationStatus: 'user_verified' },
        timingText: { value: 'Morning and night', confidence: 0.86, sourceText: 'BD', source: source('rx-v2', 'Prescription v2', 'BD'), verificationStatus: 'user_verified' },
        foodInstruction: { value: 'After food', confidence: 0.9, sourceText: 'AFTER FOOD', source: source('rx-v2', 'Prescription v2', 'AFTER FOOD'), verificationStatus: 'user_verified' },
        duration: { value: null, confidence: 0, sourceText: null, source: source('rx-v2', 'Prescription v2', null), verificationStatus: 'missing' },
        specialInstruction: { value: null, confidence: 0, sourceText: null, verificationStatus: 'missing' },
      },
      {
        id: 'snap-atorvastatin-v2',
        planMedicationId: 'plan-atorvastatin',
        displayName: 'Atorvastatin',
        medicineName: { value: 'Atorvastatin', confidence: 0.97, sourceText: 'TAB ATORVASTATIN', source: source('rx-v2', 'Prescription v2', 'TAB ATORVASTATIN'), verificationStatus: 'user_verified' },
        strength: { value: '10 mg', confidence: 0.94, sourceText: '10MG', source: source('rx-v2', 'Prescription v2', '10MG'), verificationStatus: 'user_verified' },
        dose: { value: '1 tablet', confidence: 0.91, sourceText: '1 TAB', source: source('rx-v2', 'Prescription v2', '1 TAB'), verificationStatus: 'user_verified' },
        frequency: { value: 'Once daily', confidence: 0.87, sourceText: 'NIGHT', source: source('rx-v2', 'Prescription v2', 'NIGHT'), verificationStatus: 'user_verified' },
        timingText: { value: 'Night', confidence: 0.87, sourceText: 'NIGHT', source: source('rx-v2', 'Prescription v2', 'NIGHT'), verificationStatus: 'user_verified' },
        foodInstruction: { value: null, confidence: 0, sourceText: null, verificationStatus: 'missing' },
        duration: { value: null, confidence: 0, sourceText: null, source: source('rx-v2', 'Prescription v2', null), verificationStatus: 'missing' },
        specialInstruction: { value: null, confidence: 0, sourceText: null, verificationStatus: 'missing' },
      },
    ],
    changesFromPrevious: [
      {
        id: 'change-atorvastatin-added',
        medicationName: 'Atorvastatin',
        planMedicationId: 'plan-atorvastatin',
        type: 'ADDED',
        currentValue: '10 mg at night',
        note: 'Newly listed on latest prescription.',
        requiresClarification: false,
      },
      {
        id: 'change-metformin-strength',
        medicationName: 'Metformin',
        planMedicationId: 'plan-metformin',
        type: 'STRENGTH_CHANGED',
        previousValue: '500 mg',
        currentValue: '850 mg',
        note: 'Strength changed between versions.',
        requiresClarification: false,
      },
      {
        id: 'change-amlodipine-absent',
        medicationName: 'Amlodipine',
        planMedicationId: 'plan-amlodipine',
        type: 'NOT_PRESENT_IN_NEW_VERSION',
        previousValue: '5 mg morning',
        note: 'Not present on latest prescription - verify status.',
        requiresClarification: true,
      },
    ],
  },
];

export const confirmedPlan: MedicationPlanEntry[] = [
  {
    id: 'plan-metformin',
    patientId: 'father',
    medicineName: 'Metformin',
    strength: '850 mg',
    dose: '1 tablet',
    frequency: 'Twice daily',
    timingText: 'Morning and night',
    foodInstruction: 'After food',
    sourcePrescriptionVersionId: 'rx-v2',
    verified: true,
    supplyId: 'supply-metformin',
  },
  {
    id: 'plan-atorvastatin',
    patientId: 'father',
    medicineName: 'Atorvastatin',
    strength: '10 mg',
    dose: '1 tablet',
    frequency: 'Once daily',
    timingText: 'Night',
    foodInstruction: '',
    sourcePrescriptionVersionId: 'rx-v2',
    verified: true,
    supplyId: 'supply-atorvastatin',
  },
];

export const scheduledDoses: ScheduledDose[] = [
  { id: 'dose-metformin-morning', patientId: 'father', medicationId: 'plan-metformin', medicationName: 'Metformin', strength: '850 mg', dose: '1 tablet', foodInstruction: 'After food', period: 'Morning', time: '08:00', prescriptionVersionId: 'rx-v2' },
  { id: 'dose-metformin-afternoon', patientId: 'father', medicationId: 'plan-metformin', medicationName: 'Metformin', strength: '850 mg', dose: '1 tablet', foodInstruction: 'After food', period: 'Afternoon', time: '14:00', prescriptionVersionId: 'rx-v2' },
  { id: 'dose-atorvastatin-night', patientId: 'father', medicationId: 'plan-atorvastatin', medicationName: 'Atorvastatin', strength: '10 mg', dose: '1 tablet', foodInstruction: '', period: 'Night', time: '21:00', prescriptionVersionId: 'rx-v2' },
  { id: 'dose-metformin-night', patientId: 'father', medicationId: 'plan-metformin', medicationName: 'Metformin', strength: '850 mg', dose: '1 tablet', foodInstruction: 'After food', period: 'Night', time: '20:00', prescriptionVersionId: 'rx-v2' },
  { id: 'dose-amlodipine-review', patientId: 'father', medicationId: 'plan-amlodipine', medicationName: 'Amlodipine', strength: '5 mg', dose: '1 tablet', foodInstruction: '', period: 'Morning', time: '08:30', prescriptionVersionId: 'rx-v1' },
];

export const initialEvents: MedicationEvent[] = [
  { id: 'event-metformin-morning', patientId: 'father', scheduledDoseId: 'dose-metformin-morning', medicationId: 'plan-metformin', medicationName: 'Metformin', scheduledTime: '08:00', period: 'Morning', status: 'TAKEN', reportedByCaregiverId: 'mother', reportedAt: '2026-09-18T08:06:00.000Z', prescriptionVersionId: 'rx-v2' },
  { id: 'event-atorvastatin-unsure', patientId: 'father', scheduledDoseId: 'dose-atorvastatin-night', medicationId: 'plan-atorvastatin', medicationName: 'Atorvastatin', scheduledTime: '21:00', period: 'Night', status: 'UNSURE', reportedByCaregiverId: 'pavan', reportedAt: '2026-09-17T21:40:00.000Z', reason: 'Family was not at home', prescriptionVersionId: 'rx-v2' },
  { id: 'event-metformin-missed-1', patientId: 'father', scheduledDoseId: 'dose-metformin-afternoon', medicationId: 'plan-metformin', medicationName: 'Metformin', scheduledTime: '14:00', period: 'Afternoon', status: 'MISSED', reportedByCaregiverId: 'home-caregiver', reportedAt: '2026-09-16T14:40:00.000Z', reason: 'Strip was not found', prescriptionVersionId: 'rx-v2' },
  { id: 'event-metformin-missed-2', patientId: 'father', scheduledDoseId: 'dose-metformin-afternoon', medicationId: 'plan-metformin', medicationName: 'Metformin', scheduledTime: '14:00', period: 'Afternoon', status: 'MISSED', reportedByCaregiverId: 'mother', reportedAt: '2026-09-14T14:30:00.000Z', reason: 'Caregiver reported medicine unavailable', prescriptionVersionId: 'rx-v2' },
];

export const responsibilities: MedicationResponsibility[] = [
  { id: 'resp-morning', patientId: 'father', medicationId: 'plan-metformin', caregiverId: 'mother', period: 'Morning', status: 'assigned' },
  { id: 'resp-afternoon', patientId: 'father', medicationId: 'plan-metformin', caregiverId: 'home-caregiver', period: 'Afternoon', status: 'handoff_requested' },
  { id: 'resp-night', patientId: 'father', medicationId: 'plan-atorvastatin', caregiverId: 'pavan', period: 'Night', status: 'accepted' },
];

export const homeMedicinePackages: HomeMedicinePackage[] = [
  {
    id: 'pkg-metformin-500',
    patientId: 'father',
    medicineName: 'Metformin',
    strength: '500 mg',
    expiry: '2027-02',
    packageText: 'METFORMIN 500 MG tablets - Batch MB500 - Exp 02/2027',
    scannedAt: '2026-09-18T10:30:00.000Z',
  },
];

export const reconciliationResults: ReconciliationResult[] = [
  {
    id: 'recon-metformin-strength',
    packageId: 'pkg-metformin-500',
    planMedicationId: 'plan-metformin',
    status: 'STRENGTH_MISMATCH',
    summary: 'Metformin found at home, but strength differs.',
    detail: 'Package says 500 mg. Confirmed plan says 850 mg.',
    needsClarification: true,
  },
];

export const supplies: MedicationSupply[] = [
  { id: 'supply-metformin', patientId: 'father', medicationId: 'plan-metformin', availableQuantity: 2, unitLabel: 'tablets', status: 'RUNNING_LOW', updatedByCaregiverId: 'mother', updatedAt: '2026-09-18T10:35:00.000Z' },
  { id: 'supply-atorvastatin', patientId: 'father', medicationId: 'plan-atorvastatin', availableQuantity: 9, unitLabel: 'tablets', status: 'AVAILABLE', updatedByCaregiverId: 'pavan', updatedAt: '2026-09-18T08:00:00.000Z' },
];

export const supplyEstimates: SupplyEstimate[] = [
  { medicationId: 'plan-metformin', approximateDosesRemaining: 2, approximateDaysRemaining: 1, label: 'Estimate from 2 tablets and confirmed routine only.' },
  { medicationId: 'plan-atorvastatin', approximateDosesRemaining: 9, approximateDaysRemaining: 9, label: 'Estimate from 9 tablets and confirmed routine only.' },
];

export const clarificationItems: ClarificationItem[] = [
  { id: 'clar-duration', patientId: 'father', origin: 'missing prescription field', title: 'Duration not found - We won\'t guess.', detail: 'The latest prescription did not contain a readable duration.', sourceLabel: 'Prescription v2', status: 'open' },
  { id: 'clar-amlodipine', patientId: 'father', origin: 'prescription-version difference', title: 'Amlodipine not present on latest prescription', detail: 'Verify status before changing the home routine.', sourceLabel: 'What Changed?', status: 'open' },
  { id: 'clar-metformin-package', patientId: 'father', origin: 'medicine-at-home mismatch', title: 'Metformin package strength mismatch', detail: 'Home package is 500 mg while confirmed plan is 850 mg.', sourceLabel: 'Medicines at Home', status: 'professional_review_requested' },
];

export const timelineItems: TimelineItem[] = [
  { id: 'tl-rx-change', patientId: 'father', kind: 'prescription_change', timestamp: '2026-09-18T09:00:00.000Z', title: 'New prescription compared', detail: '3 changes detected: added, strength changed, not present on latest version.', meta: 'Prescription v2' },
  { id: 'tl-recon', patientId: 'father', kind: 'clarification', timestamp: '2026-09-18T10:30:00.000Z', title: 'Medicine at home needs review', detail: 'Metformin 500 mg package does not match 850 mg confirmed plan.', meta: 'Strength mismatch' },
];

export const patternDetections: PatternDetection[] = [
  { id: 'pattern-afternoon', text: '3 afternoon doses were marked missed this week.' },
  { id: 'pattern-unavailable', text: 'Metformin was reported unavailable twice.' },
  { id: 'pattern-unresolved', text: '2 medication events remain unresolved.' },
];

export const visitQuestions: VisitQuestion[] = [
  { id: 'q-amlodipine', patientId: 'father', text: 'Should Amlodipine continue if it is not listed on the latest prescription?', createdByCaregiverId: 'pavan' },
  { id: 'q-metformin', patientId: 'father', text: 'Please confirm the correct Metformin strength for home supply.', createdByCaregiverId: 'mother' },
];

export function createVisitSummary(events: MedicationEvent[], clarifications: ClarificationItem[]): VisitSummary {
  return {
    patientId: 'father',
    currentMedications: confirmedPlan.map((entry) => `${entry.medicineName} ${entry.strength} - ${entry.dose}, ${entry.timingText}${entry.foodInstruction ? `, ${entry.foodInstruction}` : ''}`),
    prescriptionChanges: prescriptionVersions[1].changesFromPrevious.map((change) => `${change.medicationName}: ${change.note}`),
    eventHistory: events
      .filter((event) => event.status !== 'TAKEN')
      .slice(0, 5)
      .map((event) => `${event.medicationName} ${event.period}: ${event.status}${event.reason ? ` (${event.reason})` : ''}`),
    caregiverNotes: ['Mother reported Metformin supply is nearly finished.', 'Pavan requested review before changing Amlodipine routine.'],
    unresolvedItems: clarifications.filter((item) => item.status !== 'resolved').map((item) => item.title),
    familyQuestions: visitQuestions.map((question) => question.text),
  };
}
