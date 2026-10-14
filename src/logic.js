import { DEMO_TODAY } from './data';

const CORP_WORDS = /(株式会社|有限会社|合同会社|医療法人社団|医療法人|\(株\)|（株）|\(有\)|（有）|\s|　)/g;
export const normalizeName = (name) => name.replace(CORP_WORDS, '');

// 公文書の顧問先判定: 事業所整理記号/労働保険番号 → 名称完全一致 → 部分一致 の順に判定
export function matchClient(doc, clients) {
  if (doc.officeCode) {
    const hit = clients.find((c) => c.officeCode === doc.officeCode);
    if (hit) return { client: hit, confidence: 99, reason: '事業所整理記号が一致' };
  }
  if (doc.laborNo) {
    const hit = clients.find((c) => c.laborNo === doc.laborNo);
    if (hit) return { client: hit, confidence: 99, reason: '労働保険番号が一致' };
  }
  const target = normalizeName(doc.bizName);
  const exact = clients.find((c) => normalizeName(c.name) === target);
  if (exact) return { client: exact, confidence: 90, reason: '事業所名称が一致（記号なし）' };
  const partial = clients.find((c) => {
    const n = normalizeName(c.name);
    return n.includes(target) || target.includes(n);
  });
  if (partial) return { client: partial, confidence: 62, reason: '事業所名称が部分一致' };
  return { client: null, confidence: 0, reason: '顧問先マスタに該当なし' };
}

const PROCEDURE_SHORT = [
  [/資格取得確認通知書/, '資格取得決定通知書'],
  [/雇用保険.*資格取得/, '雇用保険資格取得確認通知書'],
  [/報酬月額変更/, '月額変更決定通知書'],
  [/離職票/, '離職票'],
  [/被扶養者/, '被扶養者異動決定通知書'],
  [/資格喪失/, '資格喪失確認通知書']
];

export const shortProcedure = (procedure) =>
  PROCEDURE_SHORT.find(([re]) => re.test(procedure))?.[1] ?? procedure.replace(/\s/g, '');

export const buildFileName = (client, doc) =>
  `${client.id}_${client.name}_${doc.docDate.replaceAll('-', '')}_${shortProcedure(doc.procedure)}.pdf`;

export const buildSavePath = (client, doc) =>
  `顧問先/${client.id}_${client.name}/01_公文書/${doc.docDate.slice(0, 4)}年/`;

export const daysUntil = (date) =>
  Math.round((new Date(date) - new Date(DEMO_TODAY)) / 86400000);

export const nowTime = () => new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export const yen = (n) => `¥${n.toLocaleString('ja-JP')}`;

export function downloadDummy(fileName) {
  const body = `これはデモ用のダミーファイルです。\n\nファイル名: ${fileName}\n本番環境では SharePoint / OneDrive 上の実ファイルがダウンロードされます。`;
  const url = URL.createObjectURL(new Blob([body], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// メール仕分け: 送信元ドメイン → 顧問先、件名・本文キーワード → 分類
export function classifyMail(mail, clients) {
  const domain = mail.from.split('@')[1];
  const client = clients.find((c) => c.mailDomain === domain) ?? null;
  const text = `${mail.subject} ${mail.summary}`;
  let category = 'その他';
  let action = null;
  if (/勤怠|給与|明細|賞与/.test(text)) category = '給与資料';
  if (/入社|資格取得/.test(text)) { category = '提出書類'; action = '資格取得手続'; }
  if (/退職|離職/.test(text)) { category = '提出書類'; action = '資格喪失・離職票手続'; }
  if (/就業規則|規程/.test(text)) category = '就業規則';
  return { client, category, action };
}
