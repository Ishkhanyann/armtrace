import { useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Download,
  FileCheck2,
  FileWarning,
  LockKeyhole,
  PackageCheck,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';
import { useApp } from '../store';
import {
  type Batch,
  type RegisterInput,
  canTransfer,
  documentMatches,
  nextStop,
  organization,
  organizations,
  referenceDocument,
  routeFor,
  routes,
  sha256,
} from '../domain/model';
import { dateTime, downloadBlob, shortHash } from '../lib/format';
import { Badge, Empty, GarmentArt, Modal } from '../components/UI';
import RouteMap from '../components/RouteMap';

export function BatchPicker({ batch, onSelect }: { batch: Batch; onSelect: (id: string) => void }) {
  const { state } = useApp();
  return (
    <label className="batch-picker">
      Խմբաքանակ
      <select value={batch.id} onChange={(e) => onSelect(e.target.value)}>
        {state.batches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.id} · {b.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export function TransferPanel({ batch }: { batch: Batch }) {
  const { actor, request, setIdentity } = useApp();
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState('');
  const next = nextStop(batch);
  const receiverId = batch.transfer?.to ?? next?.organizationId;
  const sender = organization(batch.custodianId);
  const receiver = receiverId ? organization(receiverId) : null;
  const switchTo = (id: string) => {
    const org = organization(id);
    setIdentity(org.role, id);
  };
  return (
    <div className="transfer-panel">
      <div className="transfer-heading">
        <span className="section-icon">
          <ShieldCheck size={21} />
        </span>
        <div>
          <h3>Պատասխանատվության փոխանցում</h3>
          <p>Երկկողմանի հաստատում · Multisig 2/2</p>
        </div>
      </div>
      <div className="transfer-parties">
        <div>
          <span className="avatar">{sender.initials}</span>
          <small>Ուղարկող</small>
          <strong>{sender.name}</strong>
          <span className={`signature-state ${batch.transfer ? 'signed' : ''}`}>
            {batch.transfer ? (
              <>
                <Check size={13} />
                Ստորագրված է
              </>
            ) : (
              'Սպասում է ստորագրության'
            )}
          </span>
        </div>
        <ArrowRight size={23} />
        <div>
          <span className="avatar green">{receiver?.initials ?? '✓'}</span>
          <small>Ստացող</small>
          <strong>{receiver?.name ?? 'Երթուղին ավարտված է'}</strong>
          <span className="signature-state">{receiver ? 'Սպասում է հաստատման' : 'Առաքված է'}</span>
        </div>
      </div>
      <div className="custody-notice">
        <LockKeyhole size={15} />
        <span>
          Ընթացիկ պատասխանատու՝ <strong>{sender.name}</strong>
        </span>
      </div>
      {batch.note && (
        <div className="issue-box">
          <FileWarning size={18} />
          <div>
            <strong>Փոխանցումը կասեցված է</strong>
            <p>{batch.note}</p>
            <a href="#/documents" className="text-button">
              Դիտել փաստաթղթերն ու խնդիրը <ArrowRight size={14} />
            </a>
          </div>
        </div>
      )}
      {canTransfer(batch) &&
        (actor.orgId === batch.custodianId ? (
          <button
            className="button primary full"
            onClick={() =>
              request({
                title: 'Ստորագրել փոխանցումը',
                command: { type: 'transfer', batchId: batch.id },
              })
            }
          >
            Ստորագրել և փոխանցել <ArrowRight size={16} />
          </button>
        ) : (
          <button className="button secondary full" onClick={() => switchTo(batch.custodianId)}>
            Անցնել ուղարկողի միջավայրին
          </button>
        ))}
      {batch.transfer &&
        !batch.note &&
        (actor.orgId === batch.transfer.to ? (
          <div className="button-row">
            <button className="button danger-outline" onClick={() => setRejecting(true)}>
              <X size={16} />
              Մերժել ընդունումը
            </button>
            <button
              className="button primary"
              onClick={() =>
                request({
                  title: 'Confirm Custody',
                  command: { type: 'accept', batchId: batch.id },
                })
              }
            >
              <PackageCheck size={17} />
              Confirm Custody
            </button>
          </div>
        ) : (
          <div className="info-box">
            Ուղարկողի ստորագրությունը գրանցված է։
            <button className="text-button" onClick={() => switchTo(batch.transfer!.to)}>
              Անցնել ստացողին և հաստատել <ArrowRight size={14} />
            </button>
          </div>
        ))}
      {batch.status === 'delivered' && (
        <div className="success-box">
          <CheckCircle2 size={20} />
          Խմբաքանակն առաքված է։ Բոլոր փոխանցումները հաստատված են։
        </div>
      )}
      {rejecting && (
        <form
          className="info-box rejection-form"
          onSubmit={(e) => {
            e.preventDefault();
            request({
              title: 'Մերժել ընդունումը',
              command: { type: 'reject', batchId: batch.id, note },
            });
            setRejecting(false);
          }}
        >
          <p>Պատասխանատվությունը կմնա ուղարկողի մոտ։</p>
          <label className="field full">
            Պատճառ
            <textarea
              minLength={4}
              maxLength={300}
              required
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Օրինակ՝ վնասված փաթեթավորում"
            />
          </label>
          <div className="button-row full">
            <button type="button" className="button secondary" onClick={() => setRejecting(false)}>
              Չեղարկել
            </button>
            <button className="button danger">Գրանցել մերժումը</button>
          </div>
        </form>
      )}
    </div>
  );
}

export function Transfers({ batch, onSelect }: { batch: Batch; onSelect: (id: string) => void }) {
  return (
    <>
      <BatchPicker batch={batch} onSelect={onSelect} />
      <div className="operations-grid">
        <section className="card padded">
          <div className="inline-heading">
            <div>
              <span className="eyebrow">{batch.id}</span>
              <h2>{batch.name}</h2>
            </div>
            <Badge status={batch.status} />
          </div>
          <TransferPanel batch={batch} />
        </section>
        <section className="card padded">
          <h2>Ինչպե՞ս է աշխատում փոխանցումը</h2>
          <div className="explanation-steps">
            {[
              [
                '01',
                'Ուղարկողը ստորագրում է',
                'Խմբաքանակը շարունակում է մնալ նրա պատասխանատվության տակ։',
              ],
              ['02', 'Ստացողը ստուգում է', 'Ստուգվում են ապրանքն ու փաթեթավորման վիճակը։'],
              ['03', 'Երկրորդ ստորագրություն', 'Միայն հաստատումից հետո է փոխվում պատասխանատուն։'],
            ].map(([n, title, body]) => (
              <div key={n}>
                <span>{n}</span>
                <section>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </section>
              </div>
            ))}
          </div>
          <div className="info-box">
            Դերը կամ կազմակերպությունը փոխելիս դրամապանակը պետք է կրկին միացնել։
          </div>
        </section>
      </div>
    </>
  );
}

export function RoutePage({ batch, onSelect }: { batch: Batch; onSelect: (id: string) => void }) {
  const { state } = useApp();
  const route = routeFor(batch.routeId);
  return (
    <>
      <div className="route-options">
        {state.batches.slice(0, 4).map((b) => (
          <button
            key={b.id}
            className={`route-option ${batch.id === b.id ? 'selected' : ''}`}
            onClick={() => onSelect(b.id)}
          >
            <span className="mono">{b.id}</span>
            <strong>{routeFor(b.routeId).name}</strong>
            <Badge status={b.status} />
          </button>
        ))}
      </div>
      <BatchPicker batch={batch} onSelect={onSelect} />
      <section className="card">
        <div className="card-heading">
          <div>
            <h2>{route.name}</h2>
            <p>
              {route.countries} · {batch.name}
            </p>
          </div>
          <Badge status={batch.status} />
        </div>
        <RouteMap batch={batch} />
        <div className="route-progress">
          {route.stops.map((stop, index) => (
            <div key={index} className={index <= batch.stage ? 'complete' : ''}>
              <span>{index < batch.stage ? <Check size={15} /> : index + 1}</span>
              <strong>{stop.city}</strong>
              <small>{stop.kind}</small>
              <small className="mono">
                {stop.lat.toFixed(3)}, {stop.lng.toFixed(3)}
              </small>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export function Documents({ batch, onSelect }: { batch: Batch; onSelect: (id: string) => void }) {
  const { actor, request, notify } = useApp();
  const [hashing, setHashing] = useState(false);
  const [note, setNote] = useState('');
  const hasIssue = ['customs', 'integrity', 'incident'].includes(batch.status);
  const permitted =
    actor.role === 'admin' ||
    actor.orgId === batch.custodianId ||
    actor.orgId === batch.manufacturerId;
  return (
    <>
      <BatchPicker batch={batch} onSelect={onSelect} />
      <div className="operations-grid">
        <section className="card padded">
          <div className="inline-heading">
            <div>
              <h2>Առաքման փաստաթուղթ</h2>
              <p className="muted mono">{batch.id}</p>
            </div>
            <span className={`document-state ${documentMatches(batch) ? 'verified' : ''}`}>
              {documentMatches(batch) ? <FileCheck2 size={25} /> : <FileWarning size={25} />}
            </span>
          </div>
          <div className={documentMatches(batch) ? 'success-box' : 'info-box'}>
            {documentMatches(batch)
              ? 'Վերջին ֆայլը համապատասխանում է գրանցված բնօրինակին։'
              : 'Ավելացրեք փաստաթուղթ՝ ամբողջականությունը ստուգելու համար։'}
          </div>
          <label className={`upload-area ${!permitted || hashing ? 'disabled' : ''}`}>
            <Upload size={27} />
            <strong>{hashing ? 'Calculating SHA-256…' : 'Ընտրել փաստաթուղթ'}</strong>
            <span>Մինչև 5 MB · ֆայլի բովանդակությունը չի հրապարակվում</span>
            <input
              type="file"
              aria-label="Վերբեռնել փաստաթուղթ"
              disabled={!permitted || hashing}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 5 * 1024 * 1024) {
                  notify('Ֆայլը պետք է լինի մինչև 5 MB։');
                  e.target.value = '';
                  return;
                }
                setHashing(true);
                try {
                  const hash = await sha256(await file.arrayBuffer());
                  request({
                    title: 'Գրանցել փաստաթղթի հեշը',
                    command: { type: 'upload', batchId: batch.id, name: file.name, hash },
                  });
                } catch {
                  notify('Ֆայլը չհաջողվեց կարդալ։ Փորձեք կրկին։');
                } finally {
                  setHashing(false);
                  e.target.value = '';
                }
              }}
            />
          </label>
          {!permitted && (
            <p className="fine-print">Ավելացնել կարող է պատասխանատուն, արտադրողը կամ վերահսկողը։</p>
          )}
          <button
            className="button secondary full"
            onClick={() => downloadBlob(referenceDocument(batch.id), `${batch.id}-original.txt`)}
          >
            <Download size={16} />
            Ներբեռնել ցուցադրական բնօրինակը
          </button>
          <p className="fine-print">
            Ստուգման համար ներբեռնեք բնօրինակը և կրկին վերբեռնեք։ Փոփոխված ֆայլը կառաջացնի
            անհամապատասխանություն։
          </p>
          <details className="technical-details">
            <summary>Գրանցված SHA-256</summary>
            <code className="hash-value">{batch.document.expectedHash}</code>
          </details>
        </section>
        <section className="card padded">
          <h2>Խնդրի կարգավորում</h2>
          {hasIssue ? (
            <>
              <div className="issue-box">
                <FileWarning size={20} />
                <p>{batch.note}</p>
              </div>
              <Badge status={batch.status} />
              <p className="muted">
                {batch.status === 'incident'
                  ? 'Գրանցեք զննման կամ վերափաթեթավորման արդյունքը։'
                  : 'Շարունակելուց առաջ պահանջվում է բնօրինակին համապատասխան փաստաթուղթ։'}
              </p>
              {actor.role === 'admin' ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    request({
                      title: 'Հաստատել խնդրի լուծումը',
                      command: { type: 'resolve', batchId: batch.id, note },
                      onSuccess: () => setNote(''),
                    });
                  }}
                >
                  <label className="field">
                    Լուծման նկարագրություն
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      required
                      minLength={4}
                      maxLength={300}
                      placeholder="Նկարագրեք ստուգման արդյունքը…"
                    />
                  </label>
                  <button
                    className="button primary full"
                    disabled={batch.status !== 'incident' && !documentMatches(batch)}
                  >
                    <CheckCircle2 size={17} />
                    {batch.status === 'customs' ? 'Թույլատրել շարունակել երթուղին' : 'Փակել խնդիրը'}
                  </button>
                </form>
              ) : (
                <div className="info-box">Խնդրի լուծումը հաստատում է վերահսկողը։</div>
              )}
            </>
          ) : (
            <div className="all-clear">
              <CheckCircle2 size={42} />
              <strong>Բաց խնդիրներ չկան</strong>
              <p>Խմբաքանակը պատրաստ է հաջորդ քայլին։</p>
            </div>
          )}
        </section>
      </div>
      <section className="card">
        <div className="card-heading">
          <div>
            <h2>Փաստաթղթի տարբերակներ</h2>
            <p>Նախորդ գրառումները պահպանվում են։</p>
          </div>
        </div>
        {batch.document.versions.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Ֆայլ</th>
                  <th>SHA-256</th>
                  <th>Գրանցվել է</th>
                  <th>Արդյունք</th>
                </tr>
              </thead>
              <tbody>
                {batch.document.versions.map((v, index) => (
                  <tr key={index}>
                    <td>
                      {v.name}
                      <small className="block muted">Տարբերակ {index + 1}</small>
                    </td>
                    <td className="mono" title={v.hash}>
                      {shortHash(v.hash)}
                    </td>
                    <td>{dateTime(v.date)}</td>
                    <td>
                      <span className={`badge ${v.matches ? 'delivered' : 'incident'}`}>
                        {v.matches ? 'Համապատասխանում է' : 'Չի համապատասխանում'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="Փաստաթուղթ դեռ չի ավելացվել" />
        )}
      </section>
    </>
  );
}

export function RegisterModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const { actor, state, request } = useApp();
  const allowedRoutes = routes.filter((r) => r.source === actor.orgId);
  const [input, setInput] = useState<RegisterInput>({
    name: '',
    sku: '',
    garment: 'tshirt',
    color: 'Սև',
    size: 'M',
    quantity: 100,
    composition: '100% բամբակ',
    productionDate: new Date().toISOString().slice(0, 10),
    routeId: allowedRoutes[0]?.id ?? 'am-ge',
  });
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof RegisterInput>(key: K, value: RegisterInput[K]) =>
    setInput((current) => ({ ...current, [key]: value }));
  return (
    <Modal title="Նոր խմբաքանակ" onClose={onClose} wide>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            const id = `AT-2026-${String(Math.max(0, ...state.batches.map((b) => Number(b.id.split('-').at(-1)) || 0)) + 1).padStart(3, '0')}`;
            const expectedHash = await sha256(referenceDocument(id));
            request({
              title: 'Գրանցել նոր խմբաքանակ',
              command: { type: 'register', input, expectedHash },
              onSuccess: onCreated,
            });
            onClose();
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="form-intro">
          <GarmentArt type={input.garment} />
          <div>
            <h3>Ապրանքի տվյալներ</h3>
            <p>Մեկ խմբաքանակում՝ մեկ արտիկուլ, գույն և չափս։</p>
          </div>
        </div>
        <div className="form-grid">
          <label className="field">
            Ապրանքի անվանում
            <input
              value={input.name}
              onChange={(e) => set('name', e.target.value)}
              required
              maxLength={120}
              placeholder="Օրինակ՝ բամբակյա շապիկ"
            />
          </label>
          <label className="field">
            Արտիկուլ / SKU
            <input
              value={input.sku}
              onChange={(e) => set('sku', e.target.value)}
              required
              maxLength={40}
              placeholder="AR-TS-002"
            />
          </label>
          <label className="field">
            Տեսակ
            <select
              value={input.garment}
              onChange={(e) => set('garment', e.target.value as RegisterInput['garment'])}
            >
              <option value="tshirt">Շապիկ</option>
              <option value="jacket">Բաճկոն</option>
              <option value="jeans">Ջինս</option>
              <option value="hoodie">Հուդի</option>
            </select>
          </label>
          <label className="field">
            Գույն
            <input
              value={input.color}
              onChange={(e) => set('color', e.target.value)}
              required
              maxLength={40}
            />
          </label>
          <label className="field">
            Չափս
            <select value={input.size} onChange={(e) => set('size', e.target.value)}>
              {['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36'].map((size) => (
                <option key={size}>{size}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Քանակ
            <input
              type="number"
              min={1}
              max={1000000}
              value={input.quantity}
              onChange={(e) => set('quantity', Number(e.target.value))}
              required
            />
          </label>
          <label className="field">
            Բաղադրություն
            <input
              value={input.composition}
              onChange={(e) => set('composition', e.target.value)}
              required
              maxLength={120}
            />
          </label>
          <label className="field">
            Արտադրության ամսաթիվ
            <input
              type="date"
              value={input.productionDate}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => set('productionDate', e.target.value)}
              required
            />
          </label>
          <label className="field span-two">
            Երթուղի
            <select value={input.routeId} onChange={(e) => set('routeId', e.target.value)}>
              {allowedRoutes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="modal-actions">
          <button type="button" className="button secondary" onClick={onClose}>
            Չեղարկել
          </button>
          <button className="button primary" disabled={busy}>
            {busy ? 'Պատրաստվում է…' : 'Գրանցել և ստեղծել QR'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function Participants() {
  const { state, request } = useApp();
  return (
    <section className="card">
      <div className="card-heading">
        <div>
          <h2>Ցանցի մասնակիցները</h2>
          <p>Անջատված կազմակերպությունը չի կարող ստորագրել կամ ստանալ փոխանցումներ։</p>
        </div>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Կազմակերպություն</th>
              <th>Տեղադրություն</th>
              <th>Դեր</th>
              <th>Մուտք</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((org) => (
              <tr key={org.id}>
                <td>
                  <span className="participant-cell">
                    <span className="avatar">{org.initials}</span>
                    <strong>{org.name}</strong>
                  </span>
                </td>
                <td>{org.city}</td>
                <td>
                  {org.role === 'manufacturer'
                    ? 'Արտադրող'
                    : org.role === 'logistics'
                      ? 'Լոգիստիկա'
                      : 'Վերահսկող'}
                </td>
                <td>
                  <button
                    role="switch"
                    aria-checked={state.access[org.id]}
                    aria-label={`${org.name} մուտք`}
                    className={`toggle ${state.access[org.id] ? 'on' : ''}`}
                    disabled={org.role === 'admin'}
                    onClick={() =>
                      request({
                        title: 'Փոխել մասնակցի մուտքը',
                        command: { type: 'access', orgId: org.id, active: !state.access[org.id] },
                      })
                    }
                  >
                    <span />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
