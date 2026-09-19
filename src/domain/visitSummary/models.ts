export interface VisitQuestion {
  id: string;
  patientId: string;
  text: string;
  createdByCaregiverId: string;
}

export interface VisitSummary {
  patientId: string;
  currentMedications: string[];
  prescriptionChanges: string[];
  eventHistory: string[];
  caregiverNotes: string[];
  unresolvedItems: string[];
  familyQuestions: string[];
}
