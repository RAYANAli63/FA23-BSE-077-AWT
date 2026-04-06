require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { supabase } = require('./db/connect'); // ✅ Supabase import
const runAdLifecycleCron = require('./cron/adLifecycle');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 🔐 CREATE DEFAULT ADMIN (ONLY ONE)
const createAdmin = async () => {
  try {
    const adminEmail = "hammadmukhtar128@gmail.com";
    const adminPassword = "Hammad@146";

    // 🔍 Check existing admin
    const { data: existingAdmin, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", adminEmail)
      .eq("role", "admin")
      .single();

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      const { error: insertError } = await supabase
        .from("users")
        .insert([
          {
            email: adminEmail,
            password_hash: hashedPassword,
            full_name: "Super Admin",
            role: "admin",
            is_verified: true
          }
        ]);

      if (insertError) {
        console.log("❌ Admin Insert Error:", insertError.message);
      } else {
        console.log("✅ Admin Created Successfully");
      }
    } else {
      console.log("ℹ️ Admin already exists");
    }
  } catch (err) {
    console.log("❌ Admin check error:", err.message);
  }
};

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/ads', require('./routes/adRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/moderator', require('./routes/moderatorRoutes'));

app.get('/', (req, res) => {
  res.send('AdFlow Pro API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);

  await createAdmin();       // ✅ create admin
  runAdLifecycleCron();      // ✅ cron start
});