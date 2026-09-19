export type HomeMedicineMatchStatus =
  | 'MATCHED'
  | 'STRENGTH_MISMATCH'
  | 'NOT_IN_CURRENT_PLAN'
  | 'UNCERTAIN_MATCH'
  | 'EXPIRED_OR_EXPIRY_REQUIRES_REVIEW';

export interface HomeMedicinePackage {
  id: string;
  patientId: string;
  medicineName: string;
  strength: string;
  expiry: string;
  packageText: string;
  scannedAt: string;
}

export interface ReconciliationResult {
  id: string;
  packageId: string;
  planMedicationId?: string;
  status: HomeMedicineMatchStatus;
  summary: string;
  detail: string;
  needsClarification: boolean;
}
