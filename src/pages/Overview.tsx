import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Box,
  CircleCheck,
  Clock3,
  Globe2,
  TriangleAlert,
  Truck,
} from 'lucide-react';
import { useApp } from '../store';
import { type Batch, routeFor } from '../domain/model';
import { dateTime } from '../lib/format';
import { Badge } from '../components/UI';
import { BatchTable } from '../components/BatchTable';
import RouteMap from '../components/RouteMap';

type Props = {
  batch: Batch;
  onSelect: (id: string) => void;
  onDetails: (id: string) => void;
  onQR: (id: string) => void;
};
export default function Overview({ batch, onSelect, onDetails, onQR }: Props) {
  const { state } = useApp();
  const issues = state.batches.filter((b) =>
    ['customs', 'integrity', 'incident'].includes(b.status),
  );
  const events = state.batches
    .flatMap((b) => b.events.map((event) => ({ ...event, batchId: b.id })))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);
  const stats = [
    {
      label: 'Ընդհանուր խմբաքանակներ',
      value: state.batches.length,
      note: `${state.batches.reduce((sum, b) => sum + b.quantity, 0)} միավոր հագուստ`,
      icon: Box,
      color: 'blue',
    },
    {
      label: 'Ճանապարհին',
      value: state.batches.filter((b) => b.status === 'in_transit').length,
      note: 'Հաստատված փոխանցումներով',
      icon: Truck,
      color: 'purple',
    },
    {
      label: 'Առաքված',
      value: state.batches.filter((b) => b.status === 'delivered').length,
      note: 'Հասել են նշանակման վայր',
      icon: CircleCheck,
      color: 'green',
    },
    {
      label: 'Ուշադրության կարիք',
      value: issues.length,
      note: 'Սպասում են խնդրի լուծմանը',
      icon: TriangleAlert,
      color: 'orange',
    },
  ];
  return (
    <>
      <div className="overview-welcome">
        <div>
          <span className="eyebrow">
            <span className="network-dot" /> ՄԻԱՍՆԱԿԱՆ ՄԱՏԱԿԱՐԱՐՄԱՆ ՑԱՆՑ
          </span>
          <h2>Յուրաքանչյուր խմբաքանակ՝ տեսադաշտում։</h2>
          <p>Հետևեք հագուստի ճանապարհին՝ արտադրամասից մինչև խանութ։</p>
        </div>
        <div className="welcome-visual">
          <Globe2 size={86} strokeWidth={0.8} />
          <span>
            <i />4 միջազգային երթուղի
          </span>
        </div>
      </div>
      <div className="stats-grid">
        {stats.map(({ label, value, note, icon: Icon, color }) => (
          <div className="card stat-card" key={label}>
            <div className="stat-top">
              <span>{label}</span>
              <span className={`stat-icon ${color}`}>
                <Icon size={19} />
              </span>
            </div>
            <strong className="stat-value">{value.toString().padStart(2, '0')}</strong>
            <small>{note}</small>
          </div>
        ))}
      </div>
      <div className="overview-middle">
        <section className="card">
          <div className="card-heading">
            <div>
              <h2>Մատակարարումների աշխարհագրություն</h2>
              <p>Երթուղին և ընթացիկ կանգառը</p>
            </div>
            <a href="#/routes" className="icon-button" aria-label="Բացել երթուղիները">
              <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="map-selector">
            <select
              aria-label="Քարտեզի խմբաքանակ"
              value={batch.id}
              onChange={(e) => onSelect(e.target.value)}
            >
              {state.batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id} · {routeFor(b.routeId).name}
                </option>
              ))}
            </select>
            <Badge status={batch.status} />
          </div>
          <RouteMap batch={batch} compact />
          <div className="map-legend">
            <span>
              <i className="blue-dot" />
              Անցած ճանապարհ
            </span>
            <span>
              <i className="gray-dot" />
              Նախատեսված երթուղի
            </span>
            <strong>
              {batch.stage + 1} / {routeFor(batch.routeId).stops.length} կանգառ
            </strong>
          </div>
        </section>
        <section className="card attention-card">
          <div className="card-heading">
            <div>
              <h2>Պահանջում են ձեր ուշադրությունը</h2>
              <p>Խնդիրները՝ մեկ տեղում</p>
            </div>
            <span className="count-chip orange">{issues.length}</span>
          </div>
          {issues.length ? (
            issues.map((b) => (
              <button key={b.id} className="attention-item" onClick={() => onDetails(b.id)}>
                <span className={`attention-icon ${b.status}`}>
                  <TriangleAlert size={17} />
                </span>
                <span>
                  <strong>
                    {b.status === 'customs'
                      ? 'Փաստաթուղթը բացակայում է'
                      : b.status === 'integrity'
                        ? 'Փաստաթղթի անհամապատասխանություն'
                        : 'Վնասված փաթեթավորում'}
                  </strong>
                  <small>
                    {b.id} · {routeFor(b.routeId).name}
                  </small>
                </span>
                <ArrowRight size={16} />
              </button>
            ))
          ) : (
            <div className="all-clear">
              <CircleCheck size={34} />
              <strong>Բոլոր խնդիրները լուծված են</strong>
            </div>
          )}
          <div className="attention-tip">
            <Clock3 size={17} />
            <p>Գրառումները պահպանվում են պատմության մեջ՝ յուրաքանչյուր քայլը տեսանելի դարձնելով։</p>
          </div>
        </section>
      </div>
      <BatchTable batches={state.batches} onDetails={onDetails} onQR={onQR} compact />
      <section className="card activity-card">
        <div className="card-heading">
          <h2>Վերջին իրադարձությունները</h2>
          <a href="#/activity" className="text-button">
            Ամբողջ պատմությունը <ArrowUpRight size={14} />
          </a>
        </div>
        <div className="activity-grid">
          {events.map((event) => (
            <button
              className="activity-mini"
              key={event.id}
              onClick={() => onDetails(event.batchId)}
            >
              <span className={`activity-dot ${event.type === 'incident' ? 'orange' : ''}`}>
                <ArrowDownLeft size={15} />
              </span>
              <div>
                <small>{dateTime(event.date)}</small>
                <strong>{event.title}</strong>
                <span>
                  {event.batchId} · {event.city}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
