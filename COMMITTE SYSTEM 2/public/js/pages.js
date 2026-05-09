/* ============================================================
   MONEY COMMITTEE SYSTEM — Dynamic Page Renderer
   All dashboard pages are rendered into #app-main-content
   ============================================================ */

// Page templates registry
const PAGE_TEMPLATES = {
  'admin-dashboard': renderAdminDashboard,
  'member-dashboard': renderMemberDashboard,
  'members': renderMembersPage,
  'committees': renderCommitteesPage,
  'payments': renderPaymentsPage,
  'transactions': renderTransactionsPage,
  'reports': renderReportsPage,
  'notifications': renderNotificationsPage,
  'settings': renderSettingsPage,
  'profile': renderProfilePage,
};

// Override showPage to inject page HTML
const _origShowPage = showPage;
showPage = function(page, data) {
  // Render page template into main content area
  const renderer = PAGE_TEMPLATES[page];
  const container = document.getElementById('app-main-content');
  if (renderer && container) {
    container.innerHTML = renderer(data);
    container.className = 'app-main animate-fadeIn';
  }
  _origShowPage(page, data);

  // Populate navbar notifications
  const navNotif = document.getElementById('navbar-notif-list');
  if (navNotif && !navNotif.innerHTML.trim()) {
    navNotif.innerHTML = DEMO.notifications.slice(0, 4).map(n =>
      `<div class="notif-item"><div class="notif-icon" style="background:${n.bg}">${n.icon}</div><div style="flex:1"><div class="notif-text">${n.text}</div><div class="notif-time">${n.time}</div></div></div>`
    ).join('');
  }
};

/* ========== ADMIN DASHBOARD ========== */
function renderAdminDashboard() {
  return `
  <div class="page-header"><div class="page-header-left"><h1 class="page-title">Dashboard</h1><p class="page-subtitle">Welcome back! Here's your committee overview</p></div>
    <div class="page-actions"><button class="btn btn-outline btn-sm" onclick="exportReport()">📥 Export</button><button class="btn btn-primary btn-sm" onclick="openCommitteeModal()">+ New Committee</button></div></div>

  <div class="stats-grid stagger">
    <div class="stat-card"><div class="stat-icon" style="background:var(--primary-100);color:var(--primary)">👥</div><div class="stat-label">Total Members</div><div class="stat-value" id="dash-members">0</div><div class="stat-change positive">↑ 12% this month</div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--secondary-100);color:var(--secondary)">🏦</div><div class="stat-label">Active Committees</div><div class="stat-value" id="dash-committees">0</div><div class="stat-change positive">↑ 2 new</div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--warning-100);color:var(--warning)">⏳</div><div class="stat-label">Pending Payments</div><div class="stat-value" id="dash-pending">0</div><div class="stat-change negative">↓ 5 from last month</div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--accent-100);color:var(--accent)">💰</div><div class="stat-label">Total Revenue</div><div class="stat-value" id="dash-revenue">PKR 0</div><div class="stat-change positive">↑ 18.2%</div></div>
  </div>

  <div class="grid-2" style="margin-bottom:24px">
    <div class="chart-card"><div class="chart-header"><span class="chart-title">Monthly Collection</span><select class="form-select" style="width:auto;padding:6px 10px;font-size:12px"><option>2025</option><option>2024</option></select></div><div class="chart-canvas-wrap"><canvas id="chart-collection"></canvas></div></div>
    <div class="chart-card"><div class="chart-header"><span class="chart-title">Committee Status</span></div><div class="chart-canvas-wrap" style="height:220px"><canvas id="chart-status"></canvas></div></div>
  </div>

  <div class="grid-2">
    <div class="card"><h3 class="font-display fw-700 mb-4" style="font-size:15px">📋 Recent Transactions</h3>
      <div class="table-wrap"><table><thead><tr><th>Member</th><th>Committee</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody id="recent-transactions-tbody"><tr><td colspan="5" class="text-center text-muted" style="padding:30px">Loading...</td></tr></tbody></table></div></div>
    <div class="card"><h3 class="font-display fw-700 mb-4" style="font-size:15px">🕐 Recent Activity</h3>
      <div class="timeline" id="activity-timeline"></div></div>
  </div>`;
}

/* ========== MEMBER DASHBOARD ========== */
function renderMemberDashboard() {
  return `
  <div class="page-header"><div><h1 class="page-title">Welcome, <span id="member-welcome">Member</span>!</h1><p class="page-subtitle">Your committee savings overview</p></div></div>

  <div class="stats-grid stagger">
    <div class="stat-card"><div class="stat-icon" style="background:var(--primary-100);color:var(--primary)">🏦</div><div class="stat-label">Active Committees</div><div class="stat-value">2</div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--secondary-100);color:var(--secondary)">💰</div><div class="stat-label">Monthly Contribution</div><div class="stat-value" style="font-size:1.5rem">PKR 15,000</div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--warning-100);color:var(--warning)">📅</div><div class="stat-label">Next Payout</div><div class="stat-value" style="font-size:1.3rem">Jul 2025</div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--accent-100);color:var(--accent)">📊</div><div class="stat-label">Total Paid</div><div class="stat-value" style="font-size:1.5rem">PKR 45,000</div></div>
  </div>

  <div class="grid-2">
    <div class="card">
      <h3 class="font-display fw-700 mb-4" style="font-size:15px">🏦 My Committees</h3>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="padding:16px;border:1px solid var(--border-color);border-radius:12px;cursor:pointer" onclick="showPage('committees')">
          <div class="flex justify-between items-center"><strong>Family Committee 2025</strong><span class="badge badge-success">ACTIVE</span></div>
          <div style="margin-top:8px;font-size:13px;color:var(--text-tertiary)">PKR 5,000/mo · Turn #3 · 5 Members</div>
          <div class="progress-wrap"><div class="progress-labels"><span>Progress</span><span>2/5</span></div><div class="progress-bar"><div class="progress-fill" style="width:40%"></div></div></div>
        </div>
        <div style="padding:16px;border:1px solid var(--border-color);border-radius:12px;cursor:pointer" onclick="showPage('committees')">
          <div class="flex justify-between items-center"><strong>Office Staff Pool</strong><span class="badge badge-success">ACTIVE</span></div>
          <div style="margin-top:8px;font-size:13px;color:var(--text-tertiary)">PKR 10,000/mo · Turn #1 · 8 Members</div>
          <div class="progress-wrap"><div class="progress-labels"><span>Progress</span><span>1/8</span></div><div class="progress-bar"><div class="progress-fill" style="width:12.5%"></div></div></div>
        </div>
      </div>
    </div>
    <div class="chart-card"><div class="chart-header"><span class="chart-title">My Payment History</span></div><div class="chart-canvas-wrap" style="height:200px"><canvas id="member-chart"></canvas></div></div>
  </div>`;
}

/* ========== MEMBERS PAGE ========== */
function renderMembersPage() {
  return `
  <div class="page-header"><div><h1 class="page-title">Members</h1><p class="page-subtitle">Manage all committee participants</p></div>
    <div class="page-actions"><div class="search-box"><span class="search-icon">🔍</span><input type="text" placeholder="Search members..." oninput="searchMembers(this.value)"></div><button class="btn btn-primary" onclick="openMemberModal()">+ Add Member</button></div></div>
  <div class="card"><div class="table-wrap"><table><thead><tr><th>Member</th><th>Phone</th><th>CNIC</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
    <tbody id="members-tbody"><tr><td colspan="6"><div class="empty-state"><div class="empty-icon">👥</div><h3>Loading members...</h3></div></td></tr></tbody></table></div></div>`;
}

/* ========== COMMITTEES PAGE ========== */
function renderCommitteesPage() {
  return `
  <div id="committee-list-view">
    <div class="page-header"><div><h1 class="page-title">Committees</h1><p class="page-subtitle">All savings committees</p></div>
      <div class="page-actions"><button class="btn btn-primary" onclick="openCommitteeModal()">+ New Committee</button></div></div>
    <div class="committee-grid" id="committee-grid"></div>
  </div>
  <div id="committee-detail-view" style="display:none">
    <button class="btn btn-ghost mb-4" onclick="showCommitteeList()">← Back to Committees</button>
    <div class="page-header"><div><h1 class="page-title" id="detail-title">—</h1><p class="page-subtitle" id="detail-subtitle">—</p></div><div id="detail-status"></div></div>
    <div class="stats-grid" id="detail-stats-grid"></div>
    <div class="tabs">
      <button class="detail-tab-btn tab-btn active" onclick="switchDetailTab('detail-tab-members')">👥 Members & Turns</button>
      <button class="detail-tab-btn tab-btn" onclick="switchDetailTab('detail-tab-payments')">💳 Payments</button>
      <button class="detail-tab-btn tab-btn" onclick="switchDetailTab('detail-tab-payouts')">💰 Payouts</button>
    </div>
    <div id="detail-tab-members" class="detail-tab-content"><div class="card"><div class="table-wrap"><table><thead><tr><th>Turn</th><th>Member</th><th>Month</th><th>Payout</th><th>Status</th></tr></thead><tbody id="detail-members-table"></tbody></table></div></div></div>
    <div id="detail-tab-payments" class="detail-tab-content" style="display:none"><div class="card"><p class="text-muted text-center" style="padding:40px">Payment tracking data will appear here</p></div></div>
    <div id="detail-tab-payouts" class="detail-tab-content" style="display:none"><div class="card"><p class="text-muted text-center" style="padding:40px">Payout tracking data will appear here</p></div></div>
  </div>`;
}

/* ========== PAYMENTS PAGE ========== */
function renderPaymentsPage() {
  return `
  <div class="page-header"><div><h1 class="page-title">Payments</h1><p class="page-subtitle">Track all payment records</p></div>
    <div class="page-actions"><button class="btn btn-outline btn-sm" onclick="exportReport()">📥 Export</button><button class="btn btn-primary btn-sm" onclick="openPaymentModal()">+ Record Payment</button></div></div>
  
  <div class="stats-grid stagger" style="grid-template-columns:repeat(3,1fr)">
    <div class="stat-card"><div class="stat-icon" style="background:var(--success-100);color:var(--success)">✅</div><div class="stat-label">Paid</div><div class="stat-value" style="color:var(--success)">65</div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--warning-100);color:var(--warning)">⏳</div><div class="stat-label">Pending</div><div class="stat-value" style="color:var(--warning)">28</div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--danger-100);color:var(--danger)">⚠️</div><div class="stat-label">Late</div><div class="stat-value" style="color:var(--danger)">7</div></div>
  </div>

  <div class="card"><div class="table-wrap"><table><thead><tr><th>Member</th><th>Committee</th><th>Amount</th><th>Type</th><th>Status</th><th>Method</th><th>Date</th></tr></thead>
    <tbody id="payments-tbody"><tr><td colspan="7" class="text-center text-muted" style="padding:40px">Loading...</td></tr></tbody></table></div></div>`;
}

/* ========== TRANSACTIONS PAGE ========== */
function renderTransactionsPage() {
  return renderPaymentsPage().replace('Payments</h1>', 'Transactions</h1>').replace('Track all payment records', 'Complete transaction history');
}

/* ========== REPORTS PAGE ========== */
function renderReportsPage() {
  return `
  <div class="page-header"><div><h1 class="page-title">Reports & Analytics</h1><p class="page-subtitle">Comprehensive financial insights</p></div>
    <div class="page-actions"><button class="btn btn-primary btn-sm" onclick="exportReport()">📥 Download PDF Report</button></div></div>
  
  <div class="stats-grid stagger">
    <div class="stat-card"><div class="stat-icon" style="background:var(--primary-100);color:var(--primary)">📊</div><div class="stat-label">Collection Rate</div><div class="stat-value">87%</div><div class="stat-change positive">↑ 5%</div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--secondary-100);color:var(--secondary)">✅</div><div class="stat-label">Completion Rate</div><div class="stat-value">33%</div><div class="stat-change positive">1/3 done</div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--accent-100);color:var(--accent)">💰</div><div class="stat-label">Total Managed</div><div class="stat-value" style="font-size:1.3rem">PKR 705K</div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--warning-100);color:var(--warning)">📈</div><div class="stat-label">Avg Committee Size</div><div class="stat-value">5.7</div><div class="stat-change positive">members</div></div>
  </div>

  <div class="grid-2" style="margin-bottom:24px">
    <div class="chart-card"><div class="chart-header"><span class="chart-title">Monthly Revenue Trend</span></div><div class="chart-canvas-wrap"><canvas id="report-chart-1"></canvas></div></div>
    <div class="chart-card"><div class="chart-header"><span class="chart-title">Payment Status Distribution</span></div><div class="chart-canvas-wrap" style="height:240px"><canvas id="report-chart-2"></canvas></div></div>
  </div>
  <div class="chart-card"><div class="chart-header"><span class="chart-title">Quarterly Revenue</span></div><div class="chart-canvas-wrap"><canvas id="report-chart-3"></canvas></div></div>`;
}

/* ========== NOTIFICATIONS PAGE ========== */
function renderNotificationsPage() {
  return `
  <div class="page-header"><div><h1 class="page-title">Notifications</h1><p class="page-subtitle">Stay updated with all activities</p></div>
    <div class="page-actions"><button class="btn btn-outline btn-sm" onclick="showToast('All marked as read','success')">✓ Mark All Read</button></div></div>
  <div class="card"><div id="notif-list" style="display:flex;flex-direction:column"></div></div>`;
}

/* ========== SETTINGS PAGE ========== */
function renderSettingsPage() {
  return `
  <div class="page-header"><div><h1 class="page-title">Settings</h1><p class="page-subtitle">Manage your preferences and system configuration</p></div></div>
  
  <div class="card mb-6">
    <div class="settings-section"><h3>🎨 Appearance</h3>
      <div class="setting-row"><div class="setting-info"><h4>Dark Mode</h4><p>Switch between light and dark themes</p></div><label class="toggle"><input type="checkbox" id="settings-dark-toggle" onchange="toggleTheme()"><span class="toggle-slider"></span></label></div>
      <div class="setting-row"><div class="setting-info"><h4>Compact View</h4><p>Reduce spacing for denser information display</p></div><label class="toggle"><input type="checkbox"><span class="toggle-slider"></span></label></div>
    </div>
  </div>

  <div class="card mb-6">
    <div class="settings-section"><h3>🔔 Notifications</h3>
      <div class="setting-row"><div class="setting-info"><h4>Payment Reminders</h4><p>Get notified when payments are due</p></div><label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label></div>
      <div class="setting-row"><div class="setting-info"><h4>Payout Alerts</h4><p>Receive alerts when payouts are distributed</p></div><label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label></div>
      <div class="setting-row"><div class="setting-info"><h4>Email Notifications</h4><p>Receive updates via email</p></div><label class="toggle"><input type="checkbox"><span class="toggle-slider"></span></label></div>
    </div>
  </div>

  <div class="card mb-6">
    <div class="settings-section"><h3>🔒 Security</h3>
      <div class="setting-row"><div class="setting-info"><h4>Two-Factor Authentication</h4><p>Add an extra layer of security to your account</p></div><button class="btn btn-outline btn-sm">Enable</button></div>
      <div class="setting-row"><div class="setting-info"><h4>Change Password</h4><p>Update your account password</p></div><button class="btn btn-outline btn-sm">Change</button></div>
      <div class="setting-row"><div class="setting-info"><h4>Active Sessions</h4><p>Manage your logged-in devices</p></div><button class="btn btn-outline btn-sm">View</button></div>
    </div>
  </div>

  <div class="card">
    <div class="settings-section"><h3>⚙️ System</h3>
      <div class="setting-row"><div class="setting-info"><h4>Currency</h4><p>Default currency for all transactions</p></div><select class="form-select" style="width:auto;padding:6px 12px;font-size:13px"><option>PKR — Pakistani Rupee</option><option>USD — US Dollar</option></select></div>
      <div class="setting-row"><div class="setting-info"><h4>Language</h4><p>Interface language</p></div><select class="form-select" style="width:auto;padding:6px 12px;font-size:13px"><option>English</option><option>Urdu</option></select></div>
      <div class="setting-row"><div class="setting-info"><h4>Data Export</h4><p>Download all your data</p></div><button class="btn btn-outline btn-sm" onclick="showToast('Data export started','success')">Export All</button></div>
    </div>
  </div>`;
}

/* ========== PROFILE PAGE ========== */
function renderProfilePage() {
  return `
  <div class="page-header"><div><h1 class="page-title">My Profile</h1><p class="page-subtitle">Manage your personal information</p></div></div>
  
  <div class="profile-header">
    <div class="avatar xxl" id="profile-avatar" style="position:relative;z-index:1;margin-top:20px">AU</div>
    <div class="profile-info">
      <h2 class="font-display fw-700" id="profile-name" style="font-size:20px">Admin User</h2>
      <p class="text-muted" id="profile-email" style="font-size:14px">admin@committee.pk</p>
      <div class="flex gap-3 mt-4"><span class="badge badge-primary">Administrator</span><span class="badge badge-success">Active</span></div>
    </div>
  </div>

  <div class="grid-2">
    <div class="card">
      <h3 class="font-display fw-700 mb-6" style="font-size:15px">Personal Information</h3>
      <div class="form-group"><label class="form-label">Full Name</label><input class="form-input" value="Admin User"></div>
      <div class="form-group"><label class="form-label">Email</label><input class="form-input" value="admin@committee.pk"></div>
      <div class="form-row"><div class="form-group"><label class="form-label">Phone</label><input class="form-input" value="0300-1234567"></div><div class="form-group"><label class="form-label">CNIC</label><input class="form-input" value="35201-1234567-1"></div></div>
      <div class="form-actions"><button class="btn btn-primary" onclick="showToast('Profile updated!','success')">Save Changes</button></div>
    </div>
    <div class="card">
      <h3 class="font-display fw-700 mb-6" style="font-size:15px">Change Password</h3>
      <div class="form-group"><label class="form-label">Current Password</label><input class="form-input" type="password" placeholder="••••••••"></div>
      <div class="form-group"><label class="form-label">New Password</label><input class="form-input" type="password" placeholder="Min 8 characters"></div>
      <div class="form-group"><label class="form-label">Confirm Password</label><input class="form-input" type="password" placeholder="Repeat new password"></div>
      <div class="form-actions"><button class="btn btn-primary" onclick="showToast('Password changed!','success')">Update Password</button></div>
    </div>
  </div>`;
}
