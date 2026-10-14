import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  defaultClients, defaultDocuments, defaultEgovInbox, defaultTasks, defaultMails, defaultPayroll
} from './data';
import Dashboard from './views/Dashboard';
import PortalAdmin from './views/PortalAdmin';
import ClientPortal from './views/ClientPortal';
import Automation from './views/Automation';
import Progress from './views/Progress';
import MailView from './views/MailView';
import PayrollView from './views/PayrollView';
import PlanView from './views/PlanView';

const STORAGE_KEY = 'sr-office-demo-v2';

const NAV = [
  { key: 'dashboard', label: 'ダッシュボード', icon: '◧' },
  { key: 'portal', label: '顧問先共有サイト', icon: '⛁', badge: '優先①' },
  { key: 'automation', label: '公文書 自動取込', icon: '⟳', badge: '優先②' },
  { key: 'mail', label: 'メール整理', icon: '✉' },
  { key: 'payroll', label: '給与計算 前後作業', icon: '¥' },
  { key: 'progress', label: '進捗管理', icon: '▤' },
  { key: 'plan', label: '導入構成・計画', icon: '◎' }
];

const initialState = () => ({
  clients: defaultClients,
  documents: defaultDocuments,
  egovInbox: defaultEgovInbox,
  reviewQueue: [],
  runLog: [],
  tasks: defaultTasks,
  mails: defaultMails.map((m) => ({ ...m, sorted: null })),
  payroll: defaultPayroll,
  settings: { threshold: 90, autoPublish: true, notifyClient: true }
});

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...initialState(), ...JSON.parse(raw) } : initialState();
  } catch {
    return initialState();
  }
}

export default function App() {
  const [state, setState] = useState(loadState);
  const [page, setPage] = useState('dashboard');
  const [mode, setMode] = useState({ role: 'staff', clientId: 'C001' });
  const [portalClientId, setPortalClientId] = useState('C001');
  const [toasts, setToasts] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* プライベートモード等では保存しない */
    }
  }, [state]);

  const toast = useCallback((message, tone = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3600);
  }, []);

  const update = useCallback((key, fn) => {
    setState((prev) => ({ ...prev, [key]: typeof fn === 'function' ? fn(prev[key]) : fn }));
  }, []);

  const store = useMemo(() => ({ ...state, update, setState }), [state, update]);

  const resetDemo = () => {
    setState(initialState());
    toast('デモデータを初期状態に戻しました');
  };

  const openPortalFor = (clientId) => {
    setPortalClientId(clientId);
    setPage('portal');
    setQuery('');
  };

  const clientById = (id) => state.clients.find((c) => c.id === id);

  const searchResults = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    const clients = state.clients
      .filter((c) => c.name.includes(q) || c.id.includes(q.toUpperCase()) || c.owner.includes(q))
      .map((c) => ({ key: c.id, label: c.name, meta: `顧問先 ・ 担当 ${c.owner}`, clientId: c.id }));
    const docs = state.documents
      .filter((d) => d.name.includes(q))
      .map((d) => ({ key: d.id, label: d.name, meta: `書類 ・ ${clientById(d.clientId)?.name ?? ''}`, clientId: d.clientId }));
    return [...clients, ...docs].slice(0, 8);
  }, [query, state.clients, state.documents]);

  const alerts = state.reviewQueue.length + state.tasks.filter((t) => t.status !== 'done' && t.due <= '2026-10-15').length;

  if (mode.role === 'client') {
    return (
      <>
        <ClientPortal
          store={store}
          clientId={mode.clientId}
          toast={toast}
          onExit={() => setMode({ role: 'staff', clientId: mode.clientId })}
        />
        <Toasts toasts={toasts} />
      </>
    );
  }

  const views = {
    dashboard: <Dashboard store={store} go={setPage} openPortalFor={openPortalFor} />,
    portal: (
      <PortalAdmin
        store={store}
        toast={toast}
        clientId={portalClientId}
        setClientId={setPortalClientId}
        viewAsClient={(id) => setMode({ role: 'client', clientId: id })}
      />
    ),
    automation: <Automation store={store} toast={toast} />,
    mail: <MailView store={store} toast={toast} />,
    payroll: <PayrollView store={store} toast={toast} />,
    progress: <Progress store={store} toast={toast} />,
    plan: <PlanView />
  };

  return (
    <>
      <div className="app-shell">
        <aside className="sidebar">
          <div className="brand-block">
            <div className="brand-mark">SR</div>
            <div>
              <div className="brand-name">SR Office Hub</div>
              <div className="brand-sub">社労士事務所 業務効率化 MVP</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            {NAV.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`nav-item ${page === item.key ? 'active' : ''}`}
                onClick={() => setPage(item.key)}
              >
                <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
                {item.key === 'automation' && state.reviewQueue.length > 0 && (
                  <span className="nav-count">{state.reviewQueue.length}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="sidebar-card">
            <p className="small-label">表示切替（デモ）</p>
            <p className="sidebar-note">顧問先担当者としてログインした場合の画面を確認できます。</p>
            <select
              className="field"
              value={mode.clientId}
              onChange={(e) => setMode({ ...mode, clientId: e.target.value })}
              aria-label="顧問先を選択"
            >
              {state.clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button className="primary-btn full" type="button" onClick={() => setMode({ ...mode, role: 'client' })}>
              顧問先として表示
            </button>
            <button className="link-btn" type="button" onClick={resetDemo}>デモデータをリセット</button>
          </div>
        </aside>

        <div className="main-panel">
          <header className="topbar">
            <div className="search-wrap">
              <div className="search-box">
                <span aria-hidden="true">⌕</span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="顧問先・書類・担当者を検索"
                  aria-label="検索"
                />
              </div>
              {query && (
                <div className="search-results">
                  {searchResults.length === 0 && <div className="search-empty">該当なし</div>}
                  {searchResults.map((r) => (
                    <button key={r.key} type="button" onClick={() => openPortalFor(r.clientId)}>
                      <strong>{r.label}</strong>
                      <small>{r.meta}</small>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="topbar-actions">
              <button className="ghost-btn" type="button" onClick={() => setPage(state.reviewQueue.length ? 'automation' : 'progress')}>
                要対応 <span className="pill danger">{alerts}</span>
              </button>
              <div className="user-chip">
                <span className="avatar">田</span>
                <div>
                  <strong>田中 所長</strong>
                  <small>事務所職員（管理者）</small>
                </div>
              </div>
            </div>
          </header>

          <main className="content">{views[page]}</main>
        </div>
      </div>
      <Toasts toasts={toasts} />
    </>
  );
}

function Toasts({ toasts }) {
  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.tone}`}>{t.message}</div>
      ))}
    </div>
  );
}
