import { useState } from 'react';
import { DEMO_TODAY } from '../data';
import { classifyMail } from '../logic';

export default function MailView({ store, toast }) {
  const { clients, mails, update } = store;
  const [selectedId, setSelectedId] = useState(mails[0]?.id);
  const selected = mails.find((m) => m.id === selectedId) ?? mails[0];
  const unsorted = mails.filter((m) => !m.sorted);

  const runSort = () => {
    if (!unsorted.length) return;
    let saved = 0;
    const newTasks = [];
    const newDocs = [];
    const next = mails.map((m) => {
      if (m.sorted) return m;
      const { client, category, action } = classifyMail(m, clients);
      if (!client) return { ...m, sorted: { clientId: null, category: '未分類', action: null } };
      m.attachments.forEach((a, i) => {
        newDocs.push({ id: `D${Date.now()}${m.id}${i}`, clientId: client.id, category, name: a, date: DEMO_TODAY, source: '顧問先', status: '受領', isNew: false });
        saved += 1;
      });
      if (action) {
        newTasks.push({ id: `T${Date.now()}${m.id}`, clientId: client.id, title: `${action}（メール受付）`, type: '手続', status: 'todo', due: DEMO_TODAY, assignee: client.owner });
      }
      return { ...m, sorted: { clientId: client.id, category, action } };
    });
    update('mails', next);
    if (newDocs.length) update('documents', (prev) => [...newDocs, ...prev]);
    if (newTasks.length) update('tasks', (prev) => [...newTasks, ...prev]);
    toast(`${unsorted.length}件を仕分け：添付 ${saved}件を顧問先フォルダへ保存、タスク ${newTasks.length}件を作成`, 'success');
  };

  const clientOf = (id) => clients.find((c) => c.id === id);

  return (
    <>
      <section className="overview">
        <div className="section-header">
          <div>
            <span className="eyebrow">Outlook 連携</span>
            <h1>メール・添付ファイルの整理</h1>
            <p className="lead">送信元ドメインから顧問先を特定し、添付ファイルを顧問先フォルダへ保存。入退社などの依頼は進捗管理にタスクとして登録します。</p>
          </div>
          <button className="primary-btn" type="button" onClick={runSort} disabled={!unsorted.length}>
            仕分けルールを実行（{unsorted.length}件）
          </button>
        </div>
      </section>

      <section className="mail-grid">
        <div className="panel">
          <div className="panel-header"><h2>受信トレイ</h2></div>
          <div className="mail-list">
            {mails.map((m) => {
              const c = m.sorted?.clientId ? clientOf(m.sorted.clientId) : null;
              return (
                <button key={m.id} type="button" className={`mail-item ${selected?.id === m.id ? 'active' : ''}`} onClick={() => setSelectedId(m.id)}>
                  <div className="mail-top">
                    <strong>{m.fromName}</strong>
                    <small>{m.date}</small>
                  </div>
                  <span className="mail-subject">{m.subject}</span>
                  <div className="mail-tags">
                    {m.attachments.length > 0 && <span className="tag">📎 {m.attachments.length}</span>}
                    {!m.sorted && <span className="tag muted-tag">未整理</span>}
                    {m.sorted && c && <span className="tag ok-tag">{c.id} ・ {m.sorted.category}</span>}
                    {m.sorted && !c && <span className="tag warn-tag">未分類（要確認）</span>}
                    {m.sorted?.action && <span className="tag task-tag">タスク化</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {selected && (
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>{selected.subject}</h2>
                <small className="muted">{selected.from} ・ {selected.date}</small>
              </div>
            </div>
            <div className="ai-box">
              <span className="ai-label">AI 要約（デモ）</span>
              <p>{selected.summary}</p>
            </div>
            <h3 className="sub-heading">添付ファイル</h3>
            {selected.attachments.length === 0 && <p className="muted small">添付なし</p>}
            <ul className="file-list">
              {selected.attachments.map((a) => (
                <li key={a}>
                  📎 {a}
                  {selected.sorted?.clientId && (
                    <small className="save-path">→ 顧問先/{selected.sorted.clientId}_{clientOf(selected.sorted.clientId).name}/{selected.sorted.category}/</small>
                  )}
                </li>
              ))}
            </ul>
            <h3 className="sub-heading">仕分け結果</h3>
            {!selected.sorted && <p className="muted small">未実行です。「仕分けルールを実行」を押してください。</p>}
            {selected.sorted && (
              <div className="compliance-grid">
                <div className="compliance-card"><span>顧問先</span><strong>{selected.sorted.clientId ? clientOf(selected.sorted.clientId).name : '特定できず（新規問合せの可能性）'}</strong></div>
                <div className="compliance-card"><span>分類</span><strong>{selected.sorted.category}</strong></div>
                <div className="compliance-card"><span>作成タスク</span><strong>{selected.sorted.action ?? 'なし'}</strong></div>
                <div className="compliance-card"><span>Outlook フォルダ</span><strong>{selected.sorted.clientId ? `顧問先/${selected.sorted.clientId}` : '要確認'}</strong></div>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-header"><h2>仕分けルール</h2></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>条件</th><th>処理</th><th>実装</th></tr></thead>
            <tbody>
              <tr><td>送信元ドメインが顧問先マスタに一致</td><td>顧問先フォルダへ移動・添付を保存</td><td>Power Automate（Outlook トリガー）</td></tr>
              <tr><td>件名・本文に「勤怠」「給与」「明細」</td><td>分類「給与資料」</td><td>キーワード / AI 分類</td></tr>
              <tr><td>件名・本文に「入社」「退職」「離職」</td><td>分類「提出書類」＋進捗管理にタスク作成</td><td>Power Automate → Planner / リスト</td></tr>
              <tr><td>どのルールにも一致しない</td><td>「要確認」フォルダへ（自動処理しない）</td><td>—</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
