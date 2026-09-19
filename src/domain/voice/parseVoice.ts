import type { ScheduledDose } from '../schedule/models';
import type { ProposedVoiceAction } from './models';

export function parseVoiceUtterance(utterance: string, doses: ScheduledDose[]): ProposedVoiceAction {
  const normalized = utterance.toLowerCase();
  const period = normalized.includes('morning')
    ? 'Morning'
    : normalized.includes('afternoon')
      ? 'Afternoon'
      : normalized.includes('night')
        ? 'Night'
        : 'Unknown';
  const patientLabel = normalized.includes('mom') || normalized.includes('mother') ? 'Mother' : 'Father';
  const proposedStatus = normalized.includes('not sure')
    ? 'UNSURE'
    : normalized.includes('finished') || normalized.includes('not available')
      ? 'NOT_AVAILABLE'
      : normalized.includes('missed')
        ? 'MISSED'
        : 'TAKEN';
  const periodDoses = doses.filter((dose) => period !== 'Unknown' && dose.period === period);
  const matchedDose =
    periodDoses.length === 1
      ? periodDoses[0]
      : doses.find((dose) => normalized.includes(dose.medicationName.toLowerCase()));

  return {
    patientId: patientLabel === 'Father' ? 'father' : 'mother',
    patientLabel,
    medicationId: matchedDose?.medicationId,
    medicationLabel: matchedDose?.medicationName ?? (period === 'Unknown' ? 'Unclear medicine' : `${period} routine`),
    period,
    proposedStatus,
    reason: normalized.includes('finished') ? 'Medicine is finished' : undefined,
    confidence: matchedDose && period !== 'Unknown' ? 'high' : 'needs_review',
    sourceUtterance: utterance,
  };
}
