const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// ─────────────────────────────────────────────────────────
// Supabase admin client (SERVICE ROLE — never exposed to frontend)
// ─────────────────────────────────────────────────────────
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// ─────────────────────────────────────────────────────────
// Middleware: Verify Supabase JWT
// ─────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token provided.' });

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return res.status(401).json({ success: false, message: 'Invalid token.' });

  // Get profile for role
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile?.is_active) return res.status(403).json({ success: false, message: 'Account deactivated.' });

  req.user = { ...user, ...profile };
  next();
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }
  next();
};

// ─────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────

// Create staff (needs service role to create auth users with specific roles)
app.post('/api/auth/create-staff', protect, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const { name, email, password, role, phone, specialization, treatmentType } = req.body;
    const allowedRoles = ['doctor', 'assistant', 'admin'];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid staff role.' });
    }
    if (role === 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Only Super Admin can create admins.' });
    }

    // Create user via Supabase admin (bypasses email confirmation)
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role, phone, specialization, treatment_type: treatmentType || 'allopathic' },
    });

    if (authErr) return res.status(400).json({ success: false, message: authErr.message });

    // Profile auto-created by DB trigger, but update role explicitly
    await supabaseAdmin.from('profiles').update({ role }).eq('id', authData.user.id);

    // Audit log
    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.user.id,
      action: 'CREATE_STAFF',
      table_name: 'profiles',
      record_id: authData.user.id,
      new_data: { role, email },
    });

    res.status(201).json({
      success: true,
      message: `${role} created successfully.`,
      user: { id: authData.user.id, email, role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Doctor Hub API running 🏥', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
