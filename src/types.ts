export type Screen =
  | 'home'
  | 'scan'
  | 'processing'
  | 'review'
  | 'grounding'
  | 'verified'
  | 'routine'
  | 'family'
  | 'activity'
  | 'privacy';

export type VerificationStatus = 'verified' | 'needs_confirmation' | 'missing' | 'user_verified' | 'unresolved';
export type DoseStatus = 'pending' | 'self_reported_taken' | 'missed' | 'unsure';
export type LanguageCode = 'en' | 'te';

export interface FieldValue<T = string> {
  value: T | null;
  confidence: number;
  sourceText: string | null;
  verificationStatus: VerificationStatus;
}

export interface MedicationExtraction {
  id: string;
  displayName: string;
  fields: {
    medicineName: FieldValue;
    strength: FieldValue;
    dose: FieldValue;
    frequency: FieldValue;
    duration: FieldValue;
    foodInstruction: FieldValue;
    specialInstruction: FieldValue;
  };
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorName: string;
  capturedAt: string;
  rawText: string;
  medications: MedicationExtraction[];
}

export interface PatientProfile {
  id: string;
  name: string;
  relation: string;
  age: number;
  progress: {
    completed: number;
    total: number;
    next: string;
    pending: number;
  };
}

export interface ScheduleDose {
  id: string;
  patientId: string;
  medicationName: string;
  strength: string;
  dose: string;
  foodInstruction: string;
  period: 'Morning' | 'Afternoon' | 'Night';
  time: string;
  status: DoseStatus;
  recordedAt?: string;
}

export interface ActivityStats {
  scheduledDoses: number;
  markedTaken: number;
  missed: number;
  unresolved: number;
  afternoonMissedPattern: number;
}
