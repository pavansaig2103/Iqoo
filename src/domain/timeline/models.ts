export type TimelineItemKind = 'scheduled_event' | 'reported_event' | 'prescription_change' | 'clarification';

export interface TimelineItem {
  id: string;
  patientId: string;
  kind: TimelineItemKind;
  timestamp: string;
  title: string;
  detail: string;
  meta: string;
}

export interface PatternDetection {
  id: string;
  text: string;
}
