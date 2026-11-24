import { useState } from 'react';
import { ArrowUpRight, ChevronRight, QrCode, Search, SlidersHorizontal } from 'lucide-react';
import { type Batch, type BatchStatus, organization, routeFor } from '../domain/model';
import { dateTime, statusLabels } from '../lib/format';
import { Badge, Empty, GarmentArt } from './UI';

export function BatchTable({
  batches,
  onDetails,
  onQR,
  compact = false,
}: {
  batches: Batch[];
  onDetails: (id: string) => void;
  onQR: (id: string) => void;
  compact?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const filtered = batches.filter(
    (b) =>
      `${b.name} ${b.id} ${b.sku} ${routeFor(b.routeId).countries}`
        .toLocaleLowerCase()
        .includes(query.toLocaleLowerCase()) &&
      (status === 'all' || b.status === status),
  );
  return (
    <section className="card batches-card">
      <div className="card-heading">
        <div>
          <h2>
            {compact ? 'Վերջին խմբաքանակները' : 'Բոլոր խմբաքանակները'}{' '}
            <span className="count-chip">{batches.length}</span>
          </h2>
          {!compact && <p>Որոնեք, ստուգեք և կառավարեք հագուստի շարժը։</p>}
        </div>
        {compact && (
          <a className="text-button" href="#/batches">
            Տեսնել բոլորը <ArrowUpRight size={15} />
          </a>
        )}
      </div>
      <div className="table-toolbar">
        <label className="search-input">
          <Search size={17} />
          <input
            aria-label="Որոնել խմբաքանակ"
            placeholder="Որոնել անունով, համարով կամ երկրով…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="filter-select">
          <SlidersHorizontal size={15} />
          <select
            aria-label="Ֆիլտրել կարգավիճակով"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">Բոլոր կարգավիճակները</option>
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Ապրանք / Batch ID</th>
              <th>Երթուղի</th>
              <th>Կարգավիճակ</th>
              <th>Պատասխանատու</th>
              {!compact && <th>Վերջին գրառում</th>}
              <th>
                <span className="sr-only">Գործողություններ</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((batch) => (
              <tr key={batch.id}>
                <td>
                  <button className="product-cell" onClick={() => onDetails(batch.id)}>
                    <span className={`product-thumb ${batch.garment}`}>
                      <GarmentArt type={batch.garment} />
                    </span>
                    <span>
                      <strong>{batch.name}</strong>
                      <small className="mono">{batch.id}</small>
                    </span>
                  </button>
                </td>
                <td>
                  <div className="route-cell">
                    <strong>{routeFor(batch.routeId).name}</strong>
                    <small>
                      {batch.quantity} հատ · {batch.size} · {batch.color}
                    </small>
                  </div>
                </td>
                <td>
                  <Badge status={batch.status as BatchStatus} />
                </td>
                <td>
                  <span className="org-cell">
                    <i />
                    {organization(batch.custodianId).name}
                  </span>
                </td>
                {!compact && <td className="date-cell">{dateTime(batch.events.at(-1)!.date)}</td>}
                <td>
                  <div className="row-actions">
                    <button
                      className="icon-button"
                      aria-label={`${batch.id} QR կոդ`}
                      onClick={() => onQR(batch.id)}
                    >
                      <QrCode size={17} />
                    </button>
                    <button
                      className="icon-button"
                      aria-label={`${batch.id} մանրամասներ`}
                      onClick={() => onDetails(batch.id)}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && (
        <Empty title="Խմբաքանակ չի գտնվել">Փոխեք որոնման բառը կամ կարգավիճակը։</Empty>
      )}
      <div className="table-footer">
        Ցուցադրված է {filtered.length} / {batches.length} խմբաքանակ{' '}
        <span>Մեկ QR կոդ՝ մեկ խմբաքանակի համար</span>
      </div>
    </section>
  );
}
