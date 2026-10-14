import { useRef, useState } from 'react';
import { CATEGORIES, DEMO_TODAY } from '../data';
import { downloadDummy } from '../logic';

export default function ClientPortal({ store, clientId, toast, onExit }) {
  const { clients, documents, update } = store;
  const client = clients.find((c) => c.id === clientId);
  const user = client.users[0];
  const [category, setCategory] = useState('すべて');
  const [denied, setDenied] = useState(null);
  const fileInput = useRef(null);

  // 顧問先ユーザーが参照できるのは「自社」かつ「公開済」または「自社が提出した」書類のみ
  const visible = documents.filter(
    (d) => d.clientId === client.id && (d.status === '公開' || d.source === '顧問先')
  );
  const shown = visible
    .filter((d) => category === 'すべて' || d.category === category)
    .sort((a, b) => b.date.localeCompare(a.date));
  const newCount = visible.filter((d) => d.isNew).length;

  const otherDocs = documents.filter((d) => d.clientId !== client.id && d.status === '公開').slice(0, 5);

  const download = (doc) => {
    downloadDummy(doc.name);
    if (doc.isNew) update('documents', (prev) => prev.map((d) => (d.id === doc.id ? { ...d, isNew: false } : d)));
  };

  const submit = (files) => {
    if (!files.length) return;
    const added = files.map((f, i) => ({
      id: `D${Date.now()}${i}`, clientId: client.id, category: '提出書類', name: f.name,
      date: DEMO_TODAY, source: '顧問先', status: '受領', isNew: false
    }));
    update('documents', (prev) => [...added, ...prev]);
    update('tasks', (prev) => [
      { id: `T${Date.now()}`, clientId: client.id, title: `提出書類の確認（${files[0].name}${files.length > 1 ? ` ほか${files.length - 1}件` : ''}）`, type: '手続', status: 'todo', due: DEMO_TODAY, assignee: client.owner },
      ...prev
    ]);
    toast(`${files.length}件を提出しました。担当の${client.owner}さんに通知されます`, 'success');
  };

  const tryOpen = (doc) => {
    const owner = clients.find((c) => c.id === doc.clientId);
    setDenied({ doc, owner });
  };

  return (
    <div className="client-shell">
      <header className="client-header">
        <div className="brand-block bare">
          <div className="brand-mark small">SR</div>
          <div>
            <div className="brand-name">お客様専用ページ</div>
            <div className="brand-sub">〇〇社会保険労務士事務所</div>
          </div>
        </div>
        <div className="client-header-right">
          <div className="user-chip">
            <span className="avatar">{user.name[0]}</span>
            <div>
              <strong>{user.name}</strong>
              <small>{client.name} ・ {user.role}</small>
            </div>
          </div>
          <button type="button" className="ghost-btn" onClick={onExit}>← 事務所画面に戻る</button>
        </div>
      </header>

      <div className="demo-banner">デモ：顧問先担当者としてログインした状態です。自社の書類のみ表示されます。</div>

      <section className="client-hero panel">
        <div>
          <span className="eyebrow">{client.name}</span>
          <h1>書類共有スペース</h1>
          <p className="lead">担当社労士：{client.owner}　｜　給与支給日：{client.payDay}</p>
        </div>
        <div className="hero-stats">
          <div><strong>{newCount}</strong><small>新着書類</small></div>
          <div><strong>{visible.length}</strong><small>共有書類</small></div>
        </div>
      </section>

      <section className="client-grid">
        <div className="panel">
          <div className="toolbar">
            {['すべて', ...CATEGORIES].map((cat) => (
              <button key={cat} type="button" className={`filter-btn ${category === cat ? 'active' : ''}`} onClick={() => setCategory(cat)}>
                {cat}
                {cat !== 'すべて' && <span className="count">{visible.filter((d) => d.category === cat).length}</span>}
              </button>
            ))}
          </div>
          <div className="doc-cards">
            {shown.length === 0 && <p className="muted">この分類の書類はまだありません。</p>}
            {shown.map((d) => (
              <div key={d.id} className="doc-card">
                <div className="doc-icon">{d.name.endsWith('.xlsx') ? 'XLS' : d.name.endsWith('.docx') ? 'DOC' : 'PDF'}</div>
                <div className="doc-meta">
                  <strong>{d.name}{d.isNew && <span className="new-badge">NEW</span>}</strong>
                  <small>{d.category} ・ {d.date} {d.source === '顧問先' ? '・ 御社より提出' : ''}</small>
                </div>
                <button type="button" className="chip-btn" onClick={() => download(d)}>ダウンロード</button>
              </div>
            ))}
          </div>
        </div>

        <div className="stack">
          <div className="panel">
            <div className="panel-header"><h2>書類を提出する</h2></div>
            <p className="muted small">勤怠データ・入退社書類などをアップロードすると、担当者に自動で通知されます。</p>
            <div
              className="drop-zone compact"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); submit(Array.from(e.dataTransfer.files || [])); }}
            >
              <div className="drop-body">
                <strong>ここにドロップ</strong>
                <button type="button" className="chip-btn" onClick={() => fileInput.current?.click()}>ファイルを選択</button>
                <input ref={fileInput} type="file" multiple hidden onChange={(e) => { submit(Array.from(e.target.files || [])); e.target.value = ''; }} />
              </div>
            </div>
          </div>

          <div className="panel security-test">
            <div className="panel-header"><h2>🔒 アクセス制御テスト</h2></div>
            <p className="muted small">他社の書類URLに直接アクセスした場合の挙動を確認できます（デモ用）。</p>
            <div className="list">
              {otherDocs.map((d) => (
                <button key={d.id} type="button" className="list-row as-btn" onClick={() => tryOpen(d)}>
                  <div><strong className="mono small">/sites/client-{d.clientId.toLowerCase()}/{d.id}</strong></div>
                  <span className="muted small">開く →</span>
                </button>
              ))}
            </div>
            {denied && (
              <div className="denied">
                <strong>403 アクセスが拒否されました</strong>
                <p>このファイルは別の顧問先（{denied.owner.id}）のサイトに保存されています。{user.name}にはアクセス権がありません。</p>
                <small>この操作は監査ログに記録されます。</small>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
