import { ExternalLink, FileJson2, MapPin, QrCode } from 'lucide-react';
import { type Batch, organization, routeFor } from '../domain/model';
import { dateTime, shortDate } from '../lib/format';
import { Badge, GarmentArt, Modal } from './UI';
import { TransferPanel } from '../pages/Operations';

export default function BatchDetails({
  batch,
  onClose,
  onQR,
}: {
  batch: Batch;
  onClose: () => void;
  onQR: () => void;
}) {
  const route = routeFor(batch.routeId);
  return (
    <Modal title="Խմբաքանակի մանրամասներ" onClose={onClose} wide>
      <div className="detail-product">
        <div className={`detail-art ${batch.garment}`}>
          <GarmentArt type={batch.garment} />
        </div>
        <div>
          <span className="eyebrow mono">{batch.id}</span>
          <h2>{batch.name}</h2>
          <p>
            {batch.sku} · {batch.color} · {batch.size}
          </p>
          <Badge status={batch.status} />
          <div className="detail-buttons">
            <button className="button secondary small" onClick={onQR}>
              <QrCode size={15} />
              QR կոդ
            </button>
            <a className="button secondary small" href={`#/passport/${batch.id}`} onClick={onClose}>
              Անձնագիր <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
      <div className="detail-facts">
        <div>
          <small>Քանակ</small>
          <strong>{batch.quantity} հատ</strong>
        </div>
        <div>
          <small>Արտադրող</small>
          <strong>{organization(batch.manufacturerId).name}</strong>
        </div>
        <div>
          <small>Բաղադրություն</small>
          <strong>{batch.composition}</strong>
        </div>
        <div>
          <small>Արտադրվել է</small>
          <strong>{shortDate(batch.productionDate)}</strong>
        </div>
      </div>
      <div className="detail-route">
        <MapPin size={17} />
        <span>{route.name}</span>
        <strong>
          {batch.stage + 1} / {route.stops.length} կանգառ
        </strong>
      </div>
      <TransferPanel batch={batch} />
      <div className="detail-history">
        <h3>Իրադարձությունների պատմություն</h3>
        {[...batch.events].reverse().map((event) => (
          <div key={event.id} className="history-item">
            <span className={`history-dot ${event.type}`} />
            <div>
              <strong>{event.title}</strong>
              <small>
                {event.city} · {dateTime(event.date)}
              </small>
              <details>
                <summary>Սիմուլյացված գործարքի հեշ</summary>
                <code className="hash-value">{event.hash}</code>
              </details>
            </div>
          </div>
        ))}
      </div>
      <details className="technical-details">
        <summary>
          <FileJson2 size={16} />
          Digital Product Passport · NFT
        </summary>
        <div className="info-box">Ուսումնական նախատիպ․ իրական NFT չի թողարկվել։</div>
        <pre>
          {JSON.stringify(
            {
              name: batch.name,
              tokenId: batch.id,
              standard: 'ERC-721 (simulation)',
              batchId: batch.id,
              manufacturer: organization(batch.manufacturerId).name,
              attributes: [
                { trait_type: 'Color', value: batch.color },
                { trait_type: 'Size', value: batch.size },
                { trait_type: 'Composition', value: batch.composition },
              ],
              documentHash: batch.document.expectedHash,
            },
            null,
            2,
          )}
        </pre>
      </details>
    </Modal>
  );
}
