import { useState } from 'react';
import { DEMO_TODAY, STAFF } from '../data';
import { daysUntil } from '../logic';

const COLUMNS = [
  { key: 'todo', label: '未着手' },
  { key: 'doing', label: '対応中' },
  { key: 'review', label: '確認待ち' },
  { key: 'done', label: '完了' }
];

export default function Progress({ store, toast }) {
  const { clients, tasks, update } = store;
  const [type, setType] = useState('すべて');
  const [assignee, setAssignee] = useState('全員');
  const [dragId, setDragId] = useState(null);
  const [overCol, setOverCol] = useState(null);
  const [form, setForm] = useState({ clientId: clients[0].id, title: '', type: '手続', due: DEMO_TODAY, assignee: STAFF[0] });

  const clientName = (id) => clients.find((c) => c.id === id)?.name ?? '—';
  const filtered = tasks.filter(
    (t) => (type === 'すべて' || t.type === type) && (assignee === '全員' || t.assignee === assignee)
  );

  const move = (id, status) => {
    update('tasks', (prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    const label = COLUMNS.find((c) => c.key === status).label;
    toast(`「${tasks.find((t) => t.id === id)?.title}」を${label}に移動しました`);
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    update('tasks', (prev) => [{ ...form, id: `T${Date.now()}`, title: form.title.trim(), status: 'todo' }, ...prev]);
    setForm({ ...form, title: '' });
    toast('タスクを追加しました', 'success');
  };

  const workload = STAFF.map((s) => ({
    name: s,
    open: tasks.filter((t) => t.assignee === s && t.status !== 'done').length
  }));
  const maxLoad = Math.max(1, ...workload.map((w) => w.open));

  return (
    <>
      <section className="overview">
        <div className="section-header">
          <div>
            <span className="eyebrow">進捗管理</span>
            <h1>手続・給与計算の進捗</h1>
            <p className="lead">カードをドラッグして状態を変更できます。期限・担当者・未対応タスクを一目で把握できます。</p>
          </div>
        </div>
        <div className="workload">
          {workload.map((w) => (
            <button key={w.name} type="button" className={`load-item ${assignee === w.name ? 'active' : ''}`} onClick={() => setAssignee(assignee === w.name ? '全員' : w.name)}>
              <span>{w.name}</span>
              <div className="load-track"><div className="load-fill" style={{ width: `${(w.open / maxLoad) * 100}%` }} /></div>
              <strong>{w.open}件</strong>
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div className="toolbar">
            {['すべて', '手続', '給与', '相談'].map((t) => (
              <button key={t} type="button" className={`filter-btn ${type === t ? 'active' : ''}`} onClick={() => setType(t)}>{t}</button>
            ))}
          </div>
          <select className="field inline" value={assignee} onChange={(e) => setAssignee(e.target.value)} aria-label="担当者">
            <option>全員</option>
            {STAFF.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="kanban four">
          {COLUMNS.map((col) => {
            const items = filtered.filter((t) => t.status === col.key).sort((a, b) => a.due.localeCompare(b.due));
            return (
              <div
                key={col.key}
                className={`kanban-column ${overCol === col.key ? 'drop-target' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setOverCol(col.key); }}
                onDragLeave={() => setOverCol(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setOverCol(null);
                  if (dragId) move(dragId, col.key);
                  setDragId(null);
                }}
              >
                <h3>{col.label} <span className="count">{items.length}</span></h3>
                {items.map((t) => {
                  const d = daysUntil(t.due);
                  const tone = t.status === 'done' ? 'done' : d < 0 ? 'urgent' : d <= 1 ? 'progress' : '';
                  return (
                    <div
                      key={t.id}
                      className={`task-card ${tone}`}
                      draggable
                      onDragStart={() => setDragId(t.id)}
                    >
                      <div className="task-top">
                        <span className={`type-tag t-${t.type}`}>{t.type}</span>
                        <small>{t.assignee}</small>
                      </div>
                      <span>{t.title}</span>
                      <small>{clientName(t.clientId)}</small>
                      <div className="task-bottom">
                        <small className={t.status !== 'done' && d < 0 ? 'danger-text' : ''}>
                          期限 {t.due.slice(5).replace('-', '/')}
                          {t.status !== 'done' && (d < 0 ? `（${-d}日超過）` : d === 0 ? '（本日）' : '')}
                        </small>
                        <select
                          className="mini-select"
                          value={t.status}
                          onChange={(e) => move(t.id, e.target.value)}
                          aria-label="状態を変更"
                        >
                          {COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header"><h2>タスクを追加</h2></div>
        <form className="task-form" onSubmit={addTask}>
          <select className="field" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} aria-label="顧問先">
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input className="field" placeholder="例：社会保険 資格取得届" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} aria-label="タスク名" />
          <select className="field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} aria-label="種別">
            <option>手続</option><option>給与</option><option>相談</option>
          </select>
          <input className="field" type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} aria-label="期限" />
          <select className="field" value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} aria-label="担当者">
            {STAFF.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button className="primary-btn" type="submit">追加</button>
        </form>
      </section>
    </>
  );
}
