import { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  Droplets,
  ExternalLink,
  ShieldCheck,
  Wallet,
  XCircle,
} from 'lucide-react';
import { GAS_FEE, useApp } from '../store';
import { organization, walletAddress } from '../domain/model';
import { shortHash } from '../lib/format';
import { Modal } from './UI';

export function WalletControl({ publicView = false }: { publicView?: boolean }) {
  const { actor, state, connect, disconnect, faucet, notify } = useApp();
  const [open, setOpen] = useState(false);
  const connected = actor.connected && !publicView;
  return (
    <>
      <button
        className={`button wallet-button ${connected ? 'connected' : 'primary'}`}
        onClick={() => setOpen(true)}
      >
        <Wallet size={16} />
        {connected ? (
          <>
            <span className="mono">{shortHash(walletAddress(actor.orgId))}</span>
            <span className="wallet-balance">
              {(state.balances[actor.orgId] ?? 0).toFixed(3)} MOCK-ETH
            </span>
          </>
        ) : (
          'Connect Wallet'
        )}
      </button>
      {open && (
        <Modal
          title={connected ? 'Ձեր դրամապանակը' : 'Միացնել դրամապանակը'}
          onClose={() => setOpen(false)}
        >
          <div className="wallet-brand">
            <Wallet size={30} />
          </div>
          <h3 className="center">ArmTrace Demo Wallet</h3>
          <p className="muted center">Միայն ուսումնական սիմուլյացիայի համար</p>
          {publicView || actor.role === 'consumer' ? (
            <>
              <div className="info-box">Ապրանքի պատմությունը դիտելու համար դրամապանակ պետք չէ։</div>
              <button className="button primary full" onClick={() => setOpen(false)}>
                Շարունակել դիտումը
              </button>
            </>
          ) : (
            <>
              <div className="wallet-account">
                <span className="avatar">{organization(actor.orgId).initials}</span>
                <div>
                  <strong>{organization(actor.orgId).name}</strong>
                  <small className="mono">{shortHash(walletAddress(actor.orgId))}</small>
                </div>
                {actor.connected && <CheckCircle2 size={20} className="text-green" />}
              </div>
              {actor.connected ? (
                <>
                  <div className="balance-card">
                    <span>Փորձնական հաշվեկշիռ</span>
                    <strong>
                      {(state.balances[actor.orgId] ?? 0).toFixed(3)} <small>MOCK-ETH</small>
                    </strong>
                  </div>
                  <button className="button secondary full" onClick={faucet}>
                    <Droplets size={17} />
                    Faucet · ստանալ 1 MOCK-ETH
                  </button>
                  <button
                    className="text-button full"
                    onClick={() => {
                      disconnect();
                      setOpen(false);
                    }}
                  >
                    Անջատել դրամապանակը
                  </button>
                </>
              ) : (
                <button
                  className="button primary full"
                  onClick={() => {
                    connect();
                    setOpen(false);
                  }}
                >
                  Միացնել փորձնական դրամապանակը <ExternalLink size={15} />
                </button>
              )}
              <div className="fine-print">
                <ShieldCheck size={15} />
                Իրական միջոցներ և գաղտնի բանալիներ չեն պահանջվում։
              </div>
              {actor.connected && (
                <button
                  className="text-button full"
                  onClick={() => {
                    void navigator.clipboard
                      ?.writeText(walletAddress(actor.orgId))
                      .then(() => notify('Հասցեն պատճենված է։'))
                      .catch(() => notify('Պատճենումը հասանելի չէ։'));
                  }}
                >
                  <Copy size={14} />
                  Պատճենել հասցեն
                </button>
              )}
            </>
          )}
        </Modal>
      )}
    </>
  );
}

export function TransactionModal() {
  const { tx, confirm, closeTransaction } = useApp();
  const [fail, setFail] = useState(false);
  if (!tx) return null;
  const batchId = 'batchId' in tx.command ? tx.command.batchId : 'Նոր գրառում';
  return (
    <Modal
      title="Գործարքի հաստատում"
      onClose={() => {
        closeTransaction();
        setFail(false);
      }}
      locked={tx.phase === 'pending'}
    >
      {tx.phase === 'review' && (
        <>
          <div className="transaction-icon">
            <ShieldCheck size={30} />
          </div>
          <h3 className="center">{tx.title}</h3>
          <p className="muted center">Ստուգեք տվյալները նախքան ստորագրելը։</p>
          <dl className="transaction-details">
            <div>
              <dt>Կազմակերպություն</dt>
              <dd>{organization(tx.actor.orgId).name}</dd>
            </div>
            <div>
              <dt>Խմբաքանակ</dt>
              <dd className="mono">{batchId}</dd>
            </div>
            <div>
              <dt>Ցանց</dt>
              <dd>
                <span className="network-dot" />
                ArmTrace Demo
              </dd>
            </div>
            <div>
              <dt>Gas fee</dt>
              <dd>{GAS_FEE} MOCK-ETH</dd>
            </div>
          </dl>
          <details className="simulation-options">
            <summary>Ցուցադրության կարգավորում</summary>
            <label>
              <input type="checkbox" checked={fail} onChange={(e) => setFail(e.target.checked)} />
              Սիմուլյացնել Fail / Reverted
            </label>
          </details>
          <div className="button-row">
            <button
              className="button secondary"
              onClick={() => {
                closeTransaction();
                setFail(false);
              }}
            >
              Չեղարկել
            </button>
            <button
              className="button primary"
              onClick={() => {
                confirm(fail);
                setFail(false);
              }}
            >
              Ստորագրել և հաստատել
            </button>
          </div>
        </>
      )}
      {tx.phase === 'pending' && (
        <div className="transaction-result" role="status">
          <div className="mining">
            <span />
            <ShieldCheck size={34} />
          </div>
          <h3>Mining Transaction…</h3>
          <p>Սպասում ենք սիմուլյացված հաստատմանը։</p>
          <span className="badge in_transit">Pending</span>
        </div>
      )}
      {tx.phase === 'success' && (
        <div className="transaction-result">
          <span className="result-icon success">
            <Check size={36} />
          </span>
          <h3>Գործարքը հաստատված է</h3>
          <p>Փոփոխությունը գրանցվել է պատմության մեջ։</p>
          <span className="badge delivered">Success</span>
          <code className="hash-value">{tx.hash}</code>
          <button className="button primary full" onClick={closeTransaction}>
            Պատրաստ է
          </button>
        </div>
      )}
      {tx.phase === 'failed' && (
        <div className="transaction-result">
          <span className="result-icon failed">
            <XCircle size={36} />
          </span>
          <h3>Գործարքը չի կատարվել</h3>
          <p role="alert">{tx.error}</p>
          <span className="badge incident">Fail / Reverted</span>
          <p className="fine-print">Տվյալներն ու հաշվեկշիռը չեն փոխվել։</p>
          <button className="button secondary full" onClick={closeTransaction}>
            Վերադառնալ
          </button>
        </div>
      )}
      <div className="modal-note">Ուսումնական Web3 սիմուլյացիա</div>
    </Modal>
  );
}
