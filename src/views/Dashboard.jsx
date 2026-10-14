import { TOTAL_CLIENTS, DEMO_TODAY } from '../data';
import { daysUntil } from '../logic';

export default function Dashboard({ store, go, openPortalFor }) {
  const { clients, documents, tasks, reviewQueue, egovInbox, runLog, mails } = store;
  const clientName = (id) => clients.find((c) => c.id === id)?.name ?? '—';

  const openTasks = tasks.filter((t) => t.status !== 'done');
  const dueSoon = openTasks
    .filter((t) => daysUntil(t.due) <= 3)
    .sort((a, b) => a.due.localeCompare(b.due));
  const autoSaved = runLog.filter((l) => l.result === '自動保存').length;
  const unsortedMails = mails.filter((m) => !m.sorted).length;

  return (
    <>
      <section className="overview">
        <div className="section-header">
          <div>
            <span className="eyebrow">{DEMO_TODAY.replaceAll('-', '/')} の状況</span>
            <h1>事務所ダッシュボード</h1>
            <p className="lead">書類の受け取りから処理・保存・顧問先への共有までを、一連の流れとして管理します。</p>
          </div>
          <button className="primary-btn" type="button" onClick={() => go('automation')}>公文書を取り込む</button>
        </div>

        <div className="stats-grid">
          <article className="stat-card primary">
            <span className="stat-label">顧問先</span>
            <strong>{TOTAL_CLIENTS}社</strong>
            <small>うちデモ表示 {clients.length}社</small>
          </article>
          <article className="stat-card">
            <span className="stat-label">未取込の公文書</span>
            <strong>{egovInbox.length}件</strong>
            <small>本日取込済 {autoSaved}件</small>
          </article>
          <article className="stat-card">
            <span className="stat-label">職員確認待ち</span>
            <strong className={reviewQueue.length ? 'warn-text' : ''}>{reviewQueue.length}件</strong>
            <small>顧問先判定が不確実な書類</small>
          </article>
          <article className="stat-card">
            <span className="stat-label">期限3日以内</span>
            <strong className={dueSoon.length ? 'danger-text' : ''}>{dueSoon.length}件</strong>
            <small>未完了の手続・給与計算</small>
          </article>
        </div>
      </section>

      <section className="workspace-grid">
        <div className="panel">
          <div className="panel-header">
            <h2>期限が近いタスク</h2>
            <button className="chip-btn" type="button" onClick={() => go('progress')}>進捗管理へ</button>
          </div>
          <div className="list">
            {dueSoon.length === 0 && <p className="muted">期限が近いタスクはありません。</p>}
            {dueSoon.map((t) => {
              const d = daysUntil(t.due);
              return (
                <div key={t.id} className="list-row">
                  <div>
                    <strong>{t.title}</strong>
                    <small>{clientName(t.clientId)} ・ 担当 {t.assignee}</small>
                  </div>
                  <span className={`due-tag ${d < 0 ? 'over' : d === 0 ? 'today' : ''}`}>
                    {d < 0 ? `${-d}日超過` : d === 0 ? '本日期限' : `あと${d}日`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>今日の自動化フロー</h2>
          </div>
          <div className="flow-mini">
            <FlowStep n="1" title="公文書 取込" value={`${egovInbox.length}件 待機`} onClick={() => go('automation')} />
            <FlowStep n="2" title="確認待ち" value={`${reviewQueue.length}件`} onClick={() => go('automation')} tone={reviewQueue.length ? 'warn' : ''} />
            <FlowStep n="3" title="メール仕分け" value={`${unsortedMails}件 未整理`} onClick={() => go('mail')} />
            <FlowStep n="4" title="顧問先へ共有" value={`${documents.filter((d) => d.isNew).length}件 新着`} onClick={() => go('portal')} />
          </div>
          <p className="muted small">各ステップをクリックすると該当画面に移動します。</p>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>顧問先一覧</h2>
          <span className="muted small">クリックで共有サイト管理を開く</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>コード</th><th>顧問先</th><th>担当</th><th>給与ソフト</th><th>共有書類</th><th>未完了タスク</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="clickable" onClick={() => openPortalFor(c.id)}>
                  <td className="mono">{c.id}</td>
                  <td><strong>{c.name}</strong><div className="muted small">{c.industry} ・ {c.employees}名</div></td>
                  <td>{c.owner}</td>
                  <td>{c.payroll}</td>
                  <td>{documents.filter((d) => d.clientId === c.id).length}件</td>
                  <td>{tasks.filter((t) => t.clientId === c.id && t.status !== 'done').length}件</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function FlowStep({ n, title, value, onClick, tone = '' }) {
  return (
    <button type="button" className={`flow-step ${tone}`} onClick={onClick}>
      <span className="flow-n">{n}</span>
      <strong>{title}</strong>
      <small>{value}</small>
    </button>
  );
}
