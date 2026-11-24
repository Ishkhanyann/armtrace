import { useState } from 'react';
import { ArrowRight, Check, CheckCircle2, MapPin, Package, Search, Shirt } from 'lucide-react';
import { type Batch, publicPassport } from '../domain/model';
import { GarmentArt } from '../components/UI';
import { parseBatchLookup, publicStatusLabels, shortDate } from '../lib/format';

export default function Passport({
  batch,
  missingId,
  onLookup,
}: {
  batch?: Batch;
  missingId?: string;
  onLookup: (id: string) => void;
}) {
  const [lookup, setLookup] = useState('');
  const [error, setError] = useState('');
  const passport = batch ? publicPassport(batch) : null;
  return (
    <main className="consumer-main">
      <div className="passport-title">
        <span className="eyebrow">ԱՐՏԱԴՐՎԱԾ Է ՎՍՏԱՀՈՒԹՅԱՄԲ</span>
        <h1>Ճանաչեք ձեր հագուստի ճանապարհը։</h1>
        <p>Արտադրամասից մինչև ձեր ձեռքերը՝ ամենակարևորը մեկ էջում։</p>
      </div>
      {!passport ? (
        <div className="card padded center">
          <Package size={40} />
          <h2>Ապրանքը չի գտնվել</h2>
          <p className="muted">
            {missingId || 'Ստուգեք խմբաքանակի համարը կամ սկանավորեք QR կոդը։'}
          </p>
        </div>
      ) : (
        <>
          <section className="passport-product card">
            <div className={`passport-art ${passport.garment}`}>
              <span className="passport-brand">{passport.manufacturer}</span>
              <GarmentArt type={passport.garment} />
              <span className="product-collection">TRACEABLE COLLECTION · 2026</span>
            </div>
            <div className="passport-info">
              <span className="passport-kicker">
                <Shirt size={15} />
                Ապրանքի անձնագիր
              </span>
              <h2>{passport.name}</h2>
              <p className="article">Արտիկուլ՝ {passport.sku}</p>
              <div className="product-tags">
                <span>{passport.color}</span>
                <span>Չափս՝ {passport.size}</span>
              </div>
              <dl className="product-facts">
                <div>
                  <dt>Բաղադրություն</dt>
                  <dd>{passport.composition}</dd>
                </div>
                <div>
                  <dt>Արտադրող</dt>
                  <dd>{passport.manufacturer}</dd>
                </div>
                <div>
                  <dt>Ծագման երկիր</dt>
                  <dd>{passport.origin}</dd>
                </div>
                <div>
                  <dt>Արտադրվել է</dt>
                  <dd>{shortDate(passport.productionDate)}</dd>
                </div>
              </dl>
              <div
                className={`consumer-status ${['customs', 'integrity', 'incident'].includes(passport.status) ? 'delayed' : ''}`}
              >
                <Package size={23} />
                <div>
                  <small>Առաքման կարգավիճակ</small>
                  <strong>{publicStatusLabels[passport.status]}</strong>
                </div>
              </div>
            </div>
          </section>
          <section className="card passport-journey">
            <div className="card-heading">
              <div>
                <h2>
                  <MapPin size={20} />
                  Ապրանքի ճանապարհը
                </h2>
                <p>Կարևոր կանգառները՝ պարզ ու հասկանալի</p>
              </div>
              <span className="count-chip">
                {passport.route.filter((stop) => stop.complete).length} / {passport.route.length}
              </span>
            </div>
            <div className="consumer-route">
              {passport.route.map((stop, index) => (
                <div key={index} className={stop.complete ? 'complete' : ''}>
                  <span>{stop.complete ? <Check size={19} /> : index + 1}</span>
                  <strong>{stop.city}</strong>
                  <small>{stop.country}</small>
                  <em>{stop.complete ? 'Գրանցված է' : 'Սպասվում է'}</em>
                </div>
              ))}
            </div>
          </section>
          <section className="card padded">
            <h2>Պատմության կարևոր պահերը</h2>
            <div className="public-events">
              {passport.milestones.map((event, index) => (
                <div key={index}>
                  <span>
                    <CheckCircle2 size={18} />
                  </span>
                  <strong>
                    {event.title}
                    <small>{event.city}</small>
                  </strong>
                  <time>{shortDate(event.date)}</time>
                </div>
              ))}
            </div>
          </section>
          <div className="passport-signoff">
            <CheckCircle2 size={19} />
            <span>Թափանցիկ պատմություն։ Ավելի գիտակից ընտրություն։</span>
          </div>
        </>
      )}
      <form
        className="passport-lookup"
        onSubmit={(e) => {
          e.preventDefault();
          const id = parseBatchLookup(lookup);
          if (id) {
            setError('');
            onLookup(id);
          } else setError('Մուտքագրեք ճիշտ խմբաքանակի համարը։');
        }}
      >
        <label htmlFor="public-lookup">Ունե՞ք այլ խմբաքանակի համար</label>
        <div>
          <Search size={17} />
          <input
            id="public-lookup"
            value={lookup}
            onChange={(e) => setLookup(e.target.value)}
            placeholder="AT-2026-001"
            required
          />
          <button aria-label="Գտնել ապրանքը" className="icon-button">
            <ArrowRight size={19} />
          </button>
        </div>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
      </form>
      <footer className="consumer-footer">
        <strong>ArmTrace</strong>
        <span>Հագուստի ճանապարհը՝ բաց և հասանելի։</span>
        <small>Ուսումնական ցուցադրություն</small>
      </footer>
    </main>
  );
}
