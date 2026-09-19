export interface Patient {
  id: string;
  name: string;
  relation: string;
  age: number;
}

export interface Caregiver {
  id: string;
  name: string;
  role: string;
  initials: string;
}

export interface CareCircle {
  id: string;
  patientId: string;
  caregiverIds: string[];
}

export interface MedicationResponsibility {
  id: string;
  patientId: string;
  medicationId: string;
  caregiverId: string;
  period: 'Morning' | 'Afternoon' | 'Night';
  status: 'assigned' | 'handoff_requested' | 'accepted';
}
