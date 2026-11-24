import { z } from 'zod';

export const roleSchema = z.enum(['manufacturer', 'logistics', 'admin', 'consumer']);
export type Role = z.infer<typeof roleSchema>;
export type StaffRole = Exclude<Role, 'consumer'>;
export type Garment = 'tshirt' | 'jacket' | 'jeans' | 'hoodie';
export const statusSchema = z.enum([
  'ready',
  'in_transit',
  'customs',
  'integrity',
  'incident',
  'delivered',
]);
export type BatchStatus = z.infer<typeof statusSchema>;

export const organizations = [
  { id: 'am-factory', name: 'Արեգ Տեքստիլ', role: 'manufacturer', city: 'Գյումրի', initials: 'ԱՏ' },
  { id: 'ge-factory', name: 'Kartli Wear', role: 'manufacturer', city: 'Թբիլիսի', initials: 'KW' },
  { id: 'it-factory', name: 'Linea Milano', role: 'manufacturer', city: 'Միլան', initials: 'LM' },
  { id: 'am-cargo', name: 'Արարատ Լոգիստիկ', role: 'logistics', city: 'Երևան', initials: 'ԱԼ' },
  { id: 'ge-cargo', name: 'Caucasus Cargo', role: 'logistics', city: 'Թբիլիսի', initials: 'CC' },
  { id: 'ge-store', name: 'Tbilisi Concept', role: 'logistics', city: 'Թբիլիսի', initials: 'TC' },
  { id: 'am-store', name: 'Երևան Սթոր', role: 'logistics', city: 'Երևան', initials: 'ԵՍ' },
  {
    id: 'eu-cargo',
    name: 'EuroLine Logistics',
    role: 'logistics',
    city: 'Ֆրանկֆուրտ',
    initials: 'EL',
  },
  { id: 'de-store', name: 'Berlin Depot', role: 'logistics', city: 'Բեռլին', initials: 'BD' },
  { id: 'controller', name: 'ArmTrace Control', role: 'admin', city: 'Երևան', initials: 'AC' },
] as const;
export type Organization = (typeof organizations)[number];
export function organization(id: string) {
  const org = organizations.find((item) => item.id === id);
  if (!org) throw new Error('Կազմակերպությունը չի գտնվել։');
  return org;
}
export function walletAddress(id: string) {
  const index = organizations.findIndex((org) => org.id === id) + 1;
  return `0x${index.toString(16).padStart(4, '0')}71C28a3F1e9D04b672cA008eE39A${index.toString(16).padStart(9, '0')}`;
}

export type RouteStop = {
  city: string;
  country: string;
  lat: number;
  lng: number;
  organizationId: string;
  kind: string;
};
export type Route = {
  id: string;
  name: string;
  countries: string;
  source: string;
  stops: RouteStop[];
};
export const routes: Route[] = [
  {
    id: 'am-ge',
    name: 'Գյումրի → Թբիլիսի',
    countries: 'Հայաստան → Վրաստան',
    source: 'am-factory',
    stops: [
      {
        city: 'Գյումրի',
        country: 'Հայաստան',
        lat: 40.789,
        lng: 43.847,
        organizationId: 'am-factory',
        kind: 'Արտադրություն',
      },
      {
        city: 'Վանաձոր',
        country: 'Հայաստան',
        lat: 40.812,
        lng: 44.489,
        organizationId: 'am-cargo',
        kind: 'Փոխադրում',
      },
      {
        city: 'Սադախլո',
        country: 'Վրաստան',
        lat: 41.238,
        lng: 44.79,
        organizationId: 'ge-cargo',
        kind: 'Սահմանային հանգույց',
      },
      {
        city: 'Թբիլիսի',
        country: 'Վրաստան',
        lat: 41.715,
        lng: 44.827,
        organizationId: 'ge-store',
        kind: 'Խանութ',
      },
    ],
  },
  {
    id: 'ge-am',
    name: 'Թբիլիսի → Երևան',
    countries: 'Վրաստան → Հայաստան',
    source: 'ge-factory',
    stops: [
      {
        city: 'Թբիլիսի',
        country: 'Վրաստան',
        lat: 41.715,
        lng: 44.827,
        organizationId: 'ge-factory',
        kind: 'Արտադրություն',
      },
      {
        city: 'Բագրատաշեն',
        country: 'Հայաստան',
        lat: 41.246,
        lng: 44.817,
        organizationId: 'ge-cargo',
        kind: 'Մաքսային փուլ',
      },
      {
        city: 'Երևան',
        country: 'Հայաստան',
        lat: 40.21,
        lng: 44.52,
        organizationId: 'am-cargo',
        kind: 'Պահեստ',
      },
      {
        city: 'Երևան',
        country: 'Հայաստան',
        lat: 40.179,
        lng: 44.499,
        organizationId: 'am-store',
        kind: 'Խանութ',
      },
    ],
  },
  {
    id: 'it-am',
    name: 'Միլան → Երևան',
    countries: 'Իտալիա → Հայաստան',
    source: 'it-factory',
    stops: [
      {
        city: 'Միլան',
        country: 'Իտալիա',
        lat: 45.464,
        lng: 9.19,
        organizationId: 'it-factory',
        kind: 'Արտադրություն',
      },
      {
        city: 'Միլան',
        country: 'Իտալիա',
        lat: 45.63,
        lng: 8.72,
        organizationId: 'eu-cargo',
        kind: 'Օդային հանգույց',
      },
      {
        city: 'Երևան',
        country: 'Հայաստան',
        lat: 40.147,
        lng: 44.395,
        organizationId: 'am-cargo',
        kind: 'Ներմուծման պահեստ',
      },
      {
        city: 'Երևան',
        country: 'Հայաստան',
        lat: 40.179,
        lng: 44.499,
        organizationId: 'am-store',
        kind: 'Խանութ',
      },
    ],
  },
  {
    id: 'am-de',
    name: 'Գյումրի → Բեռլին',
    countries: 'Հայաստան → Գերմանիա',
    source: 'am-factory',
    stops: [
      {
        city: 'Գյումրի',
        country: 'Հայաստան',
        lat: 40.789,
        lng: 43.847,
        organizationId: 'am-factory',
        kind: 'Արտադրություն',
      },
      {
        city: 'Երևան',
        country: 'Հայաստան',
        lat: 40.147,
        lng: 44.395,
        organizationId: 'am-cargo',
        kind: 'Օդային հանգույց',
      },
      {
        city: 'Ֆրանկֆուրտ',
        country: 'Գերմանիա',
        lat: 50.037,
        lng: 8.562,
        organizationId: 'eu-cargo',
        kind: 'Բաշխման կենտրոն',
      },
      {
        city: 'Բեռլին',
        country: 'Գերմանիա',
        lat: 52.52,
        lng: 13.405,
        organizationId: 'de-store',
        kind: 'Խանութ',
      },
    ],
  },
];
export function routeFor(id: string) {
  const route = routes.find((item) => item.id === id);
  if (!route) throw new Error('Երթուղին չի գտնվել։');
  return route;
}

const organizationIdSchema = z.string().refine((id) => organizations.some((org) => org.id === id));
const fingerprintSchema = z.string().regex(/^[a-f0-9]{64}$/);
const transactionHashSchema = z.string().regex(/^0x[a-f0-9]{64}$/);
const eventSchema = z.object({
  id: z.string(),
  date: z.string().datetime(),
  title: z.string(),
  city: z.string(),
  type: z.enum(['created', 'custody', 'document', 'incident', 'resolution']),
  hash: transactionHashSchema,
});
const documentVersionSchema = z.object({
  name: z.string(),
  hash: fingerprintSchema,
  date: z.string().datetime(),
  matches: z.boolean(),
});
export const batchSchema = z.object({
  id: z.string().regex(/^AT-\d{4}-\d{3,}$/),
  name: z.string(),
  sku: z.string(),
  garment: z.enum(['tshirt', 'jacket', 'jeans', 'hoodie']),
  color: z.string(),
  size: z.string(),
  quantity: z.number().int().positive(),
  composition: z.string(),
  productionDate: z.string().date(),
  routeId: z.string().refine((id) => routes.some((route) => route.id === id)),
  manufacturerId: organizationIdSchema,
  custodianId: organizationIdSchema,
  stage: z.number().int().nonnegative(),
  status: statusSchema,
  note: z.string(),
  transfer: z
    .object({
      from: organizationIdSchema,
      to: organizationIdSchema,
      date: z.string().datetime(),
      hash: transactionHashSchema,
    })
    .nullable(),
  document: z.object({ expectedHash: fingerprintSchema, versions: z.array(documentVersionSchema) }),
  events: z.array(eventSchema).min(1),
});
export type Batch = z.infer<typeof batchSchema>;
export const stateSchema = z.object({
  version: z.literal(1),
  batches: z.array(batchSchema).min(1),
  access: z.record(z.string(), z.boolean()),
  balances: z.record(z.string(), z.number().nonnegative()),
  transactions: z.array(
    z.object({
      id: z.string(),
      batchId: z.string(),
      title: z.string(),
      orgId: organizationIdSchema,
      date: z.string().datetime(),
      hash: transactionHashSchema,
      status: z.enum(['success', 'failed']),
    }),
  ),
});
export type AppState = z.infer<typeof stateSchema>;
export type Actor = { role: Role; orgId: string; connected: boolean };
export type RegisterInput = Pick<
  Batch,
  | 'name'
  | 'sku'
  | 'garment'
  | 'color'
  | 'size'
  | 'quantity'
  | 'composition'
  | 'productionDate'
  | 'routeId'
>;
export type Command =
  | { type: 'register'; input: RegisterInput; expectedHash: string }
  | { type: 'transfer'; batchId: string }
  | { type: 'accept'; batchId: string }
  | { type: 'reject'; batchId: string; note: string }
  | { type: 'upload'; batchId: string; name: string; hash: string }
  | { type: 'resolve'; batchId: string; note: string }
  | { type: 'access'; orgId: string; active: boolean };
export const GAS_FEE = 0.002;
export const STORAGE_KEY = 'armtrace-demo-v1';

export function referenceDocument(batchId: string) {
  return `ArmTrace educational packing list\nBatch: ${batchId}\nDocument: original\n`;
}
export async function sha256(value: string | ArrayBuffer) {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value;
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (n) => n.toString(16).padStart(2, '0')).join('');
}
export function simulationHash() {
  return (
    '0x' +
    Array.from(crypto.getRandomValues(new Uint8Array(32)), (n) =>
      n.toString(16).padStart(2, '0'),
    ).join('')
  );
}
export function documentMatches(batch: Batch) {
  return batch.document.versions.at(-1)?.hash === batch.document.expectedHash;
}
export function nextStop(batch: Batch) {
  return routeFor(batch.routeId).stops[batch.stage + 1];
}
export function canTransfer(batch: Batch) {
  return ['ready', 'in_transit'].includes(batch.status) && !batch.transfer && !!nextStop(batch);
}

function requireCondition(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

/** Public command boundary: validates identities and business rules before returning a new state. */
export function executeCommand(
  state: AppState,
  actor: Actor,
  command: Command,
  receipt: { date: string; hash: string },
): AppState {
  const org = organization(actor.orgId);
  requireCondition(actor.connected, 'Նախ միացրեք դրամապանակը։');
  requireCondition(
    actor.role === org.role && state.access[actor.orgId],
    'Այս կազմակերպության մուտքն անջատված է կամ դերը չի համապատասխանում։',
  );
  requireCondition(
    (state.balances[actor.orgId] ?? 0) >= GAS_FEE,
    'MOCK-ETH-ը բավարար չէ։ Օգտվեք Faucet-ից։',
  );
  const next = structuredClone(state);
  let title = '';
  let batchId = '—';
  if (command.type === 'register') {
    requireCondition(actor.role === 'manufacturer', 'Խմբաքանակ կարող է գրանցել միայն արտադրողը։');
    const input = command.input;
    requireCondition(
      [input.name, input.sku, input.color, input.size, input.composition].every(
        (v) => v.trim().length > 0 && v.length <= 120,
      ),
      'Լրացրեք ապրանքի բոլոր դաշտերը։',
    );
    requireCondition(
      Number.isInteger(input.quantity) && input.quantity > 0 && input.quantity <= 1_000_000,
      'Քանակը պետք է լինի դրական ամբողջ թիվ։',
    );
    requireCondition(
      /^\d{4}-\d{2}-\d{2}$/.test(input.productionDate) &&
        !Number.isNaN(Date.parse(input.productionDate)) &&
        input.productionDate <= receipt.date.slice(0, 10),
      'Ստուգեք արտադրության ամսաթիվը։',
    );
    requireCondition(
      routeFor(input.routeId).source === actor.orgId,
      'Ընտրեք ձեր արտադրամասից մեկնող երթուղի։',
    );
    batchId = `AT-2026-${String(Math.max(0, ...state.batches.map((b) => Number(b.id.split('-').at(-1)) || 0)) + 1).padStart(3, '0')}`;
    title = 'Խմբաքանակի գրանցում';
    next.batches.unshift({
      ...input,
      id: batchId,
      manufacturerId: actor.orgId,
      custodianId: actor.orgId,
      stage: 0,
      status: 'ready',
      note: '',
      transfer: null,
      document: { expectedHash: command.expectedHash, versions: [] },
      events: [
        {
          id: receipt.hash,
          date: receipt.date,
          title: 'Խմբաքանակը գրանցվել է',
          city: org.city,
          type: 'created',
          hash: receipt.hash,
        },
      ],
    });
  } else if (command.type === 'access') {
    requireCondition(
      actor.role === 'admin' && organization(command.orgId).role !== 'admin',
      'Միայն վերահսկողը կարող է փոխել մասնակիցների մուտքը։',
    );
    next.access[command.orgId] = command.active;
    title = command.active ? 'Մասնակցի մուտքը միացված է' : 'Մասնակցի մուտքն անջատված է';
  } else {
    const batch = next.batches.find((item) => item.id === command.batchId);
    requireCondition(batch, 'Խմբաքանակը չի գտնվել։');
    batchId = batch.id;
    const event = (eventTitle: string, type: z.infer<typeof eventSchema>['type']) => {
      batch.events.push({
        id: `${receipt.hash}-${batch.events.length}`,
        date: receipt.date,
        title: eventTitle,
        city: routeFor(batch.routeId).stops[batch.stage].city,
        type,
        hash: receipt.hash,
      });
    };
    if (command.type === 'transfer') {
      requireCondition(
        actor.orgId === batch.custodianId && canTransfer(batch),
        'Փոխանցումը հնարավոր չէ․ ստուգեք պատասխանատուին և կարգավիճակը։',
      );
      const receiver = nextStop(batch)!;
      requireCondition(
        state.access[receiver.organizationId],
        'Ստացող կազմակերպության մուտքն անջատված է։',
      );
      batch.transfer = {
        from: actor.orgId,
        to: receiver.organizationId,
        date: receipt.date,
        hash: receipt.hash,
      };
      title = 'Փոխանցման առաջին ստորագրություն';
      event('Ուղարկողը ստորագրել է փոխանցումը', 'custody');
    } else if (command.type === 'accept') {
      requireCondition(
        batch.transfer?.to === actor.orgId && batch.transfer.from !== actor.orgId,
        'Հաստատել կարող է միայն նշված ստացողը։',
      );
      requireCondition(
        ['ready', 'in_transit'].includes(batch.status),
        'Նախ լուծեք խմբաքանակի բաց խնդիրը։',
      );
      batch.custodianId = actor.orgId;
      batch.stage += 1;
      batch.transfer = null;
      batch.status = nextStop(batch) ? 'in_transit' : 'delivered';
      title = 'Confirm Custody';
      event(
        batch.status === 'delivered'
          ? 'Խմբաքանակը հասել է նշանակման վայր'
          : 'Ընդունումը հաստատվել է · In Transit',
        'custody',
      );
    } else if (command.type === 'reject') {
      requireCondition(batch.transfer?.to === actor.orgId, 'Մերժել կարող է միայն նշված ստացողը։');
      requireCondition(command.note.trim().length >= 4, 'Նշեք մերժման պատճառը։');
      batch.transfer = null;
      batch.status = 'incident';
      batch.note = command.note.trim();
      title = 'Ընդունումը մերժվել է';
      event(title + '․ ' + batch.note, 'incident');
    } else if (command.type === 'upload') {
      requireCondition(
        actor.role === 'admin' ||
          actor.orgId === batch.custodianId ||
          actor.orgId === batch.manufacturerId,
        'Փաստաթուղթ կարող է ավելացնել միայն պատասխանատուն կամ վերահսկողը։',
      );
      requireCondition(
        /^[a-f0-9]{64}$/.test(command.hash) && command.name.length > 0,
        'Ֆայլի հեշը սխալ է։',
      );
      const matches = command.hash === batch.document.expectedHash;
      batch.document.versions.push({
        name: command.name,
        hash: command.hash,
        date: receipt.date,
        matches,
      });
      if (!matches && !['customs', 'incident'].includes(batch.status)) {
        batch.status = 'integrity';
        batch.note = 'Փաստաթղթի հեշը չի համապատասխանում բնօրինակին։';
      }
      title = matches
        ? 'Փաստաթուղթը համապատասխանում է բնօրինակին'
        : 'Հայտնաբերվել է հեշի անհամապատասխանություն';
      event(title, 'document');
    } else if (command.type === 'resolve') {
      requireCondition(actor.role === 'admin', 'Խնդիրը կարող է փակել միայն վերահսկողը։');
      requireCondition(
        ['customs', 'integrity', 'incident'].includes(batch.status),
        'Բաց խնդիր չի գտնվել։',
      );
      requireCondition(command.note.trim().length >= 4, 'Ավելացրեք լուծման նկարագրությունը։');
      if (batch.status !== 'incident' || batch.document.versions.length > 0)
        requireCondition(
          documentMatches(batch),
          'Նախ ավելացրեք բնօրինակին համապատասխան փաստաթուղթ։',
        );
      batch.status = !nextStop(batch) ? 'delivered' : batch.stage === 0 ? 'ready' : 'in_transit';
      batch.note = '';
      title = 'Խնդիրը լուծված է';
      event(title + '․ ' + command.note.trim(), 'resolution');
    }
  }
  next.balances[actor.orgId] =
    Math.round(((next.balances[actor.orgId] ?? 0) - GAS_FEE) * 1000) / 1000;
  next.transactions.unshift({
    id: receipt.hash,
    batchId,
    title,
    orgId: actor.orgId,
    date: receipt.date,
    hash: receipt.hash,
    status: 'success',
  });
  return next;
}

/** Intentionally contains no internal documents, wallet addresses, hashes or signing state. */
export function publicPassport(batch: Batch) {
  const route = routeFor(batch.routeId);
  return {
    id: batch.id,
    name: batch.name,
    sku: batch.sku,
    garment: batch.garment,
    color: batch.color,
    size: batch.size,
    composition: batch.composition,
    productionDate: batch.productionDate,
    manufacturer: organization(batch.manufacturerId).name,
    origin: route.stops[0].country,
    status: batch.status,
    route: route.stops.map((stop, index) => ({
      city: stop.city,
      country: stop.country,
      complete: index <= batch.stage,
    })),
    milestones: batch.events
      .filter(
        (e) => e.type === 'created' || (e.type === 'custody' && !e.title.includes('Ուղարկողը')),
      )
      .map((e) => ({
        title: e.type === 'created' ? 'Արտադրված է' : 'Տեղափոխումը գրանցված է',
        city: e.city,
        date: e.date,
      })),
  };
}

export function restoreState(raw: string | null): AppState | null {
  if (!raw) return null;
  try {
    const result = stateSchema.safeParse(JSON.parse(raw));
    if (!result.success) return null;
    const state = result.data;
    if (new Set(state.batches.map((b) => b.id)).size !== state.batches.length) return null;
    for (const batch of state.batches) {
      const route = routeFor(batch.routeId);
      organization(batch.custodianId);
      organization(batch.manufacturerId);
      if (
        batch.stage >= route.stops.length ||
        batch.manufacturerId !== route.source ||
        batch.custodianId !== route.stops[batch.stage].organizationId
      )
        return null;
      if (
        batch.transfer &&
        (batch.transfer.from !== batch.custodianId ||
          batch.transfer.to !== nextStop(batch)?.organizationId)
      )
        return null;
    }
    return state;
  } catch {
    return null;
  }
}
