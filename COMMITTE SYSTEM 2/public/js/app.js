/* ============================================================
   MONEY COMMITTEE SYSTEM — Main Application
   ============================================================ */

let currentPage = 'landing';
let currentUser = null;
let allMembers = [];
let allCommittees = [];
let currentCommitteeId = null;
let allPaymentsData = [];
let allPayoutsData = [];
let darkMode = false;

// ===================== INITIALIZATION =====================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  showPage('landing');
  initScrollEffects();
});

// ===================== THEME =====================
function initTheme() {
  darkMode = localStorage.getItem('mcs-theme') === 'dark';
  applyTheme();
}
function toggleTheme() {
  darkMode = !darkMode;
  localStorage.setItem('mcs-theme', darkMode ? 'dark' : 'light');
  applyTheme();
}
function applyTheme() {
  document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) btn.textContent = darkMode ? '☀️' : '🌙';
  const landBtn = document.getElementById('landing-theme-btn');
  if (landBtn) landBtn.textContent = darkMode ? '☀️' : '🌙';
}

// ===================== NAVIGATION =====================
function showPage(page, data) {
  currentPage = page;
  document.querySelectorAll('.view-page').forEach(p => p.classList.add('hidden'));
  const target = document.getElementById('page-' + page);
  if (target) { target.classList.remove('hidden'); }

  // Show/hide app shell vs landing/auth
  const appShell = document.getElementById('app-shell');
  const landingPage = document.getElementById('page-landing');
  const authPage = document.getElementById('page-auth');

  if (['landing'].includes(page)) {
    if (appShell) appShell.classList.add('hidden');
    if (landingPage) landingPage.classList.remove('hidden');
  } else if (['auth', 'signup', 'forgot-password'].includes(page)) {
    if (appShell) appShell.classList.add('hidden');
  } else {
    if (appShell) appShell.classList.remove('hidden');
    if (landingPage) landingPage.classList.add('hidden');
    updateActiveNav(page);
    updateBreadcrumb(page);
  }

  // Page-specific init
  switch (page) {
    case 'admin-dashboard': loadAdminDashboard(); break;
    case 'member-dashboard': loadMemberDashboard(); break;
    case 'members': loadMembers(); break;
    case 'committees': loadCommittees(); break;
    case 'committee-detail': openCommitteeDetail(data); break;
    case 'payments': loadPaymentsPage(); break;
    case 'transactions': loadTransactions(); break;
    case 'reports': loadReports(); break;
    case 'notifications': loadNotificationsPage(); break;
    case 'settings': initSettings(); break;
    case 'profile': loadProfile(); break;
  }

  // Scroll to top
  window.scrollTo(0, 0);
  closeMobileSidebar();
}

function updateActiveNav(page) {
  document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
  const link = document.querySelector(`.nav-link[data-page="${page}"]`);
  if (link) link.classList.add('active');
}

function updateBreadcrumb(page) {
  const bc = document.getElementById('breadcrumb');
  if (!bc) return;
  const names = {
    'admin-dashboard': 'Dashboard', 'member-dashboard': 'Dashboard',
    'members': 'Members', 'committees': 'Committees', 'committee-detail': 'Committee Details',
    'payments': 'Payments', 'transactions': 'Transactions', 'reports': 'Reports & Analytics',
    'notifications': 'Notifications', 'settings': 'Settings', 'profile': 'Profile'
  };
  bc.innerHTML = `<span>Home</span> <span>/</span> <span class="current">${names[page] || page}</span>`;
}

// ===================== AUTH =====================
function showAuth(role) {
  document.getElementById('auth-role-input').value = role || 'admin';
  showPage('auth');
  const title = document.getElementById('auth-title');
  if (title) title.textContent = role === 'member' ? 'Member Login' : 'Admin Login';
}

function handleLogin(e) {
  if (e) e.preventDefault();
  const role = document.getElementById('auth-role-input').value;
  const email = document.getElementById('login-email').value;
  const pass = document.getElementById('login-password').value;
  if (!email || !pass) { showToast('Please fill all fields', 'error'); return; }

  // Show loading
  const btn = document.getElementById('login-btn');
  btn.innerHTML = '<span class="spinner"></span> Signing in...';
  btn.disabled = true;

  setTimeout(() => {
    currentUser = {
      name: role === 'admin' ? 'Admin User' : 'Ahmad Ali',
      email: email,
      role: role,
      avatar: role === 'admin' ? 'AU' : 'AA'
    };
    btn.innerHTML = 'Sign In';
    btn.disabled = false;
    updateUserUI();
    showToast('Welcome back, ' + currentUser.name + '!', 'success');
    showPage(role === 'admin' ? 'admin-dashboard' : 'member-dashboard');
  }, 1200);
}

function handleSignup(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const pass = document.getElementById('signup-password').value;
  if (!name || !email || !pass) { showToast('Please fill all fields', 'error'); return; }
  showToast('Account created! Please log in.', 'success');
  showAuth('member');
}

function logout() {
  currentUser = null;
  showToast('Logged out successfully', 'info');
  showPage('landing');
  closeDropdowns();
}

function updateUserUI() {
  if (!currentUser) return;
  const nameEl = document.getElementById('user-display-name');
  const roleEl = document.getElementById('user-display-role');
  const avatarEl = document.getElementById('navbar-avatar');
  const sideNameEl = document.getElementById('sidebar-user-name');
  const sideRoleEl = document.getElementById('sidebar-user-role');
  const sideAvatarEl = document.getElementById('sidebar-avatar');

  if (nameEl) nameEl.textContent = currentUser.name;
  if (roleEl) roleEl.textContent = currentUser.role === 'admin' ? 'Administrator' : 'Member';
  if (avatarEl) avatarEl.textContent = currentUser.avatar;
  if (sideNameEl) sideNameEl.textContent = currentUser.name;
  if (sideRoleEl) sideRoleEl.textContent = currentUser.role === 'admin' ? 'Administrator' : 'Member';
  if (sideAvatarEl) sideAvatarEl.textContent = currentUser.avatar;

  // Show/hide admin-only nav items
  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = currentUser.role === 'admin' ? '' : 'none';
  });
}

// ===================== ADMIN DASHBOARD =====================
async function loadAdminDashboard() {
  const data = await api('GET', '/api/dashboard');
  const d = data || { totalMembers: 8, totalCommittees: 3, activeCommittees: 2, totalCollected: 287000, pendingPayments: 12, pendingPayouts: 4 };

  animateCounter('dash-members', d.totalMembers);
  animateCounter('dash-committees', d.activeCommittees);
  animateCounter('dash-pending', d.pendingPayments);
  document.getElementById('dash-revenue').textContent = formatCurrency(d.totalCollected);

  // Render activity timeline
  const timeline = document.getElementById('activity-timeline');
  if (timeline) {
    timeline.innerHTML = DEMO.activities.map(a => `
      <div class="timeline-item"><div class="t-time">${a.time}</div><div class="t-text">${a.text}</div></div>
    `).join('');
  }

  // Render recent transactions
  const tbody = document.getElementById('recent-transactions-tbody');
  if (tbody) {
    tbody.innerHTML = DEMO.transactions.slice(0, 5).map(t => `
      <tr>
        <td><div class="flex items-center gap-2"><div class="avatar sm">${getInitials(t.member)}</div><strong>${t.member}</strong></div></td>
        <td class="text-muted">${t.committee}</td>
        <td class="amount">${formatCurrency(t.amount)}</td>
        <td><span class="badge badge-${t.status === 'completed' ? 'success' : t.status === 'pending' ? 'warning' : 'danger'}">${t.status}</span></td>
        <td class="text-muted">${formatDate(t.date)}</td>
      </tr>
    `).join('');
  }

  // Charts
  setTimeout(() => {
    initChart('chart-collection', 'bar', getMonthlyCollectionData());
    initChart('chart-status', 'doughnut', getCommitteeStatusData());
  }, 200);
}

// ===================== MEMBER DASHBOARD =====================
function loadMemberDashboard() {
  // Use demo data for member view
  document.getElementById('member-welcome').textContent = currentUser ? currentUser.name : 'Member';

  setTimeout(() => {
    initChart('member-chart', 'area', {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      data: [5000, 5000, 5000, 5000, 5000]
    });
  }, 200);
}

// ===================== MEMBERS PAGE =====================
async function loadMembers() {
  const data = await api('GET', '/api/members');
  allMembers = data || [...DEMO.members];
  renderMembers();
}

function renderMembers(filter = '') {
  const tbody = document.getElementById('members-tbody');
  if (!tbody) return;
  let list = allMembers;
  if (filter) list = list.filter(m => m.name.toLowerCase().includes(filter.toLowerCase()) || m.phone.includes(filter));

  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">👥</div><h3>No members found</h3><p>Add your first committee member to get started</p></div></td></tr>';
    return;
  }
  tbody.innerHTML = list.map((m, i) => `
    <tr>
      <td><div class="flex items-center gap-3"><div class="avatar sm">${getInitials(m.name)}</div><div><strong>${m.name}</strong><div class="text-muted" style="font-size:11px">${m.email || ''}</div></div></div></td>
      <td class="font-mono">${m.phone}</td>
      <td class="text-muted font-mono" style="font-size:12px">${m.cnic || '—'}</td>
      <td><span class="badge badge-${m.status === 'active' ? 'success' : 'warning'}">${m.status || 'active'}</span></td>
      <td class="text-muted">${formatDate(m.createdAt)}</td>
      <td>
        <div class="flex gap-2">
          <button class="btn btn-sm btn-ghost" onclick="editMemberModal('${m._id}')">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="deleteMember('${m._id}')">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function searchMembers(val) { renderMembers(val); }

function openMemberModal() {
  document.getElementById('member-modal').classList.add('open');
  document.getElementById('member-form-alert').innerHTML = '';
  ['member-name', 'member-phone', 'member-cnic', 'member-email'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
}
function closeMemberModal() { document.getElementById('member-modal').classList.remove('open'); }

async function saveMember() {
  const name = document.getElementById('member-name').value.trim();
  const phone = document.getElementById('member-phone').value.trim();
  if (!name || !phone) { document.getElementById('member-form-alert').innerHTML = '<div class="alert alert-error">⚠️ Name and phone are required</div>'; return; }
  const body = { name, phone, cnic: document.getElementById('member-cnic').value, email: document.getElementById('member-email').value };
  const res = await api('POST', '/api/members', body);
  if (res && res._id) { allMembers.unshift(res); }
  else { allMembers.unshift({ ...body, _id: generateId(), status: 'active', createdAt: new Date().toISOString() }); }
  renderMembers();
  closeMemberModal();
  showToast('Member added successfully!', 'success');
}

async function deleteMember(id) {
  if (!confirm('Are you sure you want to delete this member?')) return;
  await api('DELETE', '/api/members/' + id);
  allMembers = allMembers.filter(m => m._id !== id);
  renderMembers();
  showToast('Member deleted', 'info');
}

function editMemberModal(id) { showToast('Edit feature — coming soon', 'info'); }

// ===================== COMMITTEES =====================
async function loadCommittees() {
  const data = await api('GET', '/api/committees');
  allCommittees = data || [...DEMO.committees];
  renderCommittees();
  document.getElementById('committee-list-view').style.display = '';
  document.getElementById('committee-detail-view').style.display = 'none';
}

function renderCommittees() {
  const grid = document.getElementById('committee-grid');
  if (!grid) return;
  if (!allCommittees.length) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🏦</div><h3>No committees yet</h3><p>Create your first savings committee</p></div>';
    return;
  }
  grid.innerHTML = allCommittees.map(c => {
    const taken = c.members.filter(m => m.hasTaken).length;
    const pct = Math.round((taken / c.totalMembers) * 100);
    const total = c.monthlyAmount * c.totalMembers;
    const statusClass = c.status === 'active' ? 'success' : c.status === 'completed' ? 'info' : 'warning';
    return `
      <div class="committee-card" onclick="showPage('committees'); openCommitteeDetail('${c._id}')">
        <div class="flex justify-between items-center mb-2">
          <h3>${c.name}</h3>
          <span class="badge badge-${statusClass}">${c.status.toUpperCase()}</span>
        </div>
        <div class="committee-meta">
          <div class="meta-pill">👥 <span>${c.totalMembers}</span> Members</div>
          <div class="meta-pill">💰 <span>${formatCurrency(c.monthlyAmount)}</span>/mo</div>
          <div class="meta-pill">📅 <span>${formatDate(c.startDate)}</span></div>
        </div>
        <div class="progress-wrap">
          <div class="progress-labels"><span>Progress</span><span>${taken}/${c.totalMembers} payouts</span></div>
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        </div>
      </div>`;
  }).join('');
}

function openCommitteeDetail(id) {
  currentCommitteeId = id;
  const c = allCommittees.find(x => x._id === id);
  if (!c) return;

  document.getElementById('committee-list-view').style.display = 'none';
  document.getElementById('committee-detail-view').style.display = '';

  const total = c.monthlyAmount * c.totalMembers;
  const taken = c.members.filter(m => m.hasTaken).length;
  const statusClass = c.status === 'active' ? 'success' : c.status === 'completed' ? 'info' : 'warning';

  document.getElementById('detail-title').textContent = c.name;
  document.getElementById('detail-subtitle').textContent = `Started: ${formatDate(c.startDate)} · ${c.totalMembers} Members · ${formatCurrency(c.monthlyAmount)}/mo`;
  document.getElementById('detail-status').innerHTML = `<span class="badge badge-${statusClass}">${c.status.toUpperCase()}</span>`;

  document.getElementById('detail-stats-grid').innerHTML = `
    <div class="stat-card"><div class="stat-icon" style="background:var(--primary-100);color:var(--primary)">💰</div><div class="stat-label">Monthly Amount</div><div class="stat-value" style="font-size:1.5rem">${formatCurrency(c.monthlyAmount)}</div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--warning-100);color:var(--warning)">🏆</div><div class="stat-label">Total Payout</div><div class="stat-value" style="font-size:1.5rem">${formatCurrency(total)}</div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--accent-100);color:var(--accent)">📅</div><div class="stat-label">Duration</div><div class="stat-value" style="font-size:1.5rem">${c.totalMembers} Months</div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--success-100);color:var(--success)">✅</div><div class="stat-label">Paid Out</div><div class="stat-value" style="font-size:1.5rem">${taken}/${c.totalMembers}</div></div>
  `;

  // Members table
  const start = new Date(c.startDate);
  document.getElementById('detail-members-table').innerHTML = c.members.map(m => {
    const td = new Date(start); td.setMonth(td.getMonth() + (m.turnMonth - 1));
    return `<tr>
      <td><span class="badge badge-primary">${m.turnMonth}</span></td>
      <td><div class="flex items-center gap-2"><div class="avatar sm">${getInitials(m.memberName)}</div><strong>${m.memberName}</strong></div></td>
      <td class="font-mono">${MONTHS[td.getMonth() + 1]} ${td.getFullYear()}</td>
      <td class="amount">${formatCurrency(total)}</td>
      <td>${m.hasTaken ? '<span class="badge badge-success">✅ Received</span>' : '<span class="badge badge-warning">⏳ Waiting</span>'}</td>
    </tr>`;
  }).join('');

  switchDetailTab('detail-tab-members');
}

function showCommitteeList() {
  document.getElementById('committee-list-view').style.display = '';
  document.getElementById('committee-detail-view').style.display = 'none';
}

function switchDetailTab(tabId) {
  document.querySelectorAll('.detail-tab-content').forEach(t => t.style.display = 'none');
  document.querySelectorAll('.detail-tab-btn').forEach(t => t.classList.remove('active'));
  document.getElementById(tabId).style.display = '';
  document.querySelectorAll('.detail-tab-btn').forEach(t => {
    if (t.getAttribute('onclick') && t.getAttribute('onclick').includes(tabId)) t.classList.add('active');
  });
}

function openCommitteeModal() {
  if (!allMembers.length) loadMembers();
  document.getElementById('committee-modal').classList.add('open');
  document.getElementById('committee-form-alert').innerHTML = '';
  document.getElementById('c-start').value = new Date().toISOString().split('T')[0];
  document.getElementById('member-slots').innerHTML = '<p class="text-muted" style="font-size:13px">Enter number of members first</p>';
}
function closeCommitteeModal() { document.getElementById('committee-modal').classList.remove('open'); }

function generateMemberSlots() {
  const count = parseInt(document.getElementById('c-total-members').value);
  if (!count || count < 2) return;
  const container = document.getElementById('member-slots');
  container.innerHTML = '';
  for (let i = 1; i <= count; i++) {
    container.innerHTML += `
      <div style="background:var(--bg-tertiary);border:1px solid var(--border-color);border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:6px">
        <label class="form-label" style="margin:0;font-size:11px">Turn ${i}</label>
        <select class="form-select" id="slot-${i}" style="padding:8px">
          <option value="">— Select —</option>
          ${allMembers.map(m => `<option value="${m._id}" data-name="${m.name}">${m.name}</option>`).join('')}
        </select>
      </div>`;
  }
}

async function saveCommittee() {
  const name = document.getElementById('c-name').value.trim();
  const amount = parseFloat(document.getElementById('c-amount').value);
  const count = parseInt(document.getElementById('c-total-members').value);
  const startDate = document.getElementById('c-start').value;
  if (!name || !amount || !count || !startDate) { document.getElementById('committee-form-alert').innerHTML = '<div class="alert alert-error">⚠️ All fields required</div>'; return; }
  const members = [];
  for (let i = 1; i <= count; i++) {
    const sel = document.getElementById('slot-' + i);
    if (!sel || !sel.value) { document.getElementById('committee-form-alert').innerHTML = `<div class="alert alert-error">⚠️ Select member for Turn ${i}</div>`; return; }
    members.push({ memberId: sel.value, memberName: sel.options[sel.selectedIndex].dataset.name, turnMonth: i, hasTaken: false });
  }
  const body = { name, monthlyAmount: amount, totalMembers: count, startDate, members };
  const res = await api('POST', '/api/committees', body);
  if (res && res._id) allCommittees.unshift(res);
  else allCommittees.unshift({ ...body, _id: generateId(), status: 'active', createdAt: new Date().toISOString() });
  renderCommittees();
  closeCommitteeModal();
  showToast('Committee created!', 'success');
}

// ===================== PAYMENTS PAGE =====================
function loadPaymentsPage() {
  const tbody = document.getElementById('payments-tbody');
  if (!tbody) return;
  const txns = DEMO.transactions;
  tbody.innerHTML = txns.map(t => `
    <tr>
      <td><div class="flex items-center gap-2"><div class="avatar sm">${getInitials(t.member)}</div><strong>${t.member}</strong></div></td>
      <td class="text-muted">${t.committee}</td>
      <td class="amount">${formatCurrency(t.amount)}</td>
      <td><span class="badge badge-${t.type === 'payout' ? 'info' : 'primary'}">${t.type}</span></td>
      <td><span class="badge badge-${t.status === 'completed' ? 'success' : t.status === 'pending' ? 'warning' : 'danger'}">${t.status}</span></td>
      <td class="text-muted">${t.method}</td>
      <td class="text-muted">${formatDate(t.date)}</td>
    </tr>
  `).join('');
}

// ===================== TRANSACTIONS =====================
function loadTransactions() { loadPaymentsPage(); }

// ===================== REPORTS =====================
function loadReports() {
  setTimeout(() => {
    initChart('report-chart-1', 'line', getMonthlyCollectionData());
    initChart('report-chart-2', 'doughnut', getPaymentStatusData());
    initChart('report-chart-3', 'bar', { labels: ['Q1', 'Q2', 'Q3', 'Q4'], data: [145000, 183000, 167000, 210000] });
  }, 200);
}

// ===================== NOTIFICATIONS =====================
function loadNotificationsPage() {
  const container = document.getElementById('notif-list');
  if (!container) return;
  container.innerHTML = DEMO.notifications.map(n => `
    <div class="notif-item">
      <div class="notif-icon" style="background:${n.bg}">${n.icon}</div>
      <div style="flex:1"><div class="notif-text">${n.text}</div><div class="notif-time">${n.time}</div></div>
      <button class="btn btn-sm btn-ghost">✕</button>
    </div>
  `).join('');
}

// ===================== SETTINGS =====================
function initSettings() {
  const toggle = document.getElementById('settings-dark-toggle');
  if (toggle) toggle.checked = darkMode;
}

// ===================== PROFILE =====================
function loadProfile() {
  if (!currentUser) return;
  const nameEl = document.getElementById('profile-name');
  const emailEl = document.getElementById('profile-email');
  const avatarEl = document.getElementById('profile-avatar');
  if (nameEl) nameEl.textContent = currentUser.name;
  if (emailEl) emailEl.textContent = currentUser.email;
  if (avatarEl) avatarEl.textContent = currentUser.avatar;
}

// ===================== TOAST SYSTEM =====================
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) { container = document.createElement('div'); container.id = 'toast-container'; container.className = 'toast-container'; document.body.appendChild(container); }
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100px)'; toast.style.transition = 'all 0.3s'; setTimeout(() => toast.remove(), 300); }, 3500);
}

// ===================== COUNTER ANIMATION =====================
function animateCounter(elementId, target) {
  const el = document.getElementById(elementId);
  if (!el) return;
  let current = 0;
  const step = Math.max(1, Math.ceil(target / 40));
  const interval = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(interval); }
    el.textContent = current.toLocaleString();
  }, 30);
}

// ===================== MOBILE SIDEBAR =====================
function toggleMobileSidebar() {
  document.getElementById('app-sidebar').classList.toggle('open');
  document.getElementById('sidebar-overlay').classList.toggle('show');
}
function closeMobileSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('show');
}

// ===================== NOTIFICATIONS DROPDOWN =====================
function toggleNotifPanel() {
  const panel = document.getElementById('notif-dropdown');
  if (panel) panel.classList.toggle('show');
}

// ===================== PROFILE DROPDOWN =====================
function toggleProfileDropdown() {
  const dd = document.getElementById('profile-dropdown');
  if (dd) dd.classList.toggle('show');
}
function closeDropdowns() {
  document.querySelectorAll('.dropdown-menu, .notif-panel').forEach(d => d.classList.remove('show'));
}

// Close dropdowns on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('.dropdown') && !e.target.closest('.notif-panel')) closeDropdowns();
});

// ===================== PASSWORD TOGGLE =====================
function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
}

// ===================== FAQ TOGGLE =====================
function toggleFaq(el) {
  const item = el.closest('.faq-item');
  item.classList.toggle('open');
}

// ===================== LANDING SCROLL =====================
function initScrollEffects() {
  window.addEventListener('scroll', () => {
    const nav = document.querySelector('.landing-nav');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
  });
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// ===================== PAYMENT MODAL =====================
function openPaymentModal() {
  showToast('Payment gateway — coming soon!', 'info');
}

// ===================== EXPORT =====================
function exportReport() {
  showToast('Report exported as PDF', 'success');
}
