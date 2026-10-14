const clients = [
  {
    id: 'A-104',
    name: '株式会社A',
    type: '製造業',
    status: '進行中',
    lastUpdate: '2026-10-15',
    owner: '田中',
    risk: '高',
    progress: '72%',
    sharedDocs: ['公文書', '決定通知', '給与資料'],
    summary: '健康保険・厚生年金の変更対応と給与資料の確認を進めています。',
    details: {
      nextTask: '雇用保険適用事業所変更の再確認',
      due: '本日 17:00',
      files: ['雇用保険適用事業所変更.pdf', '健康保険・厚生年金保険料率通知.pdf', '給与明細一覧.xlsx'],
      access: ['社内スタッフ: 全権限', '顧問先担当: 閲覧のみ', '経理担当: ダウンロード可'],
      notes: ['本人確認のため、追加の申請書類が必要です。', '電子申請の保管先は社内共有フォルダに統一。']
    }
  },
  {
    id: 'B-221',
    name: '株式会社B',
    type: 'IT企業',
    status: '待機中',
    lastUpdate: '2026-10-14',
    owner: '山田',
    risk: '中',
    progress: '48%',
    sharedDocs: ['就業規則', '法定調書'],
    summary: '就業規則の更新と共有サイトの反映が待機中です。',
    details: {
      nextTask: '就業規則の更新内容確認',
      due: '明日 12:00',
      files: ['就業規則（更新版）.docx', '法定調書_2026Q3.pdf'],
      access: ['社内スタッフ: 全権限', '顧問先担当: 閲覧のみ'],
      notes: ['更新版の承認待ちです。', '公開前に担当者の確認が必要です。']
    }
  },
  {
    id: 'C-318',
    name: '株式会社C',
    type: '商社',
    status: '確認中',
    lastUpdate: '2026-10-13',
    owner: '佐藤',
    risk: '高',
    progress: '60%',
    sharedDocs: ['給与資料', '公文書'],
    summary: '給与計算関連の書類が確認待ちで、顧問先側への共有予定です。',
    details: {
      nextTask: '給与資料の整合確認',
      due: '2026-10-16',
      files: ['賃金改定通知.pdf', '賞与計算票.xlsx', '給与資料_2026年10月.pdf'],
      access: ['社内スタッフ: 全権限', '経理担当: ダウンロード可', '顧問先担当: 閲覧のみ'],
      notes: ['給与資料に不一致が見られるため、人手確認が必要。', '顧問先向け共有は確認後に実施。']
    }
  },
  {
    id: 'D-412',
    name: '株式会社D',
    type: '建設業',
    status: '進行中',
    lastUpdate: '2026-10-15',
    owner: '鈴木',
    risk: '低',
    progress: '83%',
    sharedDocs: ['労務管理', '申請書類'],
    summary: '電子申請の流れが定着しており、最後の整理作業だけ残っています。',
    details: {
      nextTask: '書類保存フォルダの最終確認',
      due: '2026-10-17',
      files: ['労働保険関係成立確認通知.pdf', '保険料通知.pdf'],
      access: ['社内スタッフ: 全権限', '顧問先担当: 閲覧のみ'],
      notes: ['保存名の統一が完了しており、公開作業を進行中。', '作業完了後に履歴ログを保存予定。']
    }
  }
];

const documents = [
  { client: '株式会社A', type: '公文書', date: '2026-10-15', owner: '田中', status: '処理中', share: '顧問先ポータル' },
  { client: '株式会社B', type: '決定通知', date: '2026-10-14', owner: '山田', status: '待機中', share: '社内のみ' },
  { client: '株式会社C', type: '給与資料', date: '2026-10-13', owner: '佐藤', status: '確認中', share: '顧問先ポータル' },
  { client: '株式会社D', type: '就業規則', date: '2026-10-12', owner: '鈴木', status: '処理中', share: '顧問先ポータル' },
  { client: '株式会社A', type: '申請書類', date: '2026-10-12', owner: '田中', status: '待機中', share: '社内のみ' },
  { client: '株式会社C', type: '法定調書', date: '2026-10-11', owner: '佐藤', status: '確認中', share: '顧問先ポータル' }
];

const uploadedFiles = [
  { name: '最終確認_雇用保険申請.pdf', client: '株式会社A', tag: '新規' },
  { name: '健康保険料率通知_2026_09.pdf', client: '株式会社A', tag: '保存済' },
  { name: '就業規則_更新版.docx', client: '株式会社B', tag: '確認中' }
];

const clientListEl = document.getElementById('client-list');
const clientDetailEl = document.getElementById('client-detail');
const documentTableBody = document.getElementById('document-table-body');
const uploadedFilesEl = document.getElementById('uploaded-files');
const dropZone = document.getElementById('drop-zone');
const modal = document.getElementById('client-modal');
const modalBody = document.getElementById('modal-body');
const addCaseBtn = document.getElementById('add-case-btn');

let selectedClientId = clients[0].id;
let selectedTab = 'overview';

function renderClientList(activeId = selectedClientId) {
  selectedClientId = activeId;
  clientListEl.innerHTML = clients
    .map((client) => {
      const isActive = client.id === activeId ? 'active' : '';
      return `
        <button class="client-card ${isActive}" type="button" data-client-id="${client.id}">
          <div class="client-main">
            <div class="client-badge">${client.name.slice(0, 2)}</div>
            <div>
              <div class="client-name">${client.name}</div>
              <div class="client-meta">${client.type} · ${client.owner}</div>
            </div>
          </div>
          <span class="status-tag ${client.status}">${client.status}</span>
        </button>
      `;
    })
    .join('');

  clientListEl.querySelectorAll('.client-card').forEach((card) => {
    card.addEventListener('click', () => {
      renderClientList(card.dataset.clientId);
      renderClientDetail(card.dataset.clientId, selectedTab);
    });
  });
}

function renderClientDetail(clientId = selectedClientId, tab = selectedTab) {
  const client = clients.find((item) => item.id === clientId) || clients[0];
  selectedClientId = client.id;
  selectedTab = tab;

  const tabHtml = `
    <div class="client-detail-tabs">
      <button class="client-detail-tab ${tab === 'overview' ? 'active' : ''}" data-tab="overview" type="button">概要</button>
      <button class="client-detail-tab ${tab === 'files' ? 'active' : ''}" data-tab="files" type="button">書類</button>
      <button class="client-detail-tab ${tab === 'access' ? 'active' : ''}" data-tab="access" type="button">アクセス権</button>
      <button class="client-detail-tab ${tab === 'notes' ? 'active' : ''}" data-tab="notes" type="button">コメント</button>
    </div>
  `;

  const overviewPanel = `
    <div class="tab-panel ${tab === 'overview' ? '' : 'hidden'}" data-tab-panel="overview">
      <div class="detail-header">
        <div>
          <small class="stat-label">${client.id}</small>
          <h3>${client.name}</h3>
        </div>
        <span class="status-tag ${client.status}">${client.status}</span>
      </div>
      <div class="compliance-grid">
        <div class="compliance-card">
          <span>進捗</span>
          <strong>${client.progress}</strong>
        </div>
        <div class="compliance-card">
          <span>リスク</span>
          <strong>${client.risk}</strong>
        </div>
        <div class="compliance-card">
          <span>最終更新</span>
          <strong>${client.lastUpdate}</strong>
        </div>
        <div class="compliance-card">
          <span>次回対応</span>
          <strong>${client.details.due}</strong>
        </div>
      </div>
      <div class="compliance-card">
        <span>概要</span>
        <strong style="font-size:1rem; display:block; line-height:1.7; color: var(--text);">${client.summary}</strong>
      </div>
      <div class="compliance-card">
        <span>次のアクション</span>
        <strong style="font-size:1rem; display:block; color: var(--text);">${client.details.nextTask}</strong>
      </div>
    </div>
  `;

  const filesPanel = `
    <div class="tab-panel ${tab === 'files' ? '' : 'hidden'}" data-tab-panel="files">
      <div class="compliance-card">
        <span>共有済み資料</span>
        <ul class="file-list">
          ${client.details.files.map((file) => `<li>${file}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;

  const accessPanel = `
    <div class="tab-panel ${tab === 'access' ? '' : 'hidden'}" data-tab-panel="access">
      <div class="compliance-card">
        <span>アクセス権設定</span>
        <ul class="file-list">
          ${client.details.access.map((line) => `<li>${line}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;

  const notesPanel = `
    <div class="tab-panel ${tab === 'notes' ? '' : 'hidden'}" data-tab-panel="notes">
      <div class="compliance-card">
        <span>コメント</span>
        <ul class="file-list">
          ${client.details.notes.map((line) => `<li>${line}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;

  clientDetailEl.innerHTML = `${tabHtml}${overviewPanel}${filesPanel}${accessPanel}${notesPanel}`;

  clientDetailEl.querySelectorAll('.client-detail-tab').forEach((button) => {
    button.addEventListener('click', () => {
      renderClientDetail(client.id, button.dataset.tab);
    });
  });
}

function renderDocumentTable(filter = 'all') {
  const rows = filter === 'all' ? documents : documents.filter((doc) => doc.status === filter);

  documentTableBody.innerHTML = rows
    .map(
      (doc) => `
        <tr>
          <td>${doc.client}</td>
          <td>${doc.type}</td>
          <td>${doc.date}</td>
          <td>${doc.owner}</td>
          <td><span class="status-tag ${doc.status}">${doc.status}</span></td>
          <td>${doc.share}</td>
        </tr>
      `
    )
    .join('');
}

function renderUploadedFiles() {
  uploadedFilesEl.innerHTML = uploadedFiles
    .map(
      (file) => `
        <div class="uploaded-file">
          <div class="uploaded-file-meta">
            <strong>${file.name}</strong>
            <small>${file.client}</small>
          </div>
          <span class="uploaded-file-tag">${file.tag}</span>
        </div>
      `
    )
    .join('');
}

function openClientModal(clientId) {
  const client = clients.find((item) => item.id === clientId) || clients[0];
  modalBody.innerHTML = `
    <div class="modal-summary">
      <div>
        <div class="stat-label">顧問先コード</div>
        <h4>${client.id}</h4>
      </div>
      <span class="status-tag ${client.status}">${client.status}</span>
    </div>
    <div class="modal-grid">
      <div class="compliance-card">
        <span>企業名</span>
        <strong>${client.name}</strong>
      </div>
      <div class="compliance-card">
        <span>業種</span>
        <strong>${client.type}</strong>
      </div>
      <div class="compliance-card">
        <span>担当者</span>
        <strong>${client.owner}</strong>
      </div>
      <div class="compliance-card">
        <span>進捗</span>
        <strong>${client.progress}</strong>
      </div>
    </div>
    <div class="modal-section">
      <h4>備考</h4>
      <p>${client.summary}</p>
    </div>
    <div class="modal-section">
      <h4>次のアクション</h4>
      <ul class="file-list">
        <li>${client.details.nextTask}</li>
        <li>期限: ${client.details.due}</li>
      </ul>
    </div>
  `;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeClientModal() {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

document.querySelectorAll('.filter-btn').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    renderDocumentTable(button.dataset.filter);
  });
});

['dragenter', 'dragover'].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.add('dragover');
  });
});

['dragleave', 'drop'].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.remove('dragover');
  });
});

dropZone.addEventListener('drop', (event) => {
  const incomingFiles = [...event.dataTransfer.files];
  incomingFiles.forEach((file) => {
    uploadedFiles.unshift({
      name: file.name,
      client: '株式会社A',
      tag: '新規'
    });
    documents.unshift({
      client: '株式会社A',
      type: '受領ファイル',
      date: new Date().toISOString().slice(0, 10),
      owner: '田中',
      status: '処理中',
      share: '顧問先ポータル'
    });
  });

  renderUploadedFiles();
  renderDocumentTable(document.querySelector('.filter-btn.active')?.dataset.filter || 'all');
});

renderClientList();
renderClientDetail(selectedClientId, selectedTab);
renderDocumentTable();
renderUploadedFiles();
