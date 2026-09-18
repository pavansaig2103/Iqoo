import type { ActivityStats, PatientProfile, Prescription, ScheduleDose } from '../types';

export const patientProfiles: PatientProfile[] = [
  {
    id: 'father',
    name: 'Ramesh',
    relation: 'Father',
    age: 67,
    progress: { completed: 4, total: 5, next: '8:00 PM', pending: 1 },
  },
  {
    id: 'mother',
    name: 'Lakshmi',
    relation: 'Mother',
    age: 62,
    progress: { completed: 3, total: 3, next: 'All done today', pending: 0 },
  },
];

export const demoPrescription: Prescription = {
  id: 'rx-father-001',
  patientId: 'father',
  doctorName: 'Dr. Meera Iyer',
  capturedAt: '2026-09-18T09:00:00.000Z',
  rawText:
    'Dr. Meera Iyer\nTAB PARACETAMOL 500MG\n1 TAB BD PC\nTAB CETIRIZINE 10MG\n1 TAB HS\nReview after fever settles',
  medications: [
    {
      id: 'med-paracetamol',
      displayName: 'Paracetamol',
      fields: {
        medicineName: { value: 'Paracetamol', confidence: 0.97, sourceText: 'TAB PARACETAMOL', verificationStatus: 'verified' },
        strength: { value: '500 mg', confidence: 0.95, sourceText: '500MG', verificationStatus: 'verified' },
        dose: { value: '1 tablet', confidence: 0.93, sourceText: '1 TAB', verificationStatus: 'verified' },
        frequency: { value: 'Twice daily', confidence: 0.82, sourceText: 'BD', verificationStatus: 'needs_confirmation' },
        duration: { value: null, confidence: 0, sourceText: null, verificationStatus: 'missing' },
        foodInstruction: { value: 'After food', confidence: 0.9, sourceText: 'PC', verificationStatus: 'needs_confirmation' },
        specialInstruction: { value: null, confidence: 0, sourceText: null, verificationStatus: 'missing' },
      },
    },
    {
      id: 'med-cetirizine',
      displayName: 'Cetirizine',
      fields: {
        medicineName: { value: 'Cetirizine', confidence: 0.96, sourceText: 'TAB CETIRIZINE', verificationStatus: 'verified' },
        strength: { value: '10 mg', confidence: 0.94, sourceText: '10MG', verificationStatus: 'verified' },
        dose: { value: '1 tablet', confidence: 0.92, sourceText: '1 TAB', verificationStatus: 'verified' },
        frequency: { value: 'At night', confidence: 0.88, sourceText: 'HS', verificationStatus: 'needs_confirmation' },
        duration: { value: null, confidence: 0, sourceText: null, verificationStatus: 'missing' },
        foodInstruction: { value: null, confidence: 0, sourceText: null, verificationStatus: 'missing' },
        specialInstruction: { value: 'Review after fever settles', confidence: 0.86, sourceText: 'Review after fever settles', verificationStatus: 'needs_confirmation' },
      },
    },
  ],
};

export const initialDoses: ScheduleDose[] = [
  {
    id: 'dose-morning-paracetamol',
    patientId: 'father',
    medicationName: 'Paracetamol',
    strength: '500 mg',
    dose: '1 tablet',
    foodInstruction: 'After food',
    period: 'Morning',
    time: '08:00',
    status: 'self_reported_taken',
  },
  {
    id: 'dose-night-paracetamol',
    patientId: 'father',
    medicationName: 'Paracetamol',
    strength: '500 mg',
    dose: '1 tablet',
    foodInstruction: 'After food',
    period: 'Night',
    time: '20:00',
    status: 'pending',
  },
  {
    id: 'dose-night-cetirizine',
    patientId: 'father',
    medicationName: 'Cetirizine',
    strength: '10 mg',
    dose: '1 tablet',
    foodInstruction: '',
    period: 'Night',
    time: '20:30',
    status: 'pending',
  },
];

export const activityStats: ActivityStats = {
  scheduledDoses: 28,
  markedTaken: 24,
  missed: 3,
  unresolved: 1,
  afternoonMissedPattern: 2,
};
