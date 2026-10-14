import { useEffect, useRef, useState } from 'react';
import { DEMO_TODAY } from '../data';
import { buildFileName, buildSavePath, matchClient, nowTime } from '../logic';

const STEPS = [
  { title: '公文書 取得', detail: 'Cells / e-Gov から取得したZIPを監視フォルダで検知' },
  { title: '内容解析', detail: 'ZIP展開・XML/PDFから事業所名・記号・手続名を抽出' },
  { title: '顧問先判定', detail: '事業所整理記号・労働保険番号・名称で顧問先マスタと照合' },
  { title: 'リネーム', detail: '命名規則に沿ってファイル名を統一' },
  { title: '保存', detail: '顧問先別フォルダ（SharePoint）へ保存' },
  { title: '共有・通知', detail: '共有サイトへ掲載し、担当者・顧問先へ通知' }
];

const SAMPLE_PROCEDURES = [
  '健康保険・厚生年金保険 被保険者資格取得確認通知書',
  '雇用保険 被保険者資格取得等確認通知書',
  '健康保険・厚生年金保険 被保険者資格喪失確認通知書',
  '健康保険 被扶養者（異動）決定通知書'
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Automation({ store, toast }) {
  const { clients, egovInbox, reviewQueue, runLog, settings, update } = store;
  const [running, setRunning] = useState(false);
  const [current, setCurrent] = useState({ id: null, step: -1 });
  const [choices, setChoices] = useState({});
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  const saveDocument = (item, client, result, confidence, reason) => {
    const name = buildFileName(client, item);
    const publish = settings.autoPublish;
    update('documents', (prev) => [
      { id: `D${Date.now()}${item.id}`, clientId: client.id, category: '公文書', name, date: item.docDate, source: '自動取込', status: publish ? '公開' : '下書き', isNew: publish },
      ...prev
    ]);
    update('runLog', (prev) => [
      { id: `${item.id}-${Date.now()}`, time: nowTime(), rawName: item.rawName, newName: name, path: buildSavePath(client, item), confidence, reason, result },
      ...prev
    ]);
  };

  const run = async () => {
    if (running || egovInbox.length === 0) return;
    setRunning(true);
    const items = [...egovInbox];
    const { threshold } = settings;
    let saved = 0;
    let held = 0;

    const animate = async (id, from, to) => {
      for (let s = from; s <= to; s += 1) {
        if (!alive.current) return false;
        setCurrent({ id, step: s });
        await sleep(s === 2 ? 420 : 220);
      }
      return alive.current;
    };

    for (const item of items) {
      // 取得 → 解析 → 顧問先判定
      if (!(await animate(item.id, 0, 2))) return;
      const m = matchClient(item, clients);
      if (!m.client || m.confidence < threshold) {
        // 確信度が低いものは自動保存・共有せず、職員確認へ
        update('reviewQueue', (prev) => [...prev, { ...item, candidateId: m.client?.id ?? '', confidence: m.confidence, reason: m.reason }]);
        update('runLog', (prev) => [
          { id: `${item.id}-${Date.now()}`, time: nowTime(), rawName: item.rawName, newName: '—', path: '確認待ちフォルダ', confidence: m.confidence, reason: m.reason, result: '確認待ち' },
          ...prev
        ]);
        held += 1;
      } else {
        // リネーム → 保存 → 共有・通知
        if (!(await animate(item.id, 3, 5))) return;
        saveDocument(item, m.client, '自動保存', m.confidence, m.reason);
        saved += 1;
      }
      update('egovInbox', (prev) => prev.filter((x) => x.id !== item.id));
    }

    setCurrent({ id: null, step: -1 });
    setRunning(false);
    toast(`処理完了：自動保存 ${saved}件 / 確認待ち ${held}件`, held ? 'warn' : 'success');
  };

  const receiveMore = () => {
    const stamp = Date.now().toString().slice(-6);
    const picks = [...clients].sort(() => Math.random() - 0.5).slice(0, 3);
    const items = picks.map((c, i) => {
      const style = i % 3;
      return {
        id: `E${stamp}${i}`,
        rawName: `20261015${stamp}${i}_kobunsho.zip`,
        arrival: `20261015${stamp}${i}`,
        procedure: SAMPLE_PROCEDURES[Math.floor(Math.random() * SAMPLE_PROCEDURES.length)],
        bizName: style === 2 ? c.name.replace(/株式会社|有限会社|合同会社|医療法人社団/, '').slice(0, 3) : c.name,
        officeCode: style === 0 ? c.officeCode : '',
        laborNo: '',
        docDate: DEMO_TODAY
      };
    });
    update('egovInbox', (prev) => [...prev, ...items]);
    toast('新しい公文書を3件受信しました');
  };

  const approve = (item) => {
    const cid = choices[item.id] ?? item.candidateId;
    const client = clients.find((c) => c.id === cid);
    if (!client) {
      toast('保存先の顧問先を選択してください', 'warn');
      return;
    }
    saveDocument(item, client, '確認後保存', item.confidence, `職員が ${client.name} に確定`);
    update('reviewQueue', (prev) => prev.filter((x) => x.id !== item.id));
    toast(`${client.name} のフォルダへ保存しました`, 'success');
  };

  const discard = (item) => {
    update('reviewQueue', (prev) => prev.filter((x) => x.id !== item.id));
    update('runLog', (prev) => [
      { id: `${item.id}-${Date.now()}`, time: nowTime(), rawName: item.rawName, newName: '—', path: '—', confidence: item.confidence, reason: '職員が対象外と判断', result: '除外' },
      ...prev
    ]);
    toast('対象外として除外しました');
  };

  const setSetting = (key, value) => update('settings', (prev) => ({ ...prev, [key]: value }));
  const activeStep = current.step;
  const sampleClient = clients[0];

  return (
    <>
      <section className="overview">
        <div className="section-header">
          <div>
            <span className="eyebrow">優先施策 ②</span>
            <h1>公文書の取得・振り分け・保存</h1>
            <p className="lead">電子申請後の公文書・決定通知書を顧問先別に自動整理します。判定が不確実なものは自動保存せず、職員の確認に回します。</p>
          </div>
          <div className="header-actions">
            <button className="secondary-btn" type="button" onClick={receiveMore} disabled={running}>公文書を受信（デモ）</button>
            <button className="primary-btn" type="button" onClick={run} disabled={running || egovInbox.length === 0}>
              {running ? '処理中…' : `取込フローを実行（${egovInbox.length}件）`}
            </button>
          </div>
        </div>

        <ol className="pipeline">
          {STEPS.map((s, i) => (
            <li key={s.title} className={`pipe-step ${running && i === activeStep ? 'active' : ''} ${running && i < activeStep ? 'passed' : ''}`}>
              <span className="pipe-n">{i + 1}</span>
              <strong>{s.title}</strong>
              <small>{s.detail}</small>
            </li>
          ))}
        </ol>
      </section>

      <section className="workspace-grid">
        <div className="panel">
          <div className="panel-header">
            <h2>取込待ち（監視フォルダ）</h2>
            <span className="muted small">{egovInbox.length}件</span>
          </div>
          <div className="list">
            {egovInbox.length === 0 && <p className="muted">取込待ちの公文書はありません。「公文書を受信（デモ）」で追加できます。</p>}
            {egovInbox.map((item) => (
              <div key={item.id} className={`list-row ${current.id === item.id ? 'processing' : ''}`}>
                <div>
                  <strong className="mono small">{item.rawName}</strong>
                  <small>{item.procedure}</small>
                </div>
                {current.id === item.id ? <span className="spinner" aria-label="処理中" /> : <span className="muted small">待機</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header"><h2>処理ルール設定</h2></div>
          <div className="setting">
            <label htmlFor="threshold">
              自動保存する判定確信度の下限 <strong>{settings.threshold}%</strong>
            </label>
            <input id="threshold" type="range" min="60" max="99" value={settings.threshold} onChange={(e) => setSetting('threshold', Number(e.target.value))} />
            <small className="muted">これ未満の書類は「確認待ち」に回り、職員が保存先を確定します。</small>
          </div>
          <label className="check">
            <input type="checkbox" checked={settings.autoPublish} onChange={(e) => setSetting('autoPublish', e.target.checked)} />
            保存と同時に顧問先共有サイトへ公開する
          </label>
          <label className="check">
            <input type="checkbox" checked={settings.notifyClient} onChange={(e) => setSetting('notifyClient', e.target.checked)} />
            顧問先担当者へ新着メールを送信する
          </label>
          <div className="rule-box">
            <small className="muted">命名規則</small>
            <code>{'{顧問先コード}_{顧問先名}_{通知日}_{手続名}.pdf'}</code>
            <small className="muted">例：{buildFileName(sampleClient, { docDate: DEMO_TODAY, procedure: SAMPLE_PROCEDURES[0] })}</small>
            <small className="muted">保存先：{buildSavePath(sampleClient, { docDate: DEMO_TODAY })}</small>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>職員確認待ち</h2>
          <span className={`portal-status ${reviewQueue.length ? 'review' : 'live'}`}>{reviewQueue.length}件</span>
        </div>
        {reviewQueue.length === 0 && <p className="muted">確認待ちの書類はありません。</p>}
        <div className="review-grid">
          {reviewQueue.map((item) => (
            <div key={item.id} className="review-card">
              <div className="review-top">
                <strong>{item.procedure}</strong>
                <ConfidenceBar value={item.confidence} />
              </div>
              <dl>
                <dt>ファイル</dt><dd className="mono small">{item.rawName}</dd>
                <dt>抽出した事業所名</dt><dd>{item.bizName}</dd>
                <dt>事業所整理記号</dt><dd>{item.officeCode || '（記載なし）'}</dd>
                <dt>判定理由</dt><dd className="warn-text">{item.reason}</dd>
              </dl>
              <select
                className="field"
                value={choices[item.id] ?? item.candidateId}
                onChange={(e) => setChoices({ ...choices, [item.id]: e.target.value })}
              >
                <option value="">保存先の顧問先を選択…</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.id} {c.name}</option>)}
              </select>
              <div className="review-actions">
                <button type="button" className="primary-btn" onClick={() => approve(item)}>確定して保存</button>
                <button type="button" className="ghost-btn" onClick={() => discard(item)}>対象外</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>処理ログ</h2>
          <span className="muted small">全処理を記録（監査・振り返り用）</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>時刻</th><th>取得ファイル</th><th>保存ファイル名 / 保存先</th><th>確信度</th><th>結果</th></tr>
            </thead>
            <tbody>
              {runLog.length === 0 && <tr><td colSpan="5" className="muted">まだ処理履歴がありません。「取込フローを実行」を押してください。</td></tr>}
              {runLog.map((l) => (
                <tr key={l.id}>
                  <td className="mono small">{l.time}</td>
                  <td className="mono small">{l.rawName}</td>
                  <td>
                    <div className="doc-name">{l.newName}</div>
                    <small className="muted">{l.path}</small>
                  </td>
                  <td><ConfidenceBar value={l.confidence} /><small className="muted">{l.reason}</small></td>
                  <td><span className={`result-tag r-${l.result}`}>{l.result}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function ConfidenceBar({ value }) {
  const tone = value >= 90 ? 'ok' : value >= 60 ? 'mid' : 'low';
  return (
    <div className={`conf ${tone}`}>
      <div className="conf-track"><div className="conf-fill" style={{ width: `${value}%` }} /></div>
      <span>{value}%</span>
    </div>
  );
}
