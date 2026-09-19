export type ClarificationOrigin =
  | 'OCR uncertainty'
  | 'missing prescription field'
  | 'prescription-version difference'
  | 'medicine-at-home mismatch'
  | 'voice parsing uncertainty'
  | 'caregiver disagreement';

export type ClarificationStatus = 'open' | 'family_asked' | 'professional_review_requested' | 'unresolved' | 'resolved';

export interface ClarificationItem {
  id: string;
  patientId: string;
  origin: ClarificationOrigin;
  title: string;
  detail: string;
  sourceLabel: string;
  status: ClarificationStatus;
}
