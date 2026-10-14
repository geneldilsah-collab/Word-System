import { useRef, useState } from 'react';
import { CATEGORIES, DEMO_TODAY } from '../data';
import { downloadDummy } from '../logic';

export default function PortalAdmin({ store, toast, clientId, setClientId, viewAsClient }) {
  const { clients, documents, settings, update } = store;
  const [category, setCategory] = useState('すべて');
  const [uploadCategory, setUploadCategory] = useState('公文書');
  const [publishNow, setPublishNow] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const fileInput = useRef(null);

  const client = clients.find((c) => c.id === clientId) ?? clients[0];
  const clientDocs = documents
    .filter((d) => d.clientId === client.id)
    .filter((d) => category === 'すべて' || d.category === category)
    .sort((a, b) => b.date.localeCompare(a.date));

  const addFiles = (files) => {
    if (!files.length) return;
    const added = files.map((f, i) => ({
      id: `D${Date.now()}${i}`,
      clientId: client.id,
      category: uploadCategory,
      name: f.name,
      date: DEMO_TODAY,
      source: '職員',
      status: publishNow ? '公開' : '下書き',
      isNew: publishNow
    }));
    update('documents', (prev) => [...added, ...prev]);
    toast(
      `${client.name} の「${uploadCategory}」に ${files.length}件 登録しました` +
        (publishNow && settings.notifyClient ? '（顧問先へ新着通知を送信）' : ''),
      'success'
    );
  };

  const togglePublish = (doc) => {
    const next = doc.status === '公開' ? '下書き' : '公開';
    update('documents', (prev) => prev.map((d) => (d.id === doc.id ? { ...d, status: next, isNew: next === '公開' } : d)));
    toast(next === '公開' ? '顧問先に公開しました' : '非公開（下書き）に戻しました');
  };

  const removeDoc = (doc) => {
    update('documents', (prev) => prev.filter((d) => d.id !== doc.id));
    toast('書類を削除しました');
  };

  return (
    <>
      <section className="overview">
        <div className="section-header">
          <div>
            <span className="eyebrow">優先施策 ①</span>
            <h1>顧問先共有サイト 管理</h1>
            <p className="lead">顧問先ごとに専用スペースを用意し、公文書・給与資料・就業規則を安全に共有します。</p>
          </div>
          <button className="primary-btn" type="button" onClick={() => viewAsClient(client.id)}>
            {client.name} として表示 →
          </button>
        </div>
      </section>

      <section className="portal-grid">
        <div className="panel">
          <div className="panel-header"><h2>顧問先</h2></div>
          <div className="client-list">
            {clients.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`client-card ${c.id === client.id ? 'active' : ''}`}
                onClick={() => setClientId(c.id)}
              >
                <div className="client-main">
                  <div className="client-badge">{c.id.slice(1)}</div>
                  <div>
                    <div className="client-name">{c.name}</div>
                    <div className="client-meta">{documents.filter((d) => d.clientId === c.id).length}件 ・ 担当 {c.owner}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="stack">
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>{client.name}</h2>
                <div className="muted small mono">サイト: /sites/client-{client.id.toLowerCase()} ・ 事業所整理記号 {client.officeCode}</div>
              </div>
            </div>

            <div className="toolbar">
              {['すべて', ...CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`filter-btn ${category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>書類名</th><th>分類</th><th>日付</th><th>登録元</th><th>公開状態</th><th></th></tr>
                </thead>
                <tbody>
                  {clientDocs.length === 0 && (
                    <tr><td colSpan="6" className="muted">この分類の書類はありません。</td></tr>
                  )}
                  {clientDocs.map((d) => (
                    <tr key={d.id}>
                      <td className="doc-name">📄 {d.name}</td>
                      <td>{d.category}</td>
                      <td>{d.date}</td>
                      <td><span className={`source-tag ${d.source}`}>{d.source}</span></td>
                      <td>
                        {d.source === '顧問先' ? (
                          <span className="portal-status review">受領済</span>
                        ) : (
                          <button type="button" className={`switch ${d.status === '公開' ? 'on' : ''}`} onClick={() => togglePublish(d)}>
                            {d.status === '公開' ? '公開中' : '非公開'}
                          </button>
                        )}
                      </td>
                      <td className="row-actions">
                        <button type="button" className="icon-btn" title="ダウンロード" onClick={() => downloadDummy(d.name)}>⤓</button>
                        <button type="button" className="icon-btn" title="削除" onClick={() => removeDoc(d)}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              className={`drop-zone ${dragActive ? 'dragover' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); addFiles(Array.from(e.dataTransfer.files || [])); }}
            >
              <div className="drop-icon">⇪</div>
              <div className="drop-body">
                <strong>ファイルをドラッグ＆ドロップ、または</strong>
                <button type="button" className="chip-btn" onClick={() => fileInput.current?.click()}>ファイルを選択</button>
                <input ref={fileInput} type="file" multiple hidden onChange={(e) => { addFiles(Array.from(e.target.files || [])); e.target.value = ''; }} />
                <div className="drop-options">
                  <label>
                    分類
                    <select className="field inline" value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)}>
                      {CATEGORIES.filter((c) => c !== '提出書類').map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </label>
                  <label className="check">
                    <input type="checkbox" checked={publishNow} onChange={(e) => setPublishNow(e.target.checked)} />
                    登録と同時に顧問先へ公開
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h2>アクセス権限</h2>
              <span className="portal-status live">顧問先ごとに分離</span>
            </div>
            <div className="list">
              <div className="list-row">
                <div><strong>事務所職員（全員）</strong><small>全顧問先のサイトを管理</small></div>
                <span className="perm-tag full">フルコントロール</span>
              </div>
              {client.users.map((u) => (
                <div key={u.name} className="list-row">
                  <div><strong>{u.name}</strong><small>{client.name} ・ {u.role}</small></div>
                  <span className="perm-tag">{u.perm}</span>
                </div>
              ))}
            </div>

            <h3 className="sub-heading">権限マトリクス（一部）</h3>
            <div className="table-wrap">
              <table className="matrix">
                <thead>
                  <tr>
                    <th>ユーザー ＼ サイト</th>
                    {clients.slice(0, 4).map((c) => <th key={c.id}>{c.id}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {clients.slice(0, 4).map((owner) => (
                    <tr key={owner.id}>
                      <td>{owner.users[0].name}<span className="muted small">（{owner.id}）</span></td>
                      {clients.slice(0, 4).map((site) => (
                        <td key={site.id} className={owner.id === site.id ? 'allow' : 'deny'}>
                          {owner.id === site.id ? '✓ 許可' : '— 不可'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="muted small">顧問先の担当者は自社のサイトのみ閲覧できます。外部共有はユーザー招待制とし、多要素認証（MFA）を必須にする想定です。</p>
          </div>
        </div>
      </section>
    </>
  );
}
