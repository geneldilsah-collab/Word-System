import { useState } from 'react';
import { DEMO_TODAY, PAYROLL_STEPS, payrollVariance } from '../data';
import { yen } from '../logic';

export default function PayrollView({ store, toast }) {
  const { clients, payroll, update } = store;
  const [selectedId, setSelectedId] = useState(clients[0].id);
  const [busy, setBusy] = useState(false);
  const client = clients.find((c) => c.id === selectedId);
  const done = payroll[selectedId] ?? 0;
  const nextStep = PAYROLL_STEPS[done];

  const advance = () => {
    if (!nextStep || busy) return;
    setBusy(true);
    setTimeout(() => {
      update('payroll', (prev) => ({ ...prev, [selectedId]: (prev[selectedId] ?? 0) + 1 }));
      if (nextStep.key === 'publish') {
        update('documents', (prev) => [
          { id: `D${Date.now()}`, clientId: selectedId, category: '給与資料', name: '2026年10月分_給与明細一覧.pdf', date: DEMO_TODAY, source: '職員', status: '公開', isNew: true },
          ...prev
        ]);
      }
      const messages = {
        receive: '勤怠データを受領済みにしました',
        convert: `勤怠Excel → 弥生取込用CSVに変換しました（${client.employees}名分）`,
        import: `${client.payroll} への取込が完了しました`,
        check: '前月比チェック完了：要確認 2名',
        approve: '顧問先の承認を受領しました',
        publish: '給与明細一覧を共有サイトへ公開しました'
      };
      toast(messages[nextStep.key], nextStep.key === 'check' ? 'warn' : 'success');
      setBusy(false);
    }, 600);
  };

  const flagged = payrollVariance.map((r) => {
    const diff = ((r.curr - r.prev) / r.prev) * 100;
    return { ...r, diff, flag: Math.abs(diff) >= 20 };
  });

  return (
    <>
      <section className="overview">
        <div className="section-header">
          <div>
            <span className="eyebrow">弥生給与 / 弥生給与 Next</span>
            <h1>給与計算 前後作業の効率化</h1>
            <p className="lead">給与計算そのものは弥生で行い、その前後の「受領・変換・取込・チェック・共有」を定型化・自動化します。</p>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>10月分 給与計算の進捗</h2>
          <span className="muted small">行をクリックで詳細</span>
        </div>
        <div className="table-wrap">
          <table className="payroll-table">
            <thead>
              <tr>
                <th>顧問先</th>
                <th>ソフト</th>
                <th>支給日</th>
                {PAYROLL_STEPS.map((s) => <th key={s.key}>{s.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => {
                const n = payroll[c.id] ?? 0;
                return (
                  <tr key={c.id} className={`clickable ${c.id === selectedId ? 'selected' : ''}`} onClick={() => setSelectedId(c.id)}>
                    <td><strong>{c.name}</strong></td>
                    <td className="small">{c.payroll}</td>
                    <td>{c.payDay}</td>
                    {PAYROLL_STEPS.map((s, i) => (
                      <td key={s.key} className="center">
                        <span className={`dot ${i < n ? 'done' : i === n ? 'now' : ''}`} />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="workspace-grid">
        <div className="panel">
          <div className="panel-header">
            <h2>{client.name}</h2>
            <span className="muted small">{client.payroll}</span>
          </div>
          <ol className="steps">
            {PAYROLL_STEPS.map((s, i) => (
              <li key={s.key} className={i < done ? 'done' : i === done ? 'now' : ''}>
                <span className="step-dot">{i < done ? '✓' : i + 1}</span>
                <div>
                  <strong>{s.label}</strong>
                  <small>{s.tool}</small>
                </div>
              </li>
            ))}
          </ol>
          <div className="review-actions">
            <button type="button" className="primary-btn" onClick={advance} disabled={!nextStep || busy}>
              {busy ? '実行中…' : nextStep ? `「${nextStep.label}」を実行` : '10月分 完了'}
            </button>
            {done > 0 && (
              <button type="button" className="ghost-btn" onClick={() => update('payroll', (prev) => ({ ...prev, [selectedId]: 0 }))}>
                やり直す
              </button>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>前月比チェック</h2>
            <span className="portal-status review">±20%以上を自動で抽出</span>
          </div>
          <div className="table-wrap">
            <table className="compact-table">
              <thead><tr><th>従業員</th><th>前月 総支給</th><th>今月 総支給</th><th>差異</th></tr></thead>
              <tbody>
                {flagged.map((r) => (
                  <tr key={r.emp} className={r.flag ? 'flag-row' : ''}>
                    <td>{r.emp}</td>
                    <td>{yen(r.prev)}</td>
                    <td>{yen(r.curr)}</td>
                    <td className={r.flag ? 'danger-text' : 'muted'}>
                      {r.diff > 0 ? '+' : ''}{r.diff.toFixed(1)}% {r.flag && '要確認'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted small">残業の急増・欠勤控除・入力漏れなどを、弥生から出力したデータで自動比較し、確認すべき人だけを表示します。</p>
        </div>
      </section>
    </>
  );
}
