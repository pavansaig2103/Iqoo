import type { RoutinePeriod } from '../medications/models';

export interface ScheduledDose {
  id: string;
  patientId: string;
  medicationId: string;
  medicationName: string;
  strength: string;
  dose: string;
  foodInstruction: string;
  period: RoutinePeriod;
  time: string;
  prescriptionVersionId: string;
}
