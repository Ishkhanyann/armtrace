import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import type { BatchStatus, Garment } from '../domain/model';
import { statusLabels } from '../lib/format';

export function Badge({ status }: { status: BatchStatus }) {
  return (
    <span className={`badge ${status}`}>
      <i />
      {statusLabels[status]}
    </span>
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
  locked = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
  locked?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timeout = setTimeout(
      () =>
        ref.current
          ?.querySelector<HTMLElement>('button, input, select, textarea, [tabindex="0"]')
          ?.focus(),
      0,
    );
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !locked) closeRef.current();
      if (event.key === 'Tab') {
        const nodes = ref.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex="0"]',
        );
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', key);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener('keydown', key);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [locked]);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !locked) onClose();
      }}
    >
      <div
        ref={ref}
        className={`modal ${wide ? 'wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="modal-head">
          <h2 id={titleId}>{title}</h2>
          <button className="icon-button" aria-label="Փակել" disabled={locked} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <div className="empty-icon">◇</div>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
    </div>
  );
}

export function GarmentArt({ type, className = '' }: { type: Garment; className?: string }) {
  const pattern = useId().replaceAll(':', '');
  const color = { tshirt: '#29394a', jacket: '#49665b', jeans: '#6485a6', hoodie: '#c8b497' }[type];
  return (
    <svg
      className={`garment-art ${className}`}
      viewBox="0 0 160 170"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={pattern}
          x1="30"
          y1="30"
          x2="135"
          y2="150"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={color} />
          <stop offset="1" stopColor={color} stopOpacity=".72" />
        </linearGradient>
      </defs>
      <ellipse cx="80" cy="153" rx="47" ry="5" fill="#0f172a" opacity=".07" />
      {type === 'jeans' ? (
        <>
          <path
            d="M48 24h64l7 117-29 3-10-77-10 77-29-3 7-117Z"
            fill={`url(#${pattern})`}
            stroke="#3f6288"
            strokeWidth="1.5"
          />
          <path
            d="M49 34h62M80 24v41M53 37c0 15 9 17 18 17M107 37c0 15-9 17-18 17M47 135l23 3m21 0 23-3"
            stroke="#c9d5dc"
            strokeWidth="1.3"
          />
          <path d="M79 28h3" stroke="#d7b678" strokeWidth="3" />
        </>
      ) : (
        <>
          {type === 'hoodie' && (
            <path d="M57 40c-2-33 48-33 46 0L80 63 57 40Z" fill="#ab9679" stroke="#a28b6d" />
          )}
          <path
            d={
              type === 'tshirt'
                ? 'm54 35-29 14-11 31 25 11 10-16v69h62V75l10 16 25-11-11-31-29-14c-9 14-43 14-52 0Z'
                : 'm55 35-26 17-9 81 25 5 6-58v64h58V80l6 58 25-5-9-81-26-17-25 15-25-15Z'
            }
            fill={`url(#${pattern})`}
            stroke={color}
            strokeWidth="1.5"
          />
          {type === 'tshirt' ? (
            <path
              d="M55 36c6 25 44 25 50 0M50 139h59M20 75l22 10m76 0 22-10"
              stroke="#d5e1ee"
              opacity=".25"
              strokeWidth="1.4"
            />
          ) : (
            <>
              <path
                d="M80 51v91M52 139h56M29 126l16 3m70 0 16-3"
                stroke="#fff"
                opacity=".4"
                strokeWidth="1.4"
              />
              {type === 'hoodie' ? (
                <>
                  <path d="m63 105-7 22h48l-7-22H63Z" stroke="#9b876b" />
                  <path d="M72 53v22m16-22v22" stroke="#eee4d6" strokeWidth="2" />
                </>
              ) : (
                <>
                  <path
                    d="M54 75h18v20H54m34-20h18v20H88M52 53h55M51 105h59M51 120h59"
                    stroke="#b8c8bc"
                    opacity=".6"
                  />
                  <path d="m56 35 10 25 14-10 14 10 10-25" stroke="#2f4a3e" />
                </>
              )}
            </>
          )}
          <rect x="95" y="80" width="8" height="5" rx="1" fill="#d3bc92" opacity=".8" />
        </>
      )}
    </svg>
  );
}
