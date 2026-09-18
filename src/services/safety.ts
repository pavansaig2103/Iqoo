import type { MedicationExtraction } from '../types';

export const requiredFields: Array<keyof MedicationExtraction['fields']> = [
  'medicineName',
  'strength',
  'dose',
  'frequency',
];

export function isPlanCreatable(medications: MedicationExtraction[]) {
  return medications.length > 0 && medications.every((medication) => {
    const requiredVerified = requiredFields.every((fieldName) => {
      const field = medication.fields[fieldName];
      return Boolean(field.value?.trim()) && field.verificationStatus === 'user_verified';
    });
    const food = medication.fields.foodInstruction;
    const foodVerified = !food.value || food.verificationStatus === 'user_verified';
    const supportedFrequency = medication.fields.frequency.value === 'Twice daily' || medication.fields.frequency.value === 'At night';
    return requiredVerified && foodVerified && supportedFrequency;
  });
}

export function needsClinicalFollowUp(medications: MedicationExtraction[]) {
  return medications.some((medication) =>
    Object.values(medication.fields).some((field) => field.verificationStatus === 'missing' || field.verificationStatus === 'unresolved'),
  );
}
