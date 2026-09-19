import type { FieldValue } from '../trust/models';

export type RoutinePeriod = 'Morning' | 'Afternoon' | 'Night';

export interface MedicationSnapshot {
  id: string;
  planMedicationId: string;
  displayName: string;
  medicineName: FieldValue;
  strength: FieldValue;
  dose: FieldValue;
  frequency: FieldValue;
  timingText: FieldValue;
  foodInstruction: FieldValue;
  duration: FieldValue;
  specialInstruction: FieldValue;
}

export interface MedicationPlanEntry {
  id: string;
  patientId: string;
  medicineName: string;
  strength: string;
  dose: string;
  frequency: string;
  timingText: string;
  foodInstruction: string;
  sourcePrescriptionVersionId: string;
  verified: boolean;
  supplyId?: string;
}
