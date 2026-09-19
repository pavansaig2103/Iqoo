import type { MedicationSnapshot } from '../medications/models';

export type MedicationChangeType =
  | 'ADDED'
  | 'NOT_PRESENT_IN_NEW_VERSION'
  | 'STRENGTH_CHANGED'
  | 'FREQUENCY_CHANGED'
  | 'TIMING_TEXT_CHANGED'
  | 'FOOD_INSTRUCTION_CHANGED'
  | 'UNCHANGED'
  | 'UNCERTAIN';

export interface MedicationChange {
  id: string;
  medicationName: string;
  planMedicationId: string;
  type: MedicationChangeType;
  previousValue?: string;
  currentValue?: string;
  note: string;
  requiresClarification: boolean;
}

export interface PrescriptionVersion {
  id: string;
  versionNumber: number;
  patientId: string;
  doctorName: string;
  capturedAt: string;
  status: 'extracted' | 'reviewed' | 'verified';
  rawText: string;
  medications: MedicationSnapshot[];
  changesFromPrevious: MedicationChange[];
}
