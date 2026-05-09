/* ============================================================
   MONEY COMMITTEE SYSTEM — API & Demo Data Layer
   ============================================================ */

const API_BASE = '';

// Demo data for when MongoDB is not connected
const DEMO = {
  members: [
    { _id: 'm1', name: 'Ahmad Ali', phone: '0301-1234567', cnic: '35201-1234567-1', email: 'ahmad@mail.com', status: 'active', createdAt: '2025-01-15' },
    { _id: 'm2', name: 'Sara Khan', phone: '0311-7654321', cnic: '35202-7654321-2', email: 'sara@mail.com', status: 'active', createdAt: '2025-01-20' },
    { _id: 'm3', name: 'Bilal Ahmed', phone: '0321-1111111', cnic: '35203-1111111-3', email: 'bilal@mail.com', status: 'active', createdAt: '2025-02-01' },
    { _id: 'm4', name: 'Ayesha Malik', phone: '0333-2222222', cnic: '35204-2222222-4', email: 'ayesha@mail.com', status: 'active', createdAt: '2025-02-10' },
    { _id: 'm5', name: 'Zain Raza', phone: '0345-3333333', cnic: '35205-3333333-5', email: 'zain@mail.com', status: 'active', createdAt: '2025-02-15' },
    { _id: 'm6', name: 'Fatima Noor', phone: '0300-4444444', cnic: '35206-4444444-6', email: 'fatima@mail.com', status: 'active', createdAt: '2025-03-01' },
    { _id: 'm7', name: 'Hassan Tariq', phone: '0312-5555555', cnic: '35207-5555555-7', email: 'hassan@mail.com', status: 'suspended', createdAt: '2025-03-10' },
    { _id: 'm8', name: 'Maryam Sheikh', phone: '0322-6666666', cnic: '35208-6666666-8', email: 'maryam@mail.com', status: 'active', createdAt: '2025-03-15' },
  ],

  committees: [
    {
      _id: 'c1', name: 'Family Committee 2025', monthlyAmount: 5000, totalMembers: 5,
      startDate: '2025-01-01', status: 'active',
      members: [
        { memberId: 'm1', memberName: 'Ahmad Ali', turnMonth: 1, hasTaken: true },
        { memberId: 'm2', memberName: 'Sara Khan', turnMonth: 2, hasTaken: true },
        { memberId: 'm3', memberName: 'Bilal Ahmed', turnMonth: 3, hasTaken: false },
        { memberId: 'm4', memberName: 'Ayesha Malik', turnMonth: 4, hasTaken: false },
        { memberId: 'm5', memberName: 'Zain Raza', turnMonth: 5, hasTaken: false },
      ]
    },
    {
      _id: 'c2', name: 'Office Staff Pool', monthlyAmount: 10000, totalMembers: 8,
      startDate: '2025-03-01', status: 'active',
      members: [
        { memberId: 'm1', memberName: 'Ahmad Ali', turnMonth: 1, hasTaken: true },
        { memberId: 'm2', memberName: 'Sara Khan', turnMonth: 2, hasTaken: false },
        { memberId: 'm3', memberName: 'Bilal Ahmed', turnMonth: 3, hasTaken: false },
        { memberId: 'm6', memberName: 'Fatima Noor', turnMonth: 4, hasTaken: false },
        { memberId: 'm7', memberName: 'Hassan Tariq', turnMonth: 5, hasTaken: false },
        { memberId: 'm8', memberName: 'Maryam Sheikh', turnMonth: 6, hasTaken: false },
        { memberId: 'm4', memberName: 'Ayesha Malik', turnMonth: 7, hasTaken: false },
        { memberId: 'm5', memberName: 'Zain Raza', turnMonth: 8, hasTaken: false },
      ]
    },
    {
      _id: 'c3', name: 'Neighbors Savings', monthlyAmount: 3000, totalMembers: 4,
      startDate: '2024-09-01', status: 'completed',
      members: [
        { memberId: 'm6', memberName: 'Fatima Noor', turnMonth: 1, hasTaken: true },
        { memberId: 'm7', memberName: 'Hassan Tariq', turnMonth: 2, hasTaken: true },
        { memberId: 'm8', memberName: 'Maryam Sheikh', turnMonth: 3, hasTaken: true },
        { memberId: 'm1', memberName: 'Ahmad Ali', turnMonth: 4, hasTaken: true },
      ]
    }
  ],

  notifications: [
    { id: 'n1', type: 'payment', icon: '💳', text: 'Bilal Ahmed paid PKR 5,000 for Family Committee', time: '2 min ago', bg: 'var(--success-100)' },
    { id: 'n2', type: 'reminder', icon: '🔔', text: 'Payment reminder: 3 members pending for May', time: '1 hour ago', bg: 'var(--warning-100)' },
    { id: 'n3', type: 'payout', icon: '💰', text: 'Sara Khan received payout of PKR 25,000', time: '3 hours ago', bg: 'var(--info-100)' },
    { id: 'n4', type: 'system', icon: '⚙️', text: 'System backup completed successfully', time: '5 hours ago', bg: 'var(--primary-100)' },
    { id: 'n5', type: 'member', icon: '👤', text: 'New member Maryam Sheikh registered', time: 'Yesterday', bg: 'var(--accent-100)' },
  ],

  activities: [
    { time: '10:32 AM', text: 'Ahmad Ali marked as paid for May 2025', type: 'payment' },
    { time: '09:15 AM', text: 'New committee "Office Staff Pool" created', type: 'committee' },
    { time: 'Yesterday', text: 'Sara Khan received payout of PKR 25,000', type: 'payout' },
    { time: 'Yesterday', text: 'Maryam Sheikh joined the system', type: 'member' },
    { time: '2 days ago', text: 'Monthly report generated for April', type: 'report' },
    { time: '3 days ago', text: 'System settings updated by Admin', type: 'system' },
  ],

  transactions: [
    { id: 't1', type: 'payment', member: 'Ahmad Ali', committee: 'Family Committee 2025', amount: 5000, status: 'completed', date: '2025-05-01', method: 'Bank Transfer' },
    { id: 't2', type: 'payment', member: 'Sara Khan', committee: 'Family Committee 2025', amount: 5000, status: 'completed', date: '2025-05-02', method: 'JazzCash' },
    { id: 't3', type: 'payout', member: 'Sara Khan', committee: 'Family Committee 2025', amount: 25000, status: 'completed', date: '2025-05-03', method: 'Bank Transfer' },
    { id: 't4', type: 'payment', member: 'Bilal Ahmed', committee: 'Family Committee 2025', amount: 5000, status: 'pending', date: '2025-05-05', method: 'Pending' },
    { id: 't5', type: 'payment', member: 'Fatima Noor', committee: 'Office Staff Pool', amount: 10000, status: 'completed', date: '2025-05-01', method: 'EasyPaisa' },
    { id: 't6', type: 'payment', member: 'Hassan Tariq', committee: 'Office Staff Pool', amount: 10000, status: 'late', date: '2025-04-28', method: 'Cash' },
  ]
};

const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_FULL = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

async function api(method, path, body) {
  try {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const r = await fetch(API_BASE + path, opts);
    if (!r.ok) throw new Error('API error');
    return await r.json();
  } catch (e) {
    console.warn('API fallback to demo:', e.message);
    return null;
  }
}

function formatCurrency(n) {
  return 'PKR ' + (n || 0).toLocaleString('en-PK');
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
}

function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return mins + ' min ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  const days = Math.floor(hrs / 24);
  if (days < 30) return days + 'd ago';
  return formatDate(d);
}

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function generateId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
}

// Chart data helpers
function getMonthlyCollectionData() {
  return {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    data: [45000, 52000, 48000, 61000, 55000, 67000, 72000, 68000],
    data2: [38000, 42000, 39000, 51000, 47000, 58000, 63000, 59000]
  };
}

function getCommitteeStatusData() {
  return { labels: ['Active', 'Completed', 'Paused'], data: [2, 1, 0], colors: ['#22C55E', '#3B82F6', '#F59E0B'] };
}

function getPaymentStatusData() {
  return { labels: ['Paid', 'Pending', 'Late'], data: [65, 28, 7], colors: ['#22C55E', '#F59E0B', '#EF4444'] };
}
