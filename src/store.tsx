import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  type Actor,
  type AppState,
  type Command,
  type Role,
  GAS_FEE,
  STORAGE_KEY,
  executeCommand,
  organizations,
  restoreState,
  simulationHash,
} from './domain/model';
import { createSeed } from './domain/seed';

export type TransactionIntent = { title: string; command: Command; onSuccess?: () => void };
export type TransactionView = TransactionIntent & {
  actor: Actor;
  phase: 'review' | 'pending' | 'success' | 'failed';
  error: string;
  hash: string;
};
type ContextValue = {
  state: AppState;
  actor: Actor;
  setIdentity: (role: Role, orgId?: string) => void;
  connect: () => void;
  disconnect: () => void;
  faucet: () => void;
  tx: TransactionView | null;
  request: (intent: TransactionIntent) => void;
  confirm: (fail: boolean) => void;
  closeTransaction: () => void;
  notice: string;
  notify: (message: string) => void;
  reset: () => Promise<void>;
};
const Context = createContext<ContextValue | null>(null);
export function useApp() {
  const value = useContext(Context);
  if (!value) throw new Error('Missing app provider');
  return value;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);
  const [actor, setActor] = useState<Actor>({
    role: location.hash.startsWith('#/passport/') ? 'consumer' : 'manufacturer',
    orgId: 'am-factory',
    connected: false,
  });
  const [tx, setTx] = useState<TransactionView | null>(null);
  const [notice, setNotice] = useState('');
  const actorRef = useRef(actor);
  actorRef.current = actor;
  const stateRef = useRef(state);
  stateRef.current = state;
  const busy = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    void createSeed().then((seed) => {
      if (!alive) return;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const restored = restoreState(raw);
        if (raw && !restored)
          setNotice('Պահպանված տվյալները վերականգնվել են սկզբնական օրինակներով։');
        setState(restored ?? seed);
      } catch {
        setState(seed);
        setNotice('Տվյալների պահպանումը հասանելի չէ այս դիտարկիչում։');
      }
    });
    return () => {
      alive = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  useEffect(() => {
    if (!state) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      setNotice('Փոփոխությունները պահպանված են միայն այս բացված պատուհանում։');
    }
  }, [state]);
  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(''), 5500);
    return () => clearTimeout(timeout);
  }, [notice]);

  const setIdentity = useCallback((role: Role, orgId?: string) => {
    if (busy.current) return;
    setActor({
      role,
      orgId: orgId ?? organizations.find((org) => org.role === role)?.id ?? 'am-factory',
      connected: false,
    });
    setTx(null);
  }, []);
  const request = (intent: TransactionIntent) => {
    if (busy.current) {
      setNotice('Սպասեք ընթացիկ գործարքի ավարտին, ապա կրկին փորձեք։');
      return;
    }
    if (
      actorRef.current.orgId !== actor.orgId ||
      actorRef.current.role !== actor.role ||
      actorRef.current.connected !== actor.connected
    ) {
      setNotice('Դերը կամ դրամապանակը փոխվել է։ Կրկին կատարեք գործողությունը։');
      return;
    }
    if (!actor.connected) {
      setNotice('Գործողությունը կատարելու համար միացրեք դրամապանակը։');
      return;
    }
    if (!state?.access[actor.orgId]) {
      setNotice('Այս կազմակերպության մուտքն անջատված է։');
      return;
    }
    setTx({ ...intent, actor: { ...actor }, phase: 'review', error: '', hash: '' });
  };
  const confirm = (fail: boolean) => {
    if (!tx || tx.phase !== 'review' || busy.current) return;
    busy.current = true;
    const snapshot = tx;
    setTx({ ...snapshot, phase: 'pending' });
    timer.current = setTimeout(() => {
      const hash = simulationHash();
      try {
        if (fail) throw new Error('Սիմուլյացված ցանցային սխալ · Reverted։ Տվյալները չեն փոխվել։');
        const current = stateRef.current;
        if (!current) throw new Error('Տվյալները հասանելի չեն։');
        const updated = executeCommand(current, snapshot.actor, snapshot.command, {
          date: new Date().toISOString(),
          hash,
        });
        stateRef.current = updated;
        setState(updated);
        setTx({ ...snapshot, phase: 'success', hash });
        snapshot.onSuccess?.();
      } catch (error) {
        const current = stateRef.current;
        if (current) {
          const updated: AppState = {
            ...current,
            transactions: [
              {
                id: hash,
                batchId: 'batchId' in snapshot.command ? snapshot.command.batchId : '—',
                title: snapshot.title,
                orgId: snapshot.actor.orgId,
                date: new Date().toISOString(),
                hash,
                status: 'failed',
              },
              ...current.transactions,
            ],
          };
          stateRef.current = updated;
          setState(updated);
        }
        setTx({
          ...snapshot,
          phase: 'failed',
          error: error instanceof Error ? error.message : 'Գործարքը չի կատարվել։',
          hash,
        });
      } finally {
        busy.current = false;
      }
    }, 1100);
  };
  const reset = async () => {
    if (busy.current) return;
    const seed = await createSeed();
    stateRef.current = seed;
    setState(seed);
    setActor({ role: 'manufacturer', orgId: 'am-factory', connected: false });
    setTx(null);
    setNotice('Չորս սցենարները վերականգնված են։');
  };
  if (!state)
    return (
      <div className="boot">
        <span className="spinner" />
        <strong>ArmTrace</strong>
        <p>Պատրաստում ենք աշխատանքային միջավայրը…</p>
      </div>
    );
  return (
    <Context.Provider
      value={{
        state,
        actor,
        setIdentity,
        connect: () => {
          if (actor.role === 'consumer') {
            setNotice('Ապրանքի պատմությունը հասանելի է առանց դրամապանակի։');
            return;
          }
          if (!state.access[actor.orgId]) {
            setNotice('Այս կազմակերպության մուտքն անջատված է։');
            return;
          }
          setActor({ ...actor, connected: true });
        },
        disconnect: () => {
          if (!busy.current) setActor({ ...actor, connected: false });
        },
        faucet: () => {
          if (!actor.connected || busy.current) return;
          setState((current) =>
            current
              ? {
                  ...current,
                  balances: {
                    ...current.balances,
                    [actor.orgId]:
                      Math.round(((current.balances[actor.orgId] ?? 0) + 1) * 1000) / 1000,
                  },
                }
              : current,
          );
          setNotice('+1 MOCK-ETH ավելացվել է ձեր փորձնական հաշվին։');
        },
        tx,
        request,
        confirm,
        closeTransaction: () => {
          if (!busy.current) setTx(null);
        },
        notice,
        notify: setNotice,
        reset,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export { GAS_FEE };
