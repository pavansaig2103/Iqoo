import { ArrowRight, Package, X, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { eventStatus, packageRelation, people, type CareEvent, type HouseholdState, type MedicinePackage, type PersonId } from './model';
import { useApp } from './context';

export function PageTitle({ overline, title, description, action }: { overline: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="page-title"><div><p className="overline">{overline}</p><h1>{title}</h1>{description && <p>{description}</p>}</div>{action && <div className="title-action">{action}</div>}</div>;
}
export function Section({ title, children, action, className = '' }: { title: string; children: ReactNode; action?: ReactNode; className?: string }) {
  return <section className={`content-section ${className}`}><div className="section-top"><h2>{title}</h2>{action}</div>{children}</section>;
}
export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: string }) { return <span className={`badge ${tone}`}>{children}</span>; }
export function PersonSwitch() {
  const { person, setPerson } = useApp();
  return <div className="segmented">{(['dad', 'mom'] as PersonId[]).map((id) => <button key={id} className={person === id ? 'selected' : ''} onClick={() => setPerson(id)}>{people[id].label}</button>)}</div>;
}
export function Modal({ title, children, wide = false }: { title: string; children: ReactNode; wide?: boolean }) {
  const { setDialog } = useApp();
  return <div className="modal-backdrop" onMouseDown={() => setDialog(null)}><motion.section className={`app-modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}><div className="modal-top"><h2>{title}</h2><button className="icon-control" aria-label="Close" onClick={() => setDialog(null)}><X size={20} /></button></div>{children}</motion.section></div>;
}
export function ActionLink({ children, onClick }: { children: ReactNode; onClick: () => void }) { return <button className="action-link" onClick={onClick}>{children}<ArrowRight size={15} /></button>; }
export function SmallIcon({ icon: Icon, tone = 'teal' }: { icon: LucideIcon; tone?: string }) { return <span className={`small-icon ${tone}`}><Icon size={19} /></span>; }
export function recordLabel(state: HouseholdState, id: string) { const record = state.records.find((item) => item.id === id); return record ? `${record.name} ${record.strength}` : 'Unknown medicine'; }
export function eventTone(event: CareEvent) { const status = eventStatus(event); return status === 'TAKEN' ? 'good' : status === 'NO_REPORT' || status === 'UNSURE' || status === 'CONFLICT' ? 'warn' : 'danger'; }
export function PackageTile({ item }: { item: MedicinePackage }) {
  const { state, openPackage } = useApp();
  const relation = packageRelation(state, item);
  return <button className="package-tile" onClick={() => openPackage(item.id)}><span className="package-photo">{item.photo ? <img src={item.photo} alt={`${item.name} package`} /> : <Package size={33} />}</span><strong>{item.name}</strong><span>{item.strength}</span><small>{item.owner === 'unassigned' ? 'Shared / unassigned' : people[item.owner].label} · {item.quantity === null ? 'Quantity unknown' : `${item.quantity} recorded`}</small><Badge tone={relation === 'CURRENT + FOUND' ? 'good' : relation === 'ARCHIVED RECORD' ? 'neutral' : 'warn'}>{relation}</Badge></button>;
}
