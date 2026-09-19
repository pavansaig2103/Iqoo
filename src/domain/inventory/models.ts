export type SupplyStatus = 'AVAILABLE' | 'RUNNING_LOW' | 'NOT_AVAILABLE' | 'UNKNOWN';

export interface MedicationSupply {
  id: string;
  patientId: string;
  medicationId: string;
  availableQuantity: number | null;
  unitLabel: string;
  status: SupplyStatus;
  updatedByCaregiverId: string;
  updatedAt: string;
}

export interface SupplyEstimate {
  medicationId: string;
  approximateDosesRemaining: number | null;
  approximateDaysRemaining: number | null;
  label: string;
}
