import type { BatchStatus, Role } from '../domain/model';

export const roleLabels: Record<Role, string> = {
  manufacturer: 'Արտադրող',
  logistics: 'Լոգիստիկ օպերատոր',
  admin: 'Վերահսկող',
  consumer: 'Սպառող',
};
export const statusLabels: Record<BatchStatus, string> = {
  ready: 'Պատրաստ է',
  in_transit: 'Ճանապարհին',
  customs: 'Մաքսային սպասում',
  integrity: 'Ստուգման կարիք',
  incident: 'Բաց խնդիր',
  delivered: 'Առաքված է',
};
export const publicStatusLabels: Record<BatchStatus, string> = {
  ...statusLabels,
  integrity: 'Լրացուցիչ ստուգում',
  incident: 'Առաքումը հետաձգված է',
};
export const dateTime = (value: string) =>
  new Intl.DateTimeFormat('hy-AM', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
export const shortDate = (value: string) =>
  new Intl.DateTimeFormat('hy-AM', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(value),
  );
export const shortHash = (value: string) => value.slice(0, 8) + '…' + value.slice(-6);

export function downloadBlob(
  content: BlobPart,
  filename: string,
  type = 'text/plain;charset=utf-8',
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function passportUrl(id: string) {
  return `${window.location.origin}${window.location.pathname}#/passport/${encodeURIComponent(id)}`;
}
export function parseBatchLookup(value: string) {
  const trimmed = value.trim();
  if (/^AT-\d{4}-\d{3,}$/.test(trimmed)) return trimmed;
  try {
    return decodeURIComponent(
      new URL(trimmed).hash.match(/^#\/passport\/(AT-\d{4}-\d{3,})$/)?.[1] ?? '',
    );
  } catch {
    return '';
  }
}
