import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Camera, Download, ScanLine, Upload } from 'lucide-react';
import type { IScannerControls } from '@zxing/browser';
import { Modal } from './UI';
import { parseBatchLookup, passportUrl } from '../lib/format';

export function QRModal({ batchId, onClose }: { batchId: string; onClose: () => void }) {
  const [image, setImage] = useState('');
  const [error, setError] = useState('');
  const url = passportUrl(batchId);
  useEffect(() => {
    let alive = true;
    void QRCode.toDataURL(url, {
      width: 520,
      margin: 3,
      color: { dark: '#142b45', light: '#ffffff' },
    })
      .then((value) => {
        if (alive) setImage(value);
      })
      .catch(() => setError('QR կոդը չստեղծվեց։ Փորձեք կրկին։'));
    return () => {
      alive = false;
    };
  }, [url]);
  return (
    <Modal title="Խմբաքանակի QR կոդ" onClose={onClose}>
      <div className="qr-content">
        <span className="eyebrow">{batchId}</span>
        {image ? (
          <img src={image} width="236" height="236" alt={`${batchId} անձնագրի QR կոդ`} />
        ) : (
          <p>{error || 'Ստեղծվում է…'}</p>
        )}
        <h3>Մեկ սկանավորում՝ ամբողջ ճանապարհը</h3>
        <p>Բացում է ապրանքի հանրային անձնագիրը։</p>
        <code className="url-box">{url}</code>
        {image && (
          <a href={image} download={`${batchId}-QR.png`} className="button primary">
            <Download size={16} />
            Ներբեռնել PNG
          </a>
        )}
        <button
          className="button secondary"
          onClick={() => {
            location.hash = `/passport/${batchId}`;
            onClose();
          }}
        >
          Բացել անձնագիրը
        </button>
      </div>
    </Modal>
  );
}

export function ScannerModal({
  onClose,
  onFound,
}: {
  onClose: () => void;
  onFound: (id: string) => void;
}) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [camera, setCamera] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const controls = useRef<IScannerControls | null>(null);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      controls.current?.stop();
    };
  }, []);
  const found = (input: string) => {
    const id = parseBatchLookup(input);
    if (!id) {
      setError('QR կոդը չի պարունակում ArmTrace-ի խմբաքանակ։');
      return;
    }
    controls.current?.stop();
    onFound(id);
  };
  const startCamera = async () => {
    setError('');
    setBusy(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera unavailable');
      const { BrowserQRCodeReader } = await import('@zxing/browser');
      const reader = new BrowserQRCodeReader();
      const scanner = await reader.decodeFromVideoDevice(undefined, video.current!, (result) => {
        if (result && alive.current) found(result.getText());
      });
      if (!alive.current) scanner.stop();
      else {
        controls.current = scanner;
        setCamera(true);
      }
    } catch {
      if (alive.current)
        setError('Տեսախցիկը հասանելի չէ։ Թույլատրեք մուտքը կամ ընտրեք QR-ի նկարը։');
    } finally {
      if (alive.current) setBusy(false);
    }
  };
  return (
    <Modal title="Սկանավորել QR կոդը" onClose={onClose}>
      <div className={`scanner-view ${camera ? 'active' : ''}`}>
        <video ref={video} autoPlay playsInline muted />
        {!camera && (
          <>
            <ScanLine size={52} strokeWidth={1.3} />
            <span>Տեղադրեք QR կոդը շրջանակի մեջ</span>
          </>
        )}
        <div className="scan-corners" />
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <div className="button-row">
        <button
          className="button secondary"
          disabled={busy || camera}
          onClick={() => void startCamera()}
        >
          <Camera size={17} />
          {busy ? 'Միացում…' : 'Բացել տեսախցիկը'}
        </button>
        <label className="button secondary file-button">
          <Upload size={17} />
          Ընտրել նկար
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const url = URL.createObjectURL(file);
              setError('');
              try {
                const { BrowserQRCodeReader } = await import('@zxing/browser');
                const result = await new BrowserQRCodeReader().decodeFromImageUrl(url);
                if (alive.current) found(result.getText());
              } catch {
                if (alive.current) setError('Նկարում QR կոդ չի գտնվել։ Փորձեք ավելի հստակ նկար։');
              } finally {
                URL.revokeObjectURL(url);
                e.target.value = '';
              }
            }}
          />
        </label>
      </div>
      <div className="divider-label">կամ մուտքագրեք համարը</div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          found(value);
        }}
      >
        <label className="field">
          Batch ID կամ անձնագրի հղում
          <input
            autoComplete="off"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="AT-2026-001"
            required
          />
        </label>
        <button className="button primary full" type="submit">
          Գտնել խմբաքանակը
        </button>
      </form>
    </Modal>
  );
}
