import type { RoutinePeriod } from '../medications/models';

export type MedicationEventStatus = 'TAKEN' | 'MISSED' | 'UNSURE' | 'NOT_AVAILABLE';

export interface MedicationEvent {
  id: string;
  patientId: string;
  scheduledDoseId: string;
  medicationId: string;
  medicationName: string;
  scheduledTime: string;
  period: RoutinePeriod;
  status: MedicationEventStatus;
  reportedByCaregiverId: string;
  reportedAt: string;
  reason?: string;
  voiceNote?: string;
  prescriptionVersionId: string;
}
