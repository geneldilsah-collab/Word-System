const ARCH = [
  { title: '入口', items: ['Cells / e-Gov 電子申請', 'Outlook（顧問先メール）', '顧問先からのアップロード'] },
  { title: '自動処理', items: ['Power Automate Desktop（取得・弥生操作）', 'Power Automate（クラウドフロー）', 'Python / AI（解析・分類）'] },
  { title: '保存・管理', items: ['SharePoint 顧問先別サイト', '顧問先マスタ（Microsoft Lists）', '進捗管理リスト・処理ログ'] },
  { title: '共有', items: ['顧問先専用ページ', '新着通知メール', '職員向けダッシュボード'] }
];

const OPTIONS = [
  { name: 'SharePoint（Microsoft 365）', cost: '既存ライセンス内で開始可', security: '◎ 権限分離・MFA・監査ログ', ops: '◎ 既存環境と一体運用', note: '第一候補' },
  { name: 'クラウドストレージ（Box 等）', cost: '追加月額が発生', security: '◎', ops: '○ 別サービスの管理が増える', note: '' },
  { name: '独自 Web ポータル', cost: '開発・保守費が大きい', security: '○ 設計次第', ops: '△ 改修に開発者が必要', note: '要件が特殊な場合' }
];

const PHASES = [
  { phase: 'STEP 0', title: '業務ヒアリング・要件整理', period: '約2週間', cost: '5万〜10万円', items: ['現行フロー・作業時間の確認', 'Microsoft 365 契約・設定の確認', '公文書の取得方法の確認', '自動化の優先順位付け'] },
  { phase: 'STEP 1', title: '顧問先共有サイトの構築', period: '約3〜4週間', cost: '15万〜30万円', items: ['顧問先別サイト・フォルダ設計', 'アクセス権限・外部共有設定', '書類分類・命名ルール', '新着通知・操作マニュアル'] },
  { phase: 'STEP 2', title: '公文書の取得・振り分け・保存', period: '約3〜5週間', cost: '15万〜35万円', items: ['取得処理（自動／半自動）', '顧問先判定・リネーム・保存', '確認待ちキュー・処理ログ', '共有サイトへの掲載連携'] },
  { phase: 'STEP 3〜', title: '継続改善（Outlook・給与・進捗）', period: '効果を見ながら段階的に', cost: '別途お見積り', items: ['メール・添付の自動整理', '弥生給与 前後作業の定型化', '手続・給与の進捗可視化', 'AIによる分類・文案作成支援'] }
];

export default function PlanView() {
  return (
    <>
      <section className="overview">
        <div className="section-header">
          <div>
            <span className="eyebrow">ご提案</span>
            <h1>導入構成と進め方</h1>
            <p className="lead">既存の Microsoft 365・Cells・弥生給与を活かし、優先度の高い2施策から段階的に導入します。</p>
          </div>
        </div>
        <div className="arch">
          {ARCH.map((col, i) => (
            <div key={col.title} className="arch-col">
              <div className="arch-head"><span>{i + 1}</span>{col.title}</div>
              {col.items.map((it) => <div key={it} className="arch-item">{it}</div>)}
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header"><h2>共有サイトの構成案（比較）</h2></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>方式</th><th>費用</th><th>セキュリティ</th><th>運用のしやすさ</th><th></th></tr></thead>
            <tbody>
              {OPTIONS.map((o) => (
                <tr key={o.name} className={o.note === '第一候補' ? 'selected' : ''}>
                  <td><strong>{o.name}</strong></td>
                  <td>{o.cost}</td>
                  <td>{o.security}</td>
                  <td>{o.ops}</td>
                  <td>{o.note && <span className="portal-status live">{o.note}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted small">最終的な方式は、現在の契約内容・顧問先の利用人数・運用体制を確認したうえで決定します。</p>
      </section>

      <section className="phase-grid">
        {PHASES.map((p) => (
          <article key={p.phase} className="panel phase-card">
            <span className="eyebrow">{p.phase}</span>
            <h3>{p.title}</h3>
            <div className="phase-meta">
              <span>{p.period}</span>
              <strong>{p.cost}</strong>
            </div>
            <ul>
              {p.items.map((it) => <li key={it}>{it}</li>)}
            </ul>
          </article>
        ))}
      </section>

      <section className="panel total-panel">
        <div>
          <span className="stat-label">初期導入（STEP 0〜2）概算</span>
          <strong className="total">35万〜75万円</strong>
        </div>
        <p className="muted small">
          電子申請システムとの連携方法、権限設計、既存データの移行範囲により変動します。Microsoft 365 等の追加ライセンス費用は、現在の契約を確認のうえ別途整理します。
        </p>
      </section>
    </>
  );
}
