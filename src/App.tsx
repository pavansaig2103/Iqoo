import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  Check,
  ChevronRight,
  Clock,
  FileScan,
  Home,
  Image,
  Languages,
  Lock,
  Mic,
  ScanLine,
  ShieldCheck,
  Trash2,
  Users,
  Volume2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { demoPrescription, initialDoses, patientProfiles } from './data/demoData';
import { DemoScheduleEngine, DemoTranslationProvider } from './services/demoServices';
import { isPlanCreatable, needsClinicalFollowUp, requiredFields } from './services/safety';
import type { DoseStatus, FieldValue, LanguageCode, MedicationExtraction, ScheduleDose, Screen, VerificationStatus } from './types';
import { readStored, writeStored } from './utils/storage';

const transition = { type: 'spring', stiffness: 260, damping: 28 } as const;
const scheduleEngine = new DemoScheduleEngine();
const translationProvider = new DemoTranslationProvider();

function localDateKey() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

const fieldLabels: Record<keyof MedicationExtraction['fields'], string> = {
  medicineName: 'Medicine',
  strength: 'Strength',
  dose: 'Dose',
  frequency: 'Frequency',
  duration: 'Duration',
  foodInstruction: 'Food instruction',
  specialInstruction: 'Special instruction',
};

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [dayKey, setDayKey] = useState(localDateKey);
  const [medications, setMedications] = useState<MedicationExtraction[]>(() =>
    readStored('medibridge.medications', demoPrescription.medications),
  );
  const [doses, setDoses] = useState<ScheduleDose[]>(() => readStored(`medibridge.doses.v3.${localDateKey()}`, initialDoses));
  const [selectedField, setSelectedField] = useState<{
    medication: MedicationExtraction;
    fieldName: keyof MedicationExtraction['fields'];
  } | null>(null);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => writeStored('medibridge.medications', medications), [medications]);
  useEffect(() => writeStored(`medibridge.doses.v3.${dayKey}`, doses), [dayKey, doses]);
  useEffect(() => {
    const timer = window.setInterval(() => {
      const nextDay = localDateKey();
      if (nextDay !== dayKey) {
        setDayKey(nextDay);
        setDoses(readStored(`medibridge.doses.v3.${nextDay}`, initialDoses));
      }
    }, 60_000);
    return () => window.clearInterval(timer);
  }, [dayKey]);

  const prescription = useMemo(() => ({ ...demoPrescription, medications }), [medications]);
  const canCreatePlan = isPlanCreatable(medications);
  const hasUnresolved = needsClinicalFollowUp(medications);

  function updateField(
    medicationId: string,
    fieldName: keyof MedicationExtraction['fields'],
    value: string | null,
    status: VerificationStatus = 'user_verified',
  ) {
    setMedications((items) =>
      items.map((medication) =>
        medication.id === medicationId
          ? {
              ...medication,
              fields: {
                ...medication.fields,
                [fieldName]: {
                  ...medication.fields[fieldName],
                  value,
                  verificationStatus: status,
                  confidence: status === 'user_verified' ? 1 : medication.fields[fieldName].confidence,
                },
              },
            }
          : medication,
      ),
    );
  }

  function createCarePlan() {
    if (!isPlanCreatable(medications)) return;
    const plan = scheduleEngine.createSchedule(prescription);
    setDoses(plan);
    setScreen('verified');
  }

  async function changeLanguage(nextLanguage: LanguageCode) {
    setLanguage(nextLanguage);
    const result: Record<string, string> = {};
    for (const medication of medications) result[medication.id] = await translationProvider.simplify(medication, nextLanguage);
    setTranslations(result);
  }

  function markDose(doseId: string, status: ScheduleDose['status']) {
    setDoses((items) =>
      items.map((dose) => (dose.id === doseId ? { ...dose, status, recordedAt: new Date().toISOString() } : dose)),
    );
  }

  function changeReminderTime(doseId: string, time: string) {
    setDoses((items) => items.map((dose) => dose.id === doseId ? { ...dose, time } : dose));
  }

  return (
    <main className="page-shell">
      <div className="app-shell">
        <aside className="desktop-sidebar">
          <button className="brand" onClick={() => setScreen('home')} aria-label="MediBridge home">
            <span className="brand-icon"><ShieldCheck size={25} /></span>
            <span>MediBridge<small>Caregiver demo</small></span>
          </button>
          <BottomNav current={screen} onNavigate={setScreen} />
          <p className="sidebar-note">From prescription to everyday care.</p>
        </aside>
        <div className="app-main">
        <header className="app-header">
          <button className="mobile-brand" onClick={() => setScreen('home')} aria-label="MediBridge home">
            <span className="brand-icon"><ShieldCheck size={20} /></span>
            MediBridge
          </button>
          <span className="header-context">Caregiver demo</span>
          <button className="header-action" onClick={() => setScreen('privacy')} aria-label="Privacy and data" title="Privacy and data">
            <Lock size={19} />
          </button>
        </header>
        <div className="screen-stage">
        <AnimatePresence mode="wait">
          {screen === 'home' && <HomeScreen key="home" doses={doses} onNavigate={setScreen} />}
          {screen === 'scan' && <Scanner key="scan" onProcessing={() => setScreen('processing')} />}
          {screen === 'processing' && <Processing key="processing" onDone={() => setScreen('review')} />}
          {screen === 'review' && (
            <Review
              key="review"
              medications={medications}
              canCreatePlan={canCreatePlan}
              hasUnresolved={hasUnresolved}
              onOpenField={(medication, fieldName) => setSelectedField({ medication, fieldName })}
              onUpdateField={updateField}
              onCreatePlan={createCarePlan}
            />
          )}
          {screen === 'verified' && (
            <Verified key="verified" onViewRoutine={() => setScreen('routine')} onLanguage={() => setScreen('grounding')} />
          )}
          {screen === 'grounding' && (
            <Comprehension
              key="grounding"
              language={language}
              medications={medications}
              translations={translations}
              onLanguage={changeLanguage}
              onDone={() => setScreen('routine')}
            />
          )}
          {screen === 'routine' && <Routine key="routine" doses={doses} onMark={markDose} onTimeChange={changeReminderTime} />}
          {screen === 'family' && <Family key="family" doses={doses} />}
          {screen === 'activity' && <ActivityScreen key="activity" doses={doses} onMark={markDose} />}
          {screen === 'privacy' && <Privacy key="privacy" />}
        </AnimatePresence>
        </div>
        {selectedField && (
          <GroundingSheet
            medication={selectedField.medication}
            fieldName={selectedField.fieldName}
            onClose={() => setSelectedField(null)}
            onConfirm={(value) => {
              updateField(
                selectedField.medication.id,
                selectedField.fieldName,
                value,
              );
              setSelectedField(null);
            }}
          />
        )}
        <div className="mobile-navigation"><BottomNav current={screen} onNavigate={setScreen} /></div>
        </div>
      </div>
    </main>
  );
}

function ScreenBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      className={`screen ${className}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={transition}
    >
      {children}
    </motion.section>
  );
}

function HomeScreen({ doses, onNavigate }: { doses: ScheduleDose[]; onNavigate: (screen: Screen) => void }) {
  const marked = doses.filter((dose) => dose.status !== 'pending').length;
  return (
    <ScreenBody>
      <div className="top-copy">
        <p className="eyebrow">Your care workspace</p>
        <h2>Good to see you, Pavan.</h2>
        <p className="lead">Keep prescriptions, routines and dose logs in one clear place.</p>
      </div>
      <div className="home-layout">
      <div className="home-primary">
        <button className="scan-cta" onClick={() => onNavigate('scan')}>
          <span><FileScan size={26} /> <strong>Review a prescription</strong><small>Try the guided sample</small></span>
          <ChevronRight />
        </button>
        <div className="section-title"><h3>Family</h3><button onClick={() => onNavigate('family')}>View all <ChevronRight size={16} /></button></div>
      <div className="profile-list">
        {patientProfiles.map((profile) => (
          <button className="profile-card" key={profile.id} onClick={() => onNavigate(profile.id === 'father' ? 'routine' : 'family')}>
            <div className="avatar">{profile.relation[0]}</div>
            <div>
              <strong>{profile.relation}</strong>
              <span>{profile.name}</span>
            </div>
            <div className="profile-meta">
              <span>{profile.id === 'father' ? `${marked} of ${doses.length} logged` : 'Sample profile'}</span>
              <small>{profile.id === 'father' ? 'View routine' : 'No routine yet'}</small>
            </div>
          </button>
        ))}
      </div>
      </div>
      <div className="home-secondary">
        <div className="section-title"><h3>Today</h3><button onClick={() => onNavigate('routine')}>Routine <ChevronRight size={16} /></button></div>
        <div className="today-summary">
          <strong>{marked} <span>/ {doses.length}</span></strong>
          <p>Doses logged in this demo</p>
          <div className="progress-track"><span style={{ width: `${doses.length ? marked / doses.length * 100 : 0}%` }} /></div>
          <button onClick={() => onNavigate('activity')}><Activity size={18} /> View activity <ChevronRight size={16} /></button>
        </div>
      </div>
      </div>
    </ScreenBody>
  );
}

function Scanner({ onProcessing }: { onProcessing: () => void }) {
  const cameraInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  function selectImage(file?: File) {
    if (!file) return;
    if (file.type && !file.type.startsWith('image/')) return;
    setPreviewUrl(URL.createObjectURL(file));
    setFileName(file.name);
  }

  return (
    <ScreenBody className="scanner-screen">
      <div className="screen-heading">
        <h2>Scan Prescription</h2>
        <p>Explore the sample prescription or preview a photo from your device.</p>
      </div>
      <div className="camera-view">
        {previewUrl && <img className="scan-preview" src={previewUrl} alt="Selected prescription preview" />}
        <div className="corner tl" />
        <div className="corner tr" />
        <div className="corner bl" />
        <div className="corner br" />
        {!previewUrl && <motion.div className="scan-line" animate={{ y: [18, 292, 18] }} transition={{ repeat: Infinity, duration: 2.8 }} />}
        {!previewUrl && <div className="rx-paper">
          <b>Dr. Meera Iyer</b>
          <span>TAB PARACETAMOL 500MG</span>
          <span>1 TAB BD PC</span>
          <span>TAB CETIRIZINE 10MG</span>
          <span>1 TAB HS</span>
        </div>}
      </div>
      <p className="scan-note">{previewUrl ? `${fileName} is previewed locally. Live text extraction is not connected in this demo.` : 'Sample prescription from Dr. Meera Iyer.'}</p>
      <input ref={cameraInput} className="visually-hidden" type="file" accept="image/*" capture="environment" onChange={(event) => selectImage(event.target.files?.[0])} aria-label="Take prescription photo" />
      <input ref={galleryInput} className="visually-hidden" type="file" accept="image/*" onChange={(event) => selectImage(event.target.files?.[0])} aria-label="Choose prescription image" />
      <div className="camera-tools">
        <button onClick={() => cameraInput.current?.click()}><ScanLine size={20} /> Camera</button>
        <button onClick={() => galleryInput.current?.click()}><Image size={20} /> Gallery</button>
      </div>
      <button className="primary-button" onClick={onProcessing}>Use sample prescription <ChevronRight size={19} /></button>
    </ScreenBody>
  );
}

function Processing({ onDone }: { onDone: () => void }) {
  const stages = [
    'Loading sample prescription...',
    'Reading sample text...',
    'Matching sample medication fields...',
    'Checking for missing or uncertain fields...',
  ];

  useEffect(() => {
    const timer = window.setTimeout(onDone, 3600);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <ScreenBody className="processing">
      <motion.div className="processing-orb" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}>
        <FileScan />
      </motion.div>
      <h2>Preparing sample review</h2>
      <div className="stage-list">
        {stages.map((stage, index) => (
          <motion.div
            className="stage-row"
            key={stage}
            initial={{ opacity: 0.35 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.55 }}
          >
            <Check size={16} />
            {stage}
          </motion.div>
        ))}
      </div>
    </ScreenBody>
  );
}

function Review({
  medications,
  canCreatePlan,
  hasUnresolved,
  onOpenField,
  onUpdateField,
  onCreatePlan,
}: {
  medications: MedicationExtraction[];
  canCreatePlan: boolean;
  hasUnresolved: boolean;
  onOpenField: (medication: MedicationExtraction, fieldName: keyof MedicationExtraction['fields']) => void;
  onUpdateField: (medicationId: string, fieldName: keyof MedicationExtraction['fields'], value: string | null, status?: VerificationStatus) => void;
  onCreatePlan: () => void;
}) {
  const reviewCount = medications.reduce((total, medication) => {
    const requiredPending = requiredFields.filter((name) => medication.fields[name].verificationStatus !== 'user_verified').length;
    const food = medication.fields.foodInstruction;
    return total + requiredPending + (food.value && food.verificationStatus !== 'user_verified' ? 1 : 0);
  }, 0);
  const durationMissing = medications.some((medication) => {
    const duration = medication.fields.duration;
    return duration.verificationStatus === 'missing' || duration.verificationStatus === 'unresolved';
  });
  return (
    <ScreenBody>
      <div className="screen-heading">
        <p className="eyebrow">Human verification</p>
        <h2>Review prescription</h2>
        <p>{reviewCount ? `${reviewCount} required fields need your confirmation.` : 'Required fields confirmed. Other notes can still be reviewed.'}</p>
      </div>
      {durationMissing && <div className="warning-panel">
        <AlertTriangle size={18} />
        <p>Treatment duration was not found. Ask the prescribing clinician or pharmacist before relying on this routine.</p>
      </div>}
      {medications.map((medication) => (
        <article className="review-card" key={medication.id}>
          <h3>{medication.fields.medicineName.value ?? medication.displayName}</h3>
          {(Object.keys(medication.fields) as Array<keyof MedicationExtraction['fields']>).map((fieldName) => (
            <FieldRow
              key={fieldName}
              label={fieldLabels[fieldName]}
              field={medication.fields[fieldName]}
              onOpen={() => onOpenField(medication, fieldName)}
              onConfirm={() => onUpdateField(medication.id, fieldName, medication.fields[fieldName].value)}
              onUnresolved={() => onUpdateField(medication.id, fieldName, medication.fields[fieldName].value, 'unresolved')}
            />
          ))}
        </article>
      ))}
      {hasUnresolved && <p className="guardrail">Missing or unresolved instructions remain visible. Check them with the prescribing clinician or pharmacist.</p>}
      <button className="primary-button" disabled={!canCreatePlan} onClick={onCreatePlan}>
        Create Care Routine <ChevronRight size={20} />
      </button>
      {!canCreatePlan && <p className="form-help">Confirm the medicine, strength, dose, frequency and any visible food instruction first. This demo supports “Twice daily” and “At night” schedules.</p>}
    </ScreenBody>
  );
}

function FieldRow({
  label,
  field,
  onOpen,
  onConfirm,
  onUnresolved,
}: {
  label: string;
  field: FieldValue;
  onOpen: () => void;
  onConfirm: () => void;
  onUnresolved: () => void;
}) {
  return (
    <div className={`field-row ${field.verificationStatus}`}>
      <button className="field-main" onClick={onOpen}>
        <span>{label}</span>
        <strong>{field.value ?? 'Not found in prescription'}</strong>
      </button>
      <div className="field-actions">
        {field.verificationStatus === 'missing' ? (
          <button onClick={onUnresolved}>Mark unresolved</button>
        ) : field.verificationStatus === 'unresolved' ? (
          <span className="field-status">Unresolved</span>
        ) : (
          <button onClick={onConfirm} disabled={!field.value?.trim() || field.verificationStatus === 'user_verified'}>{field.verificationStatus === 'user_verified' ? 'Confirmed' : 'Confirm'}</button>
        )}
      </div>
    </div>
  );
}

function GroundingSheet({
  medication,
  fieldName,
  onClose,
  onConfirm,
}: {
  medication: MedicationExtraction;
  fieldName: keyof MedicationExtraction['fields'];
  onClose: () => void;
  onConfirm: (value: string | null) => void;
}) {
  const field = medication.fields[fieldName];
  const [draftValue, setDraftValue] = useState(field.value ?? '');
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <motion.div className="grounding-sheet" role="dialog" aria-modal="true" aria-labelledby="field-dialog-title" onClick={(event) => event.stopPropagation()} initial={{ y: 260 }} animate={{ y: 0 }} exit={{ y: 260 }} transition={transition}>
        <button className="sheet-close" onClick={onClose} aria-label="Close"><X /></button>
        <p className="eyebrow">Source grounding</p>
        <h3 id="field-dialog-title">{fieldLabels[fieldName]}</h3>
        <div className="source-block">
          <span>Review or correct value</span>
          <input
            value={draftValue}
            onChange={(event) => setDraftValue(event.target.value)}
            placeholder="No value found"
            aria-label={`Correct ${fieldLabels[fieldName]}`}
          />
        </div>
        <div className="prescription-preview">
          <p>Dr. Meera Iyer</p>
          {demoPrescription.rawText.split('\n').slice(1).map((line) => (
            <span className={field.sourceText && line.includes(field.sourceText) ? 'highlight' : ''} key={line}>
              {line}
            </span>
          ))}
        </div>
        <p className="source-note">Source: {field.sourceText ?? 'No matching source text was found. Check with the clinician before entering a value.'}</p>
        <button className="primary-button" onClick={() => onConfirm(draftValue.trim() || null)} disabled={!draftValue.trim()}>
          Confirm as user verified
        </button>
      </motion.div>
    </div>
  );
}

function Verified({ onViewRoutine, onLanguage }: { onViewRoutine: () => void; onLanguage: () => void }) {
  return (
    <ScreenBody className="success-screen">
      <motion.div className="success-mark" initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={transition}>
        <ShieldCheck size={54} />
      </motion.div>
      <h2>Verified Care Plan Ready</h2>
      <p>Required prescription fields were reviewed by the caregiver. Missing information remains flagged instead of guessed.</p>
      <button className="secondary-button" onClick={onLanguage}>
        <Languages size={20} /> Language and listen
      </button>
      <button className="primary-button" onClick={onViewRoutine}>
        View today's routine <ChevronRight size={20} />
      </button>
    </ScreenBody>
  );
}

function Comprehension({
  language,
  medications,
  translations,
  onLanguage,
  onDone,
}: {
  language: LanguageCode;
  medications: MedicationExtraction[];
  translations: Record<string, string>;
  onLanguage: (language: LanguageCode) => void;
  onDone: () => void;
}) {
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'te' ? 'te-IN' : 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    onLanguage(language);
  }, []);

  return (
    <ScreenBody>
      <div className="screen-heading">
        <p className="eyebrow">After verification only</p>
        <h2>Clear instructions</h2>
      </div>
      <div className="language-switch">
        <button className={language === 'en' ? 'active' : ''} onClick={() => onLanguage('en')}>English</button>
        <button className={language === 'te' ? 'active' : ''} onClick={() => onLanguage('te')}>తెలుగు</button>
      </div>
      {medications.map((medication) => (
        <article className="instruction-card" key={medication.id}>
          <span>{medication.fields.medicineName.value} · Source instruction</span>
          <strong>{[medication.fields.dose.sourceText, medication.fields.frequency.sourceText, medication.fields.foodInstruction.sourceText].filter(Boolean).join(' ')}</strong>
          <span>{language === 'te' ? 'Telugu' : 'Simplified'}</span>
          <p>{translations[medication.id] ?? 'Take only the verified instruction.'}</p>
          <button className="listen-button" onClick={() => speak(translations[medication.id] ?? '')}>
            <Volume2 size={18} /> Listen
          </button>
        </article>
      ))}
      <button className="primary-button" onClick={onDone}>Continue to routine</button>
    </ScreenBody>
  );
}

function formatTime(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
  return new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
    .format(new Date(2020, 0, 1, hours, minutes));
}

function Routine({ doses, onMark, onTimeChange }: {
  doses: ScheduleDose[];
  onMark: (doseId: string, status: ScheduleDose['status']) => void;
  onTimeChange: (doseId: string, time: string) => void;
}) {
  const groups = ['Morning', 'Afternoon', 'Night'] as const;
  const dayLabel = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  const marked = doses.filter((dose) => dose.status !== 'pending').length;
  return (
    <ScreenBody>
      <div className="screen-heading">
        <p className="eyebrow">Today</p>
        <h2>{dayLabel}</h2>
        <p>{marked} of {doses.length} doses logged. Routine times are sample defaults and can be adjusted.</p>
      </div>
      {groups.map((period) => (
        <section className="routine-group" key={period}>
          <h3>{period}</h3>
          {doses.filter((dose) => dose.period === period).length === 0 && <p className="empty-period">No doses scheduled</p>}
          {doses.filter((dose) => dose.period === period).map((dose) => (
            <article className={`dose-card ${dose.status}`} key={dose.id}>
              <div className="dose-heading">
                <span>{formatTime(dose.time)}</span>
                <strong>{dose.medicationName} {dose.strength}</strong>
                <p>{dose.dose}{dose.foodInstruction && ` · ${dose.foodInstruction}`}</p>
              </div>
              <label className="time-editor">Routine time <input type="time" value={dose.time} onChange={(event) => onTimeChange(dose.id, event.target.value)} aria-label={`${dose.medicationName} ${period} routine time`} /></label>
              <div className="dose-actions">
                <button className={dose.status === 'self_reported_taken' ? 'selected' : ''} aria-pressed={dose.status === 'self_reported_taken'} onClick={() => onMark(dose.id, 'self_reported_taken')}>Taken</button>
                <button className={dose.status === 'missed' ? 'selected' : ''} aria-pressed={dose.status === 'missed'} onClick={() => onMark(dose.id, 'missed')}>Missed</button>
                <button className={dose.status === 'unsure' ? 'selected' : ''} aria-pressed={dose.status === 'unsure'} onClick={() => onMark(dose.id, 'unsure')}>Unsure</button>
              </div>
              {dose.status !== 'pending' && <small>Caregiver marked as {dose.status === 'self_reported_taken' ? 'taken' : dose.status}</small>}
            </article>
          ))}
        </section>
      ))}
    </ScreenBody>
  );
}

function Family({ doses }: { doses: ScheduleDose[] }) {
  const logged = doses.filter((dose) => dose.status !== 'pending').length;
  return (
    <ScreenBody>
      <div className="screen-heading">
        <p className="eyebrow">Caregiver controlled</p>
        <h2>Family profiles</h2>
      </div>
      {patientProfiles.map((profile) => (
        <article className="family-card" key={profile.id}>
          <div className="avatar large">{profile.relation[0]}</div>
          <div>
            <h3>{profile.relation}</h3>
            <p>{profile.name} · Age {profile.age}</p>
            <span>{profile.id === 'father' ? `${logged} of ${doses.length} doses logged today` : 'No routine in this demo'}</span>
          </div>
        </article>
      ))}
    </ScreenBody>
  );
}

interface VoiceResultEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

interface VoiceRecognizer {
  lang: string;
  interimResults: boolean;
  onresult: ((event: VoiceResultEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

function ActivityScreen({ doses, onMark }: {
  doses: ScheduleDose[];
  onMark: (doseId: string, status: ScheduleDose['status']) => void;
}) {
  const [selectedDoseId, setSelectedDoseId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<DoseStatus | ''>('');
  const [note, setNote] = useState('');
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [saved, setSaved] = useState(false);
  const recognitionRef = useRef<VoiceRecognizer | null>(null);
  const taken = doses.filter((dose) => dose.status === 'self_reported_taken').length;
  const missed = doses.filter((dose) => dose.status === 'missed').length;
  const unsure = doses.filter((dose) => dose.status === 'unsure').length;

  useEffect(() => () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
    }
  }, []);

  function updateNote(value: string) {
    setNote(value);
    setSaved(false);
    const normalized = value.toLowerCase();
    if (/\bmissed\b/.test(normalized)) setSelectedStatus('missed');
    else if (/\b(took|taken)\b/.test(normalized)) setSelectedStatus('self_reported_taken');
    else if (/\bunsure\b/.test(normalized)) setSelectedStatus('unsure');

    const period = normalized.match(/\b(morning|afternoon|night)\b/)?.[1];
    const medicine = doses.find((dose) => normalized.includes(dose.medicationName.toLowerCase()));
    const matches = doses.filter((dose) =>
      (!period || dose.period.toLowerCase() === period) && (!medicine || dose.medicationName === medicine.medicationName),
    );
    if ((period || medicine) && matches.length === 1) setSelectedDoseId(matches[0].id);
  }

  function toggleVoice() {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const voiceWindow = window as Window & { SpeechRecognition?: new () => VoiceRecognizer; webkitSpeechRecognition?: new () => VoiceRecognizer };
    const Recognition = voiceWindow.SpeechRecognition ?? voiceWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceError('Voice input is unavailable in this browser. Use the fields below.');
      return;
    }
    const recognition = new Recognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.onresult = (event) => updateNote(event.results[0]?.[0]?.transcript ?? '');
    recognition.onerror = () => {
      setVoiceError('Microphone unavailable. Use the fields below.');
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setVoiceError('');
    try {
      recognition.start();
      setListening(true);
    } catch {
      setVoiceError('Microphone unavailable. Use the fields below.');
      setListening(false);
    }
  }

  function submitLog(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedDoseId || !selectedStatus) return;
    onMark(selectedDoseId, selectedStatus);
    setSaved(true);
  }

  return (
    <ScreenBody>
      <div className="screen-heading">
        <p className="eyebrow">Today</p>
        <h2>Caregiver activity</h2>
        <p>These statuses are caregiver entries. They do not confirm that medicine was swallowed.</p>
      </div>
      <div className="stats-grid">
        <Stat label="Scheduled" value={doses.length} />
        <Stat label="Marked taken" value={taken} />
        <Stat label="Missed" value={missed} />
        <Stat label="Unsure" value={unsure} />
      </div>
      <form className="quick-log" onSubmit={submitLog}>
        <h3>Quick log</h3>
        <label className="voice-note">Voice or note
          <span className="voice-row">
            <input value={note} onChange={(event) => updateNote(event.target.value)} placeholder="e.g. Dad missed his night medicine" />
            <button type="button" onClick={toggleVoice} aria-label={listening ? 'Stop voice input' : 'Start voice input'} title={listening ? 'Stop voice input' : 'Start voice input'} aria-pressed={listening}><Mic size={20} /></button>
          </span>
        </label>
        {voiceError && <p className="voice-error" role="status">{voiceError}</p>}
        <label>Dose
          <select value={selectedDoseId} onChange={(event) => { setSelectedDoseId(event.target.value); setSaved(false); }}>
            <option value="" disabled>Select a dose</option>
            {doses.map((dose) => <option key={dose.id} value={dose.id}>{dose.medicationName} · {dose.period} · {formatTime(dose.time)}</option>)}
          </select>
        </label>
        <label>Status
          <select value={selectedStatus} onChange={(event) => { setSelectedStatus(event.target.value as DoseStatus | ''); setSaved(false); }}>
            <option value="" disabled>Select status</option>
            <option value="self_reported_taken">Marked taken</option>
            <option value="missed">Missed</option>
            <option value="unsure">Unsure</option>
          </select>
        </label>
        <button className="primary-button" type="submit" disabled={!selectedDoseId || !selectedStatus}>Save log</button>
        {saved && <p className="save-feedback" role="status">Dose log saved on this device.</p>}
      </form>
    </ScreenBody>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Privacy() {
  return (
    <ScreenBody>
      <div className="screen-heading">
        <p className="eyebrow">Privacy</p>
        <h2>Your prescription contains private health information.</h2>
      </div>
      <div className="privacy-list">
        <p><Lock size={18} /> Demo changes are stored in this browser.</p>
        <p><ShieldCheck size={18} /> The sample prescription runs locally; no image is uploaded.</p>
        <p><Trash2 size={18} /> Reset clears saved demo changes and restores the sample.</p>
      </div>
      <button
        className="secondary-button danger"
        onClick={() => {
          try {
            Object.keys(localStorage).filter((key) => key.startsWith('medibridge.')).forEach((key) => localStorage.removeItem(key));
          } catch { /* Storage may be unavailable in private browsing. */ }
          window.location.reload();
        }}
      >
        <Trash2 size={18} /> Reset demo
      </button>
    </ScreenBody>
  );
}

function BottomNav({ current, onNavigate }: { current: Screen; onNavigate: (screen: Screen) => void }) {
  const items: Array<{ screen: Screen; label: string; icon: React.ReactNode }> = [
    { screen: 'home', label: 'Home', icon: <Home /> },
    { screen: 'routine', label: 'Routine', icon: <Clock /> },
    { screen: 'scan', label: 'Scan', icon: <FileScan /> },
    { screen: 'family', label: 'Family', icon: <Users /> },
    { screen: 'activity', label: 'Activity', icon: <Activity /> },
    { screen: 'privacy', label: 'Privacy', icon: <Lock /> },
  ];
  const active = current === 'processing' || current === 'review' ? 'scan' : current === 'verified' || current === 'grounding' ? 'routine' : current;
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {items.map((item) => (
        <button key={item.screen} className={active === item.screen ? 'active' : ''} aria-current={active === item.screen ? 'page' : undefined} onClick={() => onNavigate(item.screen)}>
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default App;
