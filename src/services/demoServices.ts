import { demoPrescription } from '../data/demoData';
import type { LanguageCode, MedicationExtraction, Prescription, ScheduleDose } from '../types';
import type { MedicationExtractor, MedicationScheduleEngine, OCRProvider, TranslationProvider } from './contracts';

export class DemoOCRProvider implements OCRProvider {
  async extractText(): Promise<string> {
    return demoPrescription.rawText;
  }
}

export class DemoMedicationExtractor implements MedicationExtractor {
  async extract() {
    return demoPrescription.medications;
  }
}

export class DemoTranslationProvider implements TranslationProvider {
  async simplify(medication: MedicationExtraction, language: LanguageCode): Promise<string> {
    const dose = medication.fields.dose.value ?? '';
    const frequency = medication.fields.frequency.value;
    const foodInstruction = medication.fields.foodInstruction.value;
    if (language === 'te') {
      const translatedDose = dose === '1 tablet' ? '1 మాత్ర' : dose;
      const foodText = foodInstruction === 'After food' ? ' భోజనం తర్వాత' : foodInstruction ? ` (${foodInstruction})` : '';
      if (frequency === 'Twice daily') return `రోజుకు రెండుసార్లు${foodText} ${translatedDose} తీసుకోండి.`;
      if (frequency === 'At night') return `రాత్రి${foodText} ${translatedDose} తీసుకోండి.`;
      return 'ధృవీకరించిన సూచనలను మాత్రమే అనుసరించండి.';
    }

    const foodText = foodInstruction ? ` ${foodInstruction.toLowerCase()}` : '';
    if (frequency === 'Twice daily') return `Take ${dose} twice daily${foodText}.`;
    if (frequency === 'At night') return `Take ${dose} at night${foodText}.`;
    return 'Follow only the verified prescription instruction.';
  }
}

export class DemoScheduleEngine implements MedicationScheduleEngine {
  createSchedule(prescription: Prescription): ScheduleDose[] {
    return prescription.medications.flatMap((medication) => {
      const name = medication.fields.medicineName.value ?? '';
      const strength = medication.fields.strength.value ?? '';
      const dose = medication.fields.dose.value ?? '';
      const foodInstruction = medication.fields.foodInstruction.value ?? '';
      const frequency = medication.fields.frequency.value;

      const periods = frequency === 'Twice daily' ? ['Morning', 'Night'] as const : frequency === 'At night' ? ['Night'] as const : [];
      return periods.map((period) => ({
        id: `${prescription.id}-${medication.id}-${period.toLowerCase()}`,
        patientId: prescription.patientId,
        medicationName: name,
        strength,
        dose,
        foodInstruction,
        period,
        time: period === 'Morning' ? '08:00' : '20:00',
        status: 'pending' as const,
      }));
    });
  }
}
