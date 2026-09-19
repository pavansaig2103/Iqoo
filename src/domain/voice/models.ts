import type { MedicationEventStatus } from '../events/models';
import type { RoutinePeriod } from '../medications/models';

export interface ProposedVoiceAction {
  patientId: string;
  patientLabel: string;
  medicationId?: string;
  medicationLabel: string;
  period: RoutinePeriod | 'Unknown';
  proposedStatus: MedicationEventStatus;
  reason?: string;
  confidence: 'high' | 'needs_review';
  sourceUtterance: string;
}
