export interface MedicationState {
  medicationIdentity: string;
  prescriptionStatus: string;
  verificationStatus: string;
  homeAvailability: string;
  homePackageMatch: string;
  supplyStatus: string;
  scheduleStatus: string;
  latestEvent: string;
  latestPrescriptionChange: string;
  assignedCaregiver: string;
  unresolvedIssues: string[];
}
