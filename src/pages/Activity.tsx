import { useState } from 'react';
import { Download, Search } from 'lucide-react';
import { useApp } from '../store';
import { organization } from '../domain/model';
import { dateTime, downloadBlob, shortHash } from '../lib/format';
import { Empty } from '../components/UI';

export default function Activity() {
  const { state } = useApp();
  const [query, setQuery] = useState('');
  const events = state.batches
    .flatMap((batch) => batch.events.map((event) => ({ ...event, batchId: batch.id })))
    .sort((a, b) => b.date.localeCompare(a.date));
  const filtered = events.filter((event) =>
    `${event.title} ${event.batchId} ${event.city}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <section className="card">
        <div className="card-heading">
          <div>
            <h2>Իրադարձությունների մատյան</h2>
            <p>Փոխանցումները, խնդիրներն ու ուղղումները՝ ժամանակագրական հերթականությամբ</p>
          </div>
          <button
            className="button secondary small"
            onClick={() =>
              downloadBlob(
                JSON.stringify(events, null, 2),
                'armtrace-events.json',
                'application/json',
              )
            }
          >
            <Download size={15} />
            Արտահանել JSON
          </button>
        </div>
        <div className="table-toolbar">
          <label className="search-input">
            <Search size={16} />
            <input
              placeholder="Որոնել իրադարձություն…"
              aria-label="Որոնել իրադարձություն"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Իրադարձություն</th>
                <th>Խմբաքանակ</th>
                <th>Վայր</th>
                <th>Ամսաթիվ</th>
                <th>Գործարքի հեշ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((event) => (
                <tr key={event.id}>
                  <td className="event-title">{event.title}</td>
                  <td className="mono">{event.batchId}</td>
                  <td>{event.city}</td>
                  <td>{dateTime(event.date)}</td>
                  <td className="mono" title={event.hash}>
                    {shortHash(event.hash)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && <Empty title="Իրադարձություն չի գտնվել" />}
      </section>
      <section className="card">
        <div className="card-heading">
          <div>
            <h2>Web3 գործարքներ</h2>
            <p>Այս դիտարկիչում կատարված սիմուլյացված գործարքները</p>
          </div>
        </div>
        {state.transactions.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Գործողություն</th>
                  <th>Կազմակերպություն</th>
                  <th>Ամսաթիվ</th>
                  <th>Արդյունք</th>
                </tr>
              </thead>
              <tbody>
                {state.transactions.map((tx, i) => (
                  <tr key={`${tx.id}-${i}`}>
                    <td>
                      {tx.title}
                      <small className="block mono muted">{tx.batchId}</small>
                    </td>
                    <td>{organization(tx.orgId).name}</td>
                    <td>{dateTime(tx.date)}</td>
                    <td>
                      <span
                        className={`badge ${tx.status === 'success' ? 'delivered' : 'incident'}`}
                      >
                        {tx.status === 'success' ? 'Success' : 'Fail / Reverted'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="Գործարքներ դեռ չկան">
            Կատարեք առաջին ստորագրությունը՝ պատմությունն այստեղ տեսնելու համար։
          </Empty>
        )}
      </section>
    </>
  );
}
