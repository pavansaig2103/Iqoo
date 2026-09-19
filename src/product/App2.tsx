import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, ArrowRight, FileText, HeartPulse, Home, Mic, Package, Search, ShieldCheck, Stethoscope } from 'lucide-react';
import { AppProvider, useApp, type Page } from './context';
import { CabinetPage, CarePage, PeoplePage, PostVisitPage, TravelPage } from './screens';
import { AppDialogs } from './dialogs';
import { ProductActivityPage, ProductCarePage, ProductDoctorPage } from './experience';

const nav = [
  { id: 'today', label: 'Care', Icon: Home },
  { id: 'cabinet', label: 'Medicines', Icon: Package },
  { id: 'inbox', label: 'Activity', Icon: Activity },
  { id: 'visit', label: 'Doctor', Icon: Stethoscope },
] as const;

function Intro({ onEnter }: { onEnter: () => void }) {
  return <motion.main className="intro-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <div className="intro-brand"><span className="brand-icon"><HeartPulse size={22} /></span><strong>MediBridge</strong></div>
    <div className="intro-copy"><p className="overline">The living medication record for families</p><h1>Your family's medication story, connected.</h1><p>A prescription says what the doctor intended. MediBridge keeps it connected to what actually happens at home.</p></div>
    <div className="intro-flow"><div><FileText /><strong>Prescription</strong><small>Doctor intent</small></div><ArrowRight /><div><Home /><strong>Everyday care</strong><small>Home reality</small></div><ArrowRight /><div><Stethoscope /><strong>Doctor visit</strong><small>A useful history</small></div></div>
    <button className="button primary intro-enter" onClick={onEnter}>Enter Dad's care space <ArrowRight size={18} /></button>
    <p className="intro-principle">AI organizes care. People confirm it.</p>
  </motion.main>;
}

function Frame() {
  const { state, page, dialog, navigate, setDialog } = useApp();
  const [entered, setEntered] = useState(() => window.sessionStorage.getItem('medibridge-entered') === 'true');
  if (!entered) return <Intro onEnter={() => { window.sessionStorage.setItem('medibridge-entered', 'true'); setEntered(true); }} />;
  const active = page === 'cabinet' ? 'cabinet' : page === 'inbox' ? 'inbox' : ['visit', 'postVisit'].includes(page) ? 'visit' : 'today';
  const count = state.inbox.filter((item) => item.status === 'NEEDS REVIEW' || item.status === 'UNPROCESSED').length;
  const pages: Record<Page, React.ReactNode> = { today: <ProductCarePage />, people: <PeoplePage />, cabinet: <CabinetPage />, inbox: <ProductActivityPage />, care: <CarePage />, travel: <TravelPage />, visit: <ProductDoctorPage />, postVisit: <PostVisitPage /> };
  const pageName = active === 'today' ? 'Care space' : active === 'cabinet' ? 'Medicines' : active === 'inbox' ? 'Activity' : 'Doctor bridge';
  return <div className={`app-shell ${page === 'visit' ? 'visit-shell' : ''}`}>
    <aside className="side-nav"><button className="wordmark" onClick={() => navigate('today')}><span className="brand-icon"><HeartPulse size={22} /></span><span>MediBridge<small>Living medication record</small></span></button><nav aria-label="Primary navigation">{nav.map(({ id, label, Icon }) => <button key={id} className={active === id ? 'active' : ''} onClick={() => navigate(id)}><Icon size={20} /><span>{label}</span>{id === 'inbox' && count > 0 && <b>{count}</b>}</button>)}</nav><button className="rail-care-update" onClick={() => setDialog('add')}><Mic size={18} /><span><strong>Care update</strong><small>Voice, camera or text</small></span></button><div className="rail-user"><span className="avatar">P</span><div><strong>Pavan</strong><small>Family caregiver</small></div></div></aside>
    <main className="main-pane"><header className="app-header"><button className="mobile-wordmark" onClick={() => navigate('today')}><span className="brand-icon"><HeartPulse size={19} /></span>MediBridge</button><div className="header-page"><strong>{pageName}</strong><small>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</small></div><div className="header-controls"><button className="icon-control" title="Search family records" aria-label="Search family records" onClick={() => setDialog('search')}><Search size={20} /></button><button className="icon-control" title="Emergency information card" aria-label="Emergency information card" onClick={() => setDialog('emergency')}><ShieldCheck size={20} /></button><button className="button primary header-add" onClick={() => setDialog('add')}><Mic size={18} /> Care update</button></div></header><AnimatePresence mode="wait"><motion.div key={page} className={`page page-${page}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>{pages[page]}</motion.div></AnimatePresence></main>
    <nav className="bottom-nav" aria-label="Primary navigation">{nav.map(({ id, label, Icon }) => <button key={id} className={active === id ? 'active' : ''} onClick={() => navigate(id)}><Icon size={20} /><span>{label}</span>{id === 'inbox' && count > 0 && <i />}</button>)}</nav><button className="mobile-add" aria-label="Care update" onClick={() => setDialog('add')}><Mic size={23} /></button>{dialog && <AppDialogs />}
  </div>;
}

export default function App2() { return <AppProvider><Frame /></AppProvider>; }
