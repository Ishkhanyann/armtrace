import {
  type AppState,
  type Batch,
  organizations,
  referenceDocument,
  routeFor,
  sha256,
} from './model';

export async function createSeed(): Promise<AppState> {
  const items = [
    {
      id: 'AT-2026-001',
      name: 'Բամբակյա շապիկ',
      sku: 'AR-TS-001',
      garment: 'tshirt',
      color: 'Սև',
      size: 'M',
      quantity: 120,
      composition: '100% բամբակ',
      routeId: 'am-ge',
      manufacturerId: 'am-factory',
      custodianId: 'am-factory',
      stage: 0,
      status: 'ready',
      note: '',
    },
    {
      id: 'AT-2026-002',
      name: 'Ձմեռային բաճկոն',
      sku: 'KW-JK-024',
      garment: 'jacket',
      color: 'Մուգ կանաչ',
      size: 'L',
      quantity: 80,
      composition: 'Վերամշակված պոլիեսթեր',
      routeId: 'ge-am',
      manufacturerId: 'ge-factory',
      custodianId: 'ge-cargo',
      stage: 1,
      status: 'customs',
      note: 'Մաքսային փուլում բացակայում է առաքման փաստաթուղթը։',
    },
    {
      id: 'AT-2026-003',
      name: 'Դասական ջինս',
      sku: 'LM-DN-112',
      garment: 'jeans',
      color: 'Կապույտ',
      size: '32',
      quantity: 200,
      composition: '98% բամբակ, 2% էլաստան',
      routeId: 'it-am',
      manufacturerId: 'it-factory',
      custodianId: 'eu-cargo',
      stage: 1,
      status: 'integrity',
      note: 'Ներկայացված փաստաթուղթը չի համապատասխանում գրանցված բնօրինակին։',
    },
    {
      id: 'AT-2026-004',
      name: 'Բամբակյա հուդի',
      sku: 'AR-HD-008',
      garment: 'hoodie',
      color: 'Ավազագույն',
      size: 'XL',
      quantity: 60,
      composition: '80% բամբակ, 20% պոլիեսթեր',
      routeId: 'am-de',
      manufacturerId: 'am-factory',
      custodianId: 'eu-cargo',
      stage: 2,
      status: 'incident',
      note: 'Ստացողը մերժել է ընդունումը․ արտաքին փաթեթավորումը վնասված է։',
    },
  ] as const;
  const batches: Batch[] = await Promise.all(
    items.map(async (item) => {
      const route = routeFor(item.routeId);
      const expectedHash = await sha256(referenceDocument(item.id));
      const events: Batch['events'] = [
        {
          id: item.id + '-origin',
          date: '2026-11-18T08:30:00Z',
          title: 'Խմբաքանակը գրանցվել է',
          city: route.stops[0].city,
          type: 'created',
          hash: '0x' + expectedHash,
        },
      ];
      for (let i = 1; i <= item.stage; i++)
        events.push({
          id: `${item.id}-${i}`,
          date: `2026-11-${18 + i}T10:20:00Z`,
          title: 'Ընդունումը հաստատվել է · In Transit',
          city: route.stops[i].city,
          type: 'custody',
          hash: '0x' + (await sha256(item.id + i)),
        });
      if (item.note)
        events.push({
          id: item.id + '-issue',
          date: '2026-11-21T12:45:00Z',
          title: item.note,
          city: route.stops[item.stage].city,
          type: item.status === 'integrity' ? 'document' : 'incident',
          hash: '0x' + (await sha256(item.note)),
        });
      return {
        ...item,
        productionDate: '2026-11-18',
        transfer: null,
        document: {
          expectedHash,
          versions:
            item.status === 'integrity'
              ? [
                  {
                    name: 'packing-list-edited.txt',
                    hash: await sha256('altered document'),
                    date: '2026-11-21T12:45:00Z',
                    matches: false,
                  },
                ]
              : [],
        },
        events,
      };
    }),
  );
  return {
    version: 1,
    batches,
    access: Object.fromEntries(organizations.map((org) => [org.id, true])),
    balances: Object.fromEntries(organizations.map((org) => [org.id, 1])),
    transactions: [],
  };
}
