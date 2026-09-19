export type VerificationStatus = 'verified' | 'needs_confirmation' | 'missing' | 'user_verified' | 'unresolved';

export interface SourceTrace {
  sourceId: string;
  sourceLabel: string;
  sourceText: string | null;
  capturedAt: string;
}

export interface FieldValue<T = string> {
  value: T | null;
  confidence: number;
  sourceText: string | null;
  source?: SourceTrace;
  verificationStatus: VerificationStatus;
}

export interface SafetyInvariant {
  id: string;
  text: string;
}
