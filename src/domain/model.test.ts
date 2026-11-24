import { describe, expect, it } from 'vitest';
import {
  type Actor,
  type AppState,
  executeCommand,
  publicPassport,
  referenceDocument,
  restoreState,
  sha256,
} from './model';
import { createSeed } from './seed';

const receipt = { date: '2026-11-24T10:00:00Z', hash: '0x' + 'a'.repeat(64) };
const sender: Actor = { role: 'manufacturer', orgId: 'am-factory', connected: true };
const receiver: Actor = { role: 'logistics', orgId: 'am-cargo', connected: true };
const admin: Actor = { role: 'admin', orgId: 'controller', connected: true };
function first(state: AppState) {
  return state.batches.find((b) => b.id === 'AT-2026-001')!;
}

describe('custody commands', () => {
  it('requires two distinct parties before custody and the public route advance', async () => {
    const initial = await createSeed();
    const awaiting = executeCommand(
      initial,
      sender,
      { type: 'transfer', batchId: first(initial).id },
      receipt,
    );
    expect(first(awaiting).custodianId).toBe('am-factory');
    expect(first(awaiting).stage).toBe(0);
    expect(() =>
      executeCommand(awaiting, sender, { type: 'accept', batchId: first(initial).id }, receipt),
    ).toThrow('ստացողը');
    const accepted = executeCommand(
      awaiting,
      receiver,
      { type: 'accept', batchId: first(initial).id },
      receipt,
    );
    expect(first(accepted).custodianId).toBe('am-cargo');
    expect(first(accepted).status).toBe('in_transit');
    expect(publicPassport(first(accepted)).route[1].complete).toBe(true);
    expect(first(initial).transfer).toBeNull();
  });
  it('preserves sender custody after rejection and blocks another handover', async () => {
    const initial = await createSeed();
    const pending = executeCommand(
      initial,
      sender,
      { type: 'transfer', batchId: first(initial).id },
      receipt,
    );
    const rejected = executeCommand(
      pending,
      receiver,
      { type: 'reject', batchId: first(initial).id, note: 'Վնասված փաթեթավորում' },
      receipt,
    );
    expect(first(rejected).custodianId).toBe('am-factory');
    expect(first(rejected).stage).toBe(0);
    expect(first(rejected).status).toBe('incident');
    expect(() =>
      executeCommand(rejected, sender, { type: 'transfer', batchId: first(initial).id }, receipt),
    ).toThrow();
  });
  it('rejects disconnected, incorrect-role, inactive and unfunded actors without changing data', async () => {
    const state = await createSeed();
    for (const actor of [
      { ...sender, connected: false },
      { ...sender, role: 'admin' as const },
      receiver,
    ]) {
      expect(() =>
        executeCommand(state, actor, { type: 'transfer', batchId: first(state).id }, receipt),
      ).toThrow();
    }
    const inactive = { ...state, access: { ...state.access, 'am-factory': false } };
    expect(() =>
      executeCommand(inactive, sender, { type: 'transfer', batchId: first(state).id }, receipt),
    ).toThrow();
    const unfunded = { ...state, balances: { ...state.balances, 'am-factory': 0 } };
    expect(() =>
      executeCommand(unfunded, sender, { type: 'transfer', batchId: first(state).id }, receipt),
    ).toThrow('Faucet');
    expect(state.transactions).toHaveLength(0);
  });
  it('finishes a route only when the final receiver signs', async () => {
    let state = await createSeed();
    for (const [from, to, role] of [
      ['am-factory', 'am-cargo', 'manufacturer'],
      ['am-cargo', 'ge-cargo', 'logistics'],
      ['ge-cargo', 'ge-store', 'logistics'],
    ] as const) {
      state = executeCommand(
        state,
        { role, orgId: from, connected: true },
        { type: 'transfer', batchId: 'AT-2026-001' },
        receipt,
      );
      state = executeCommand(
        state,
        { role: 'logistics', orgId: to, connected: true },
        { type: 'accept', batchId: 'AT-2026-001' },
        receipt,
      );
    }
    expect(first(state).status).toBe('delivered');
    expect(first(state).custodianId).toBe('ge-store');
    expect(() =>
      executeCommand(
        state,
        { role: 'logistics', orgId: 'ge-store', connected: true },
        { type: 'transfer', batchId: 'AT-2026-001' },
        receipt,
      ),
    ).toThrow();
  });
});

describe('document and consumer boundaries', () => {
  it('checks real file hashes and appends corrections without erasing previous versions', async () => {
    let state = await createSeed();
    const id = 'AT-2026-003';
    expect(() =>
      executeCommand(state, admin, { type: 'resolve', batchId: id, note: 'Ստուգված է' }, receipt),
    ).toThrow('փաստաթուղթ');
    state = executeCommand(
      state,
      admin,
      {
        type: 'upload',
        batchId: id,
        name: 'original.txt',
        hash: await sha256(referenceDocument(id)),
      },
      receipt,
    );
    const batch = state.batches.find((b) => b.id === id)!;
    expect(batch.document.versions).toHaveLength(2);
    expect(batch.document.versions[0].matches).toBe(false);
    expect(batch.document.versions[1].matches).toBe(true);
    state = executeCommand(
      state,
      admin,
      { type: 'resolve', batchId: id, note: 'Բնօրինակը ստուգված է' },
      receipt,
    );
    expect(state.batches.find((b) => b.id === id)!.status).toBe('in_transit');
  });
  it('blocks customs release until its original document is supplied', async () => {
    let state = await createSeed();
    const id = 'AT-2026-002';
    expect(() =>
      executeCommand(
        state,
        admin,
        { type: 'resolve', batchId: id, note: 'Մաքսազերծված է' },
        receipt,
      ),
    ).toThrow();
    state = executeCommand(
      state,
      admin,
      {
        type: 'upload',
        batchId: id,
        name: 'customs.txt',
        hash: await sha256(referenceDocument(id)),
      },
      receipt,
    );
    state = executeCommand(
      state,
      admin,
      { type: 'resolve', batchId: id, note: 'Փաստաթուղթը ստուգված է' },
      receipt,
    );
    expect(state.batches.find((b) => b.id === id)!.custodianId).toBe('ge-cargo');
    expect(state.batches.find((b) => b.id === id)!.status).toBe('in_transit');
  });
  it('exposes only essential consumer information', async () => {
    const state = await createSeed();
    const serialized = JSON.stringify(publicPassport(state.batches[2]));
    for (const field of [
      'expectedHash',
      'versions',
      'custodianId',
      'transfer',
      'wallet',
      'note',
      'hash',
    ])
      expect(serialized).not.toContain(field);
    expect(serialized).toContain('Դասական ջինս');
  });
  it('validates saved data and rejects corrupt routes or malformed JSON', async () => {
    const state = await createSeed();
    expect(restoreState(JSON.stringify(state))?.batches).toHaveLength(4);
    expect(restoreState('{bad')).toBeNull();
    state.batches[0].stage = 100;
    expect(restoreState(JSON.stringify(state))).toBeNull();
  });
  it('SHA-256 matches a published known-answer test vector', async () => {
    expect(await sha256('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });
});
