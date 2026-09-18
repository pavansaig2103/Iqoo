import type { LanguageCode, MedicationExtraction, Prescription, ScheduleDose } from '../types';

export interface OCRProvider {
  extractText(imageId: string): Promise<string>;
}

export interface MedicationExtractor {
  extract(rawText: string): Promise<MedicationExtraction[]>;
}

export interface TranslationProvider {
  simplify(medication: MedicationExtraction, language: LanguageCode): Promise<string>;
}

export interface MedicationScheduleEngine {
  createSchedule(prescription: Prescription): ScheduleDose[];
}
