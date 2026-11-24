import { useEffect, useState } from 'react';
import {
  Activity as ActivityIcon,
  ArrowRight,
  Bell,
  Box,
  ChevronDown,
  CircleHelp,
  FileCheck2,
  Globe2,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Plus,
  QrCode,
  RotateCcw,
  ScanLine,
  ShieldCheck,
  Truck,
  Users,
  X,
} from 'lucide-react';
import { useApp } from './store';
import { type Role, organization, organizations } from './domain/model';
import { dateTime, roleLabels } from './lib/format';
import { Modal } from './components/UI';
import { QRModal, ScannerModal } from './components/QRTools';
import { TransactionModal, WalletControl } from './components/Wallet';
import { BatchTable } from './components/BatchTable';
import BatchDetails from './components/BatchDetails';
import Overview from './pages/Overview';
import { Documents, Participants, RegisterModal, RoutePage, Transfers } from './pages/Operations';
import Passport from './pages/Passport';
import Activity from './pages/Activity';

const navigation = [
  {
    id: 'overview',
    label: 'Ընդհանուր պատկեր',
    icon: LayoutDashboard,
    description: 'Ձեր մատակարարման շղթան՝ մեկ հայացքով։',
  },
  {
    id: 'batches',
    label: 'Խմբաքանակներ',
    icon: Box,
    description: 'Կառավարեք ապրանքները և հետևեք յուրաքանչյուր խմբաքանակի։',
  },
  {
    id: 'routes',
    label: 'Երթուղիներ',
    icon: Globe2,
    description: 'Միջազգային ճանապարհները և ընթացիկ տեղադրությունները։',
  },
  {
    id: 'transfers',
    label: 'Փոխանցումներ',
    icon: Truck,
    description: 'Ապահով և ստուգելի փոխանցումներ՝ երկու ստորագրությամբ։',
  },
  {
    id: 'documents',
    label: 'Փաստաթղթեր',
    icon: FileCheck2,
    description: 'Ստուգեք փաստաթղթերի ամբողջականությունը և լուծեք խնդիրները։',
  },
  {
    id: 'activity',
    label: 'Իրադարձություններ',
    icon: ActivityIcon,
    description: 'Մատակարարման ամբողջ պատմությունը՝ առանց կորած քայլերի։',
  },
  {
    id: 'participants',
    label: 'Մասնակիցներ',
    icon: Users,
    description: 'Կառավարեք ցանցի մասնակիցների հասանելիությունը։',
  },
];

export default function App() {
  const { state, actor, setIdentity, notice, notify, reset, tx } = useApp();
  const [hash, setHash] = useState(location.hash);
  const [selectedId, setSelectedId] = useState(state.batches[0].id);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [qrId, setQrId] = useState<string | null>(null);
  const [scanner, setScanner] = useState(false);
  const [register, setRegister] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [help, setHelp] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const update = () => {
      setHash(location.hash);
      setMobile(false);
      setDetailsId(null);
    };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  useEffect(() => {
    if (hash.startsWith('#/passport/') && actor.role !== 'consumer') setIdentity('consumer');
    else if (!hash.startsWith('#/passport/') && actor.role === 'consumer')
      setIdentity('manufacturer');
  }, [hash, actor.role, setIdentity]);
  const page = hash.replace('#/', '').split('/')[0] || 'overview';
  const current = navigation.find((item) => item.id === page) ?? navigation[0];
  const batch = state.batches.find((item) => item.id === selectedId) ?? state.batches[0];
  const detailed = state.batches.find((item) => item.id === detailsId);
  const isPublic = actor.role === 'consumer' || page === 'passport';
  let passportId = selectedId;
  try {
    if (page === 'passport') passportId = decodeURIComponent(hash.split('/')[2] ?? '');
  } catch {
    passportId = '';
  }
  const roleChange = (role: Role) => {
    const target = role === 'consumer' ? `/passport/${batch.id}` : '/overview';
    setHash(`#${target}`);
    setIdentity(role);
    location.hash = target;
  };
  const openDetails = (id: string) => {
    setSelectedId(id);
    setDetailsId(id);
  };
  const onFound = (id: string) => {
    if (!state.batches.some((b) => b.id === id)) {
      notify('Այս համարով խմբաքանակ չի գտնվել։');
      return;
    }
    setScanner(false);
    setSelectedId(id);
    if (isPublic) location.hash = `/passport/${id}`;
    else {
      location.hash = '/transfers';
      setDetailsId(null);
    }
  };
  const latest = state.batches
    .flatMap((b) => b.events.map((e) => ({ ...e, batchId: b.id })))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);
  return (
    <div className={isPublic ? 'app consumer-app' : 'app'}>
      {!isPublic && (
        <>
          <div
            className={`sidebar-shade ${mobile ? 'visible' : ''}`}
            onClick={() => setMobile(false)}
          />
          <aside className={`sidebar ${mobile ? 'open' : ''}`}>
            <a href="#/overview" className="brand">
              <span>
                <Package size={26} strokeWidth={1.8} />
              </span>
              <div>
                arm<span>trace</span>
                <small>ՀԱԳՈՒՍՏԻ ՃԱՆԱՊԱՐՀԸ</small>
              </div>
            </a>
            <button
              className="mobile-close icon-button"
              aria-label="Փակել ընտրացանկը"
              onClick={() => setMobile(false)}
            >
              <X size={20} />
            </button>
            <div className="workspace-picker">
              <span className="workspace-icon">
                <Box size={19} />
              </span>
              <div>
                <strong>Աշխատանքային միջավայր</strong>
                <small>Մատակարարման կառավարում</small>
              </div>
              <ChevronDown size={15} />
            </div>
            <span className="nav-section-label">ԳԼԽԱՎՈՐ ՄԵՆՅՈՒ</span>
            <nav aria-label="Գլխավոր ընտրացանկ">
              {navigation
                .filter((item) => item.id !== 'participants' || actor.role === 'admin')
                .map(({ id, label, icon: Icon }) => (
                  <a
                    key={id}
                    href={`#/${id}`}
                    aria-current={current.id === id ? 'page' : undefined}
                    className={current.id === id ? 'active' : ''}
                  >
                    <Icon size={19} strokeWidth={1.7} />
                    <span>{label}</span>
                    {id === 'batches' && <small>{state.batches.length}</small>}
                  </a>
                ))}
            </nav>
            <div className="sidebar-bottom">
              <div className="demo-panel">
                <span className="eyebrow">
                  <span className="network-dot" />
                  DEMO ՄԻՋԱՎԱՅՐ
                </span>
                <p>Չորս երթուղի։ Տարբեր իրավիճակներ։ Մեկ համակարգ։</p>
                <button onClick={() => setResetting(true)}>
                  <RotateCcw size={14} />
                  Վերականգնել սցենարները
                </button>
              </div>
              <button className="help-button" onClick={() => setHelp(true)}>
                <CircleHelp size={18} />
                Ցուցադրության ուղեցույց <ArrowRight size={15} />
              </button>
              <div className="sidebar-profile">
                <span className="avatar">{organization(actor.orgId).initials}</span>
                <div>
                  <strong>{organization(actor.orgId).name}</strong>
                  <small>{roleLabels[actor.role]}</small>
                </div>
                <button
                  className="icon-button"
                  title="Դիտել որպես սպառող"
                  aria-label="Դիտել որպես սպառող"
                  onClick={() => roleChange('consumer')}
                >
                  <LogOut size={17} />
                </button>
              </div>
            </div>
          </aside>
        </>
      )}
      <div className="main-shell">
        <header className="topbar">
          {isPublic ? (
            <a href="#/passport/AT-2026-001" className="brand consumer-logo">
              <span>
                <Package size={24} />
              </span>
              <div>
                arm<span>trace</span>
              </div>
            </a>
          ) : (
            <>
              <button
                className="icon-button mobile-menu"
                aria-label="Բացել ընտրացանկը"
                onClick={() => setMobile(true)}
              >
                <Menu size={22} />
              </button>
              <div className="breadcrumb">
                <span>Աշխատանքային վահանակ</span>
                <ChevronDown size={12} />
                <strong>{current.label}</strong>
              </div>
            </>
          )}
          <div className="topbar-actions">
            {isPublic ? (
              <button
                className="text-button staff-entry"
                onClick={() => roleChange('manufacturer')}
              >
                Աշխատանքային միջավայր
              </button>
            ) : (
              <>
                <span className="network-label">
                  <span className="network-dot" />
                  Demo Network
                </span>
                <div className="notification-wrap">
                  <button
                    className="icon-button notification-button"
                    aria-label="Ծանուցումներ"
                    onClick={() => setNotifications(!notifications)}
                  >
                    <Bell size={19} />
                    <i />
                  </button>
                  {notifications && (
                    <div className="notification-panel">
                      <strong>Վերջին իրադարձությունները</strong>
                      {latest.map((e) => (
                        <button
                          key={e.id}
                          onClick={() => {
                            openDetails(e.batchId);
                            setNotifications(false);
                          }}
                        >
                          <span>{e.title}</span>
                          <small>
                            {e.batchId} · {dateTime(e.date)}
                          </small>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
            <WalletControl />
          </div>
        </header>
        {isPublic ? (
          <>
            <div className="consumer-tools">
              <span>Ապրանքի պատմություն</span>
              <button className="text-button" onClick={() => setScanner(true)}>
                <ScanLine size={16} />
                Սկանավորել այլ QR
              </button>
            </div>
            <Passport
              batch={state.batches.find((b) => b.id === passportId)}
              missingId={passportId}
              onLookup={(id) => {
                location.hash = `/passport/${id}`;
              }}
            />
          </>
        ) : (
          <>
            <div className="identity-bar">
              <div className="identity-label">
                <ShieldCheck size={15} />
                <span>Ցուցադրական դեր</span>
              </div>
              <select
                aria-label="Ցուցադրական դեր"
                value={actor.role}
                onChange={(e) => roleChange(e.target.value as Role)}
                disabled={tx?.phase === 'pending'}
              >
                {Object.entries(roleLabels).map(([role, label]) => (
                  <option key={role} value={role}>
                    {label}
                  </option>
                ))}
              </select>
              <span className="identity-divider" />
              <select
                aria-label="Կազմակերպություն"
                value={actor.orgId}
                onChange={(e) => setIdentity(actor.role, e.target.value)}
              >
                {organizations
                  .filter((org) => org.role === actor.role)
                  .map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
              </select>
              <span className="identity-note">
                {state.access[actor.orgId]
                  ? 'Փորձարկեք տարբեր մասնակիցների գործողությունները'
                  : 'Այս կազմակերպության մուտքն անջատված է'}
              </span>
            </div>
            <main className="dashboard-main">
              <div className="page-title">
                <div>
                  <div className="page-overline">ARMTRACE / {new Date().getFullYear()}</div>
                  <h1>{current.label}</h1>
                  <p>{current.description}</p>
                </div>
                <div className="page-actions">
                  <button className="button secondary" onClick={() => setScanner(true)}>
                    <ScanLine size={17} />
                    Սկանավորել QR
                  </button>
                  {actor.role === 'manufacturer' && (
                    <button className="button primary" onClick={() => setRegister(true)}>
                      <Plus size={18} />
                      Նոր խմբաքանակ
                    </button>
                  )}
                </div>
              </div>
              {current.id === 'overview' && (
                <Overview
                  batch={batch}
                  onSelect={setSelectedId}
                  onDetails={openDetails}
                  onQR={setQrId}
                />
              )}
              {current.id === 'batches' && (
                <BatchTable batches={state.batches} onDetails={openDetails} onQR={setQrId} />
              )}
              {current.id === 'routes' && <RoutePage batch={batch} onSelect={setSelectedId} />}
              {current.id === 'transfers' && <Transfers batch={batch} onSelect={setSelectedId} />}
              {current.id === 'documents' && (
                <Documents key={batch.id} batch={batch} onSelect={setSelectedId} />
              )}
              {current.id === 'activity' && <Activity />}
              {current.id === 'participants' &&
                (actor.role === 'admin' ? (
                  <Participants />
                ) : (
                  <div className="card padded">
                    <LockNotice />
                  </div>
                ))}
              <footer className="dashboard-footer">
                <span>© {new Date().getFullYear()} ArmTrace</span>
                <span>
                  <span className="network-dot" />
                  Ուսումնական սիմուլյացիա · Տվյալները պահվում են այս դիտարկիչում
                </span>
              </footer>
            </main>
          </>
        )}
      </div>
      {detailed && !isPublic && !tx && (
        <BatchDetails
          batch={detailed}
          onClose={() => setDetailsId(null)}
          onQR={() => {
            setDetailsId(null);
            setQrId(detailed.id);
          }}
        />
      )}
      {qrId && <QRModal batchId={qrId} onClose={() => setQrId(null)} />}
      {scanner && <ScannerModal onClose={() => setScanner(false)} onFound={onFound} />}
      {register && !tx && (
        <RegisterModal
          onClose={() => setRegister(false)}
          onCreated={() => {
            location.hash = '/batches';
            setQrId(null);
          }}
        />
      )}
      {resetting && (
        <Modal title="Վերականգնել ցուցադրությունը" onClose={() => setResetting(false)}>
          <p className="muted">
            Ձեր ավելացրած խմբաքանակներն ու փոփոխությունները կջնջվեն այս դիտարկիչից։ Կվերականգնվեն
            չորս սկզբնական սցենարները։
          </p>
          <div className="button-row">
            <button className="button secondary" onClick={() => setResetting(false)}>
              Չեղարկել
            </button>
            <button
              className="button danger"
              onClick={() => {
                void reset().then(() => {
                  setSelectedId('AT-2026-001');
                  location.hash = '/overview';
                });
                setResetting(false);
              }}
            >
              Վերականգնել
            </button>
          </div>
        </Modal>
      )}
      {help && (
        <Modal title="Ցուցադրության ուղեցույց" onClose={() => setHelp(false)}>
          <div className="help-list">
            <p>
              <strong>1. Միացրեք դրամապանակը</strong>Ընտրեք դեր և կազմակերպություն, ապա սեղմեք
              Connect Wallet։
            </p>
            <p>
              <strong>2. Փորձեք առաջին փոխանցումը</strong>Բացեք «Փոխանցումներ», ստորագրեք որպես
              արտադրող, անցեք ստացողին և հաստատեք ընդունումը։
            </p>
            <p>
              <strong>3. Լուծեք երեք խնդիրները</strong>Ընտրեք վերահսկողի դերը։ Փաստաթղթերի էջում
              ստուգեք բնօրինակները և փակեք խնդիրները։
            </p>
            <p>
              <strong>4. Դիտեք գնորդի աչքերով</strong>Բացեք QR կոդը կամ ապրանքի անձնագիրը։ Սպառողը
              տեսնում է միայն ամենակարևորը։
            </p>
          </div>
          <div className="info-box">
            Բոլոր կազմակերպությունները, գործարքներն ու միջադեպերը ցուցադրական են։
          </div>
          <button className="button primary full" onClick={() => setHelp(false)}>
            Սկսել ցուցադրությունը
          </button>
        </Modal>
      )}
      <TransactionModal />
      {notice && (
        <div className="toast" role="status">
          <CheckCircleIcon />
          <span>{notice}</span>
          <button className="icon-button" aria-label="Փակել ծանուցումը" onClick={() => notify('')}>
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
function LockNotice() {
  return (
    <>
      <ShieldCheck size={28} />
      <h2>Այս բաժինը հասանելի է վերահսկողին։</h2>
      <p>Փոխեք ցուցադրական դերը՝ մասնակիցներին կառավարելու համար։</p>
    </>
  );
}
function CheckCircleIcon() {
  return (
    <span className="toast-icon">
      <QrCode size={17} />
    </span>
  );
}
