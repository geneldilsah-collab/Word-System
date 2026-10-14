// デモ用シードデータ（実在の企業・人物とは関係ありません）
export const DEMO_TODAY = '2026-10-15';
export const TOTAL_CLIENTS = 80;

export const STAFF = ['田中', '山田', '佐藤', '鈴木'];

export const CATEGORIES = ['公文書', '給与資料', '就業規則', '提出書類', 'その他'];

export const defaultClients = [
  {
    id: 'C001', name: '株式会社アオバ製作所', industry: '製造業', employees: 48, owner: '田中',
    officeCode: '12-ア-0456', laborNo: '13101-123456-000', payroll: '弥生給与', payDay: '25日',
    mailDomain: 'aoba-ss.example',
    users: [
      { name: '青木 様', role: '人事担当', perm: '閲覧・アップロード' },
      { name: '木村 様', role: '経理担当', perm: '閲覧のみ' }
    ]
  },
  {
    id: 'C002', name: '株式会社ブルーリンクIT', industry: 'IT', employees: 22, owner: '山田',
    officeCode: '13-ブ-1102', laborNo: '13104-220011-000', payroll: '弥生給与 Next', payDay: '末日',
    mailDomain: 'bluelink.example',
    users: [{ name: '林 様', role: '管理部長', perm: '閲覧・アップロード' }]
  },
  {
    id: 'C003', name: 'さくら商事株式会社', industry: '卸売業', employees: 65, owner: '佐藤',
    officeCode: '11-サ-0789', laborNo: '13102-330456-000', payroll: '弥生給与', payDay: '25日',
    mailDomain: 'sakura-shoji.example',
    users: [
      { name: '佐々木 様', role: '総務担当', perm: '閲覧・アップロード' },
      { name: '桜井 様', role: '代表取締役', perm: '閲覧のみ' }
    ]
  },
  {
    id: 'C004', name: '有限会社みどり建設', industry: '建設業', employees: 31, owner: '鈴木',
    officeCode: '14-ミ-0333', laborNo: '13110-440789-000', payroll: '弥生給与 Next', payDay: '20日',
    mailDomain: 'midori-kensetsu.example',
    users: [{ name: '緑川 様', role: '事務担当', perm: '閲覧・アップロード' }]
  },
  {
    id: 'C005', name: '医療法人社団ひかりクリニック', industry: '医療', employees: 18, owner: '田中',
    officeCode: '15-ヒ-0120', laborNo: '13113-550120-000', payroll: '弥生給与 Next', payDay: '25日',
    mailDomain: 'hikari-clinic.example',
    users: [{ name: '光田 様', role: '事務長', perm: '閲覧・アップロード' }]
  },
  {
    id: 'C006', name: '株式会社ハーベスト食品', industry: '食品製造', employees: 112, owner: '佐藤',
    officeCode: '12-ハ-0901', laborNo: '13108-660901-000', payroll: '弥生給与', payDay: '25日',
    mailDomain: 'harvest-foods.example',
    users: [
      { name: '春日 様', role: '人事課長', perm: '閲覧・アップロード' },
      { name: '堀 様', role: '人事担当', perm: '閲覧・アップロード' }
    ]
  },
  {
    id: 'C007', name: '合同会社ソラ物流', industry: '運輸業', employees: 27, owner: '山田',
    officeCode: '16-ソ-0404', laborNo: '13121-770404-000', payroll: '弥生給与 Next', payDay: '末日',
    mailDomain: 'sora-logi.example',
    users: [{ name: '空野 様', role: '代表社員', perm: '閲覧・アップロード' }]
  },
  {
    id: 'C008', name: '株式会社つばさ介護サービス', industry: '介護', employees: 54, owner: '鈴木',
    officeCode: '13-ツ-0228', laborNo: '13115-880228-000', payroll: '弥生給与', payDay: '15日',
    mailDomain: 'tsubasa-care.example',
    users: [{ name: '翼 様', role: '施設長', perm: '閲覧・アップロード' }]
  }
];

export const defaultDocuments = [
  { id: 'D101', clientId: 'C001', category: '公文書', name: 'C001_株式会社アオバ製作所_20261008_資格取得決定通知書.pdf', date: '2026-10-08', source: '自動取込', status: '公開', isNew: true },
  { id: 'D102', clientId: 'C001', category: '給与資料', name: '2026年09月分_給与明細一覧.pdf', date: '2026-09-25', source: '職員', status: '公開', isNew: false },
  { id: 'D103', clientId: 'C001', category: '就業規則', name: '就業規則_2026年4月改定版.pdf', date: '2026-04-01', source: '職員', status: '公開', isNew: false },
  { id: 'D104', clientId: 'C001', category: '提出書類', name: '10月勤怠データ.xlsx', date: '2026-10-14', source: '顧問先', status: '受領', isNew: false },
  { id: 'D105', clientId: 'C001', category: '公文書', name: 'C001_株式会社アオバ製作所_20260710_算定基礎決定通知書.pdf', date: '2026-07-10', source: '自動取込', status: '公開', isNew: false },
  { id: 'D201', clientId: 'C002', category: '公文書', name: 'C002_株式会社ブルーリンクIT_20261002_雇用保険資格喪失確認通知書.pdf', date: '2026-10-02', source: '自動取込', status: '公開', isNew: false },
  { id: 'D202', clientId: 'C002', category: '就業規則', name: '育児介護休業規程_改定案.docx', date: '2026-10-10', source: '職員', status: '下書き', isNew: false },
  { id: 'D301', clientId: 'C003', category: '給与資料', name: '2026年09月分_賃金台帳.pdf', date: '2026-09-25', source: '職員', status: '公開', isNew: false },
  { id: 'D302', clientId: 'C003', category: '公文書', name: 'C003_さくら商事株式会社_20260915_月額変更決定通知書.pdf', date: '2026-09-15', source: '自動取込', status: '公開', isNew: false },
  { id: 'D401', clientId: 'C004', category: '公文書', name: 'C004_有限会社みどり建設_20260720_労働保険年度更新申告書控.pdf', date: '2026-07-20', source: '自動取込', status: '公開', isNew: false },
  { id: 'D601', clientId: 'C006', category: '給与資料', name: '2026年09月分_賞与計算一覧.xlsx', date: '2026-09-30', source: '職員', status: '公開', isNew: false },
  { id: 'D801', clientId: 'C008', category: '就業規則', name: '就業規則_介護職員処遇改善規程.pdf', date: '2026-08-01', source: '職員', status: '公開', isNew: false }
];

// e-Gov 電子申請後に取得される公文書（ダウンロード直後のファイル名は顧問先が判別できない想定）
export const defaultEgovInbox = [
  { id: 'E01', rawName: '202610150012345_kobunsho.zip', arrival: '202610150012345', procedure: '健康保険・厚生年金保険 被保険者資格取得確認通知書', bizName: '株式会社アオバ製作所', officeCode: '12-ア-0456', laborNo: '', docDate: '2026-10-15' },
  { id: 'E02', rawName: '202610150012399_kobunsho.zip', arrival: '202610150012399', procedure: '雇用保険 被保険者資格取得等確認通知書', bizName: '株式会社ブルーリンクIT', officeCode: '', laborNo: '13104-220011-000', docDate: '2026-10-15' },
  { id: 'E03', rawName: '202610140098765_kobunsho.zip', arrival: '202610140098765', procedure: '健康保険・厚生年金保険 被保険者報酬月額変更決定通知書', bizName: '(株)ハーベスト食品', officeCode: '', laborNo: '', docDate: '2026-10-14' },
  { id: 'E04', rawName: '202610140098801_kobunsho.zip', arrival: '202610140098801', procedure: '雇用保険 被保険者離職票（交付）', bizName: 'ひかりクリニック 分院', officeCode: '', laborNo: '', docDate: '2026-10-14' },
  { id: 'E05', rawName: '202610140098840_kobunsho.zip', arrival: '202610140098840', procedure: '健康保険 被扶養者（異動）決定通知書', bizName: '有限会社みどり建設', officeCode: '14-ミ-0333', laborNo: '', docDate: '2026-10-14' },
  { id: 'E06', rawName: '202610130077001_kobunsho.zip', arrival: '202610130077001', procedure: '健康保険・厚生年金保険 被保険者資格喪失確認通知書', bizName: '株式会社ミライ技研', officeCode: '17-ミ-0555', laborNo: '', docDate: '2026-10-13' }
];

export const defaultTasks = [
  { id: 'T01', clientId: 'C001', title: '雇用保険 資格取得届（新入社員2名）', type: '手続', status: 'doing', due: '2026-10-15', assignee: '田中' },
  { id: 'T02', clientId: 'C003', title: '就業規則変更届 提出', type: '手続', status: 'todo', due: '2026-10-16', assignee: '佐藤' },
  { id: 'T03', clientId: 'C002', title: '10月分 給与計算', type: '給与', status: 'doing', due: '2026-10-28', assignee: '山田' },
  { id: 'T04', clientId: 'C006', title: '10月分 給与計算（112名）', type: '給与', status: 'todo', due: '2026-10-22', assignee: '佐藤' },
  { id: 'T05', clientId: 'C004', title: '被扶養者異動届', type: '手続', status: 'review', due: '2026-10-14', assignee: '鈴木' },
  { id: 'T06', clientId: 'C008', title: '10月分 給与計算', type: '給与', status: 'done', due: '2026-10-13', assignee: '鈴木' },
  { id: 'T07', clientId: 'C005', title: '離職票交付・本人送付', type: '手続', status: 'todo', due: '2026-10-17', assignee: '田中' },
  { id: 'T08', clientId: 'C007', title: '36協定 更新案作成', type: '相談', status: 'doing', due: '2026-10-31', assignee: '山田' },
  { id: 'T09', clientId: 'C001', title: '10月分 給与計算', type: '給与', status: 'todo', due: '2026-10-23', assignee: '田中' }
];

export const defaultMails = [
  { id: 'M01', fromName: '青木（アオバ製作所）', from: 'aoki@aoba-ss.example', subject: '10月分 勤怠データ送付の件', date: '10/15 09:12', attachments: ['勤怠_202610.xlsx'], summary: '10月分の勤怠データ送付。残業が多い社員2名について確認依頼あり。' },
  { id: 'M02', fromName: '林（ブルーリンクIT）', from: 'hayashi@bluelink.example', subject: '新入社員の入社手続きのお願い', date: '10/15 08:47', attachments: ['入社書類_山本.pdf', 'マイナンバー確認書類.pdf'], summary: '11/1入社予定1名の社会保険・雇用保険の資格取得手続き依頼。' },
  { id: 'M03', fromName: '春日（ハーベスト食品）', from: 'kasuga@harvest-foods.example', subject: '退職者の件（離職票希望あり）', date: '10/14 18:30', attachments: ['退職届_写し.pdf'], summary: '10/31退職予定1名。離職票の発行を希望。資格喪失手続きの依頼。' },
  { id: 'M04', fromName: '佐々木（さくら商事）', from: 'sasaki@sakura-shoji.example', subject: '就業規則改定案へのコメント', date: '10/14 15:02', attachments: ['就業規則_コメント入り.docx'], summary: '改定案第18条（休職）に関する修正コメント。来週の打合せ希望。' },
  { id: 'M05', fromName: 'info@unknown-corp.example', from: 'info@unknown-corp.example', subject: '顧問契約についてのご相談', date: '10/14 11:20', attachments: [], summary: '新規の顧問契約に関する問合せ。従業員約30名。' },
  { id: 'M06', fromName: '空野（ソラ物流）', from: 'sorano@sora-logi.example', subject: '9月分 給与明細の再発行依頼', date: '10/13 17:45', attachments: [], summary: '従業員1名分の9月給与明細の再発行依頼。' }
];

export const PAYROLL_STEPS = [
  { key: 'receive', label: '勤怠データ受領', tool: 'Outlook / 共有サイト' },
  { key: 'convert', label: '弥生取込用CSVへ変換', tool: 'Power Automate Desktop' },
  { key: 'import', label: '弥生給与へ取込', tool: '弥生給与 / Next' },
  { key: 'check', label: '前月比チェック', tool: '自動チェック' },
  { key: 'approve', label: '顧問先承認', tool: '共有サイト' },
  { key: 'publish', label: '明細・帳票の共有', tool: '共有サイト' }
];

export const defaultPayroll = {
  C001: 1, C002: 3, C003: 0, C004: 2, C005: 4, C006: 0, C007: 1, C008: 6
};

export const payrollVariance = [
  { emp: '1001 青木 一郎', prev: 312000, curr: 318500 },
  { emp: '1002 石井 花子', prev: 248000, curr: 251200 },
  { emp: '1005 上田 健', prev: 285000, curr: 362400 },
  { emp: '1008 遠藤 美咲', prev: 226000, curr: 226000 },
  { emp: '1011 大野 翔', prev: 301000, curr: 188000 },
  { emp: '1014 加藤 陽子', prev: 264500, curr: 270100 }
];
