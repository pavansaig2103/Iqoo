import { createContext, useContext, useEffect, useReducer, useState, type Dispatch, type ReactNode } from 'react';
import { readStored, writeStored } from '../utils/storage';
import { householdReducer, initialHousehold, type HouseholdAction, type HouseholdState, type PersonId } from './model';

export type Page = 'today' | 'people' | 'cabinet' | 'inbox' | 'care' | 'travel' | 'visit' | 'postVisit';
export type Dialog = 'add' | 'identity' | 'event' | 'package' | 'medication' | 'voice' | 'bill' | 'note' | 'prescription' | 'search' | 'emergency' | null;

interface AppContextValue {
  state: HouseholdState;
  dispatch: Dispatch<HouseholdAction>;
  page: Page;
  person: PersonId;
  dialog: Dialog;
  selectedId: string | null;
  setPerson: (value: PersonId) => void;
  setDialog: (value: Dialog) => void;
  navigate: (value: Page, patient?: PersonId) => void;
  openEvent: (id: string) => void;
  openPackage: (id: string) => void;
  openMedication: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);
const storageKey = 'medibridge-family-os-v1';

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(householdReducer, initialHousehold, (seed) => {
    const saved = readStored<HouseholdState>(storageKey, seed);
    return { ...seed, ...saved, allergies: saved.allergies ?? {}, contacts: saved.contacts ?? {}, history: saved.history ?? seed.history };
  });
  const [page, setPage] = useState<Page>('today');
  const [person, setPerson] = useState<PersonId>('dad');
  const [dialog, setDialog] = useState<Dialog>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => { writeStored(storageKey, state); }, [state]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [page]);

  function navigate(value: Page, patient?: PersonId) {
    if (patient) setPerson(patient);
    setDialog(null);
    setPage(value);
  }
  function openEvent(id: string) { setSelectedId(id); setDialog('event'); }
  function openPackage(id: string) { setSelectedId(id); setDialog('package'); }
  function openMedication(id: string) { setSelectedId(id); setDialog('medication'); }

  return <AppContext.Provider value={{ state, dispatch, page, person, dialog, selectedId, setPerson, setDialog, navigate, openEvent, openPackage, openMedication }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('MediBridge context is missing');
  return value;
}
