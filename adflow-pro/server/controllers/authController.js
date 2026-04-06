const fs = require('fs');
const { supabase } = require('../db/connect');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'supersecret123', {
    expiresIn: '30d',
  });
};

function logAuthError(message, data) {
  const entry = `[${new Date().toISOString()}] ${message} ${JSON.stringify(data)}\n`;
  fs.appendFileSync('./auth-error.log', entry);
}

const register = async (req, res) => {
  try {
    console.log('[AUTH] register body:', req.body);
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    const { data: existingUser, error: existingError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existingError && existingError.code !== 'PGRST116') {
      console.error('Supabase lookup error:', existingError);
      return res.status(500).json({ message: 'Server Error' });
    }

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const normalizedRole = ['client', 'moderator', 'admin'].includes((role || '').toLowerCase())
      ? role.toLowerCase()
      : 'client';

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        full_name: name,
        email: email.toLowerCase(),
        password_hash: hashedPassword,
        role: normalizedRole,
        is_verified: false,
      })
      .select('id, full_name, email, role')
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      logAuthError('Supabase insert error:', insertError);
      return res.status(500).json({ message: 'Server Error' });
    }

    const token = generateToken(newUser.id, newUser.role);

    return res.status(201).json({
      _id: newUser.id,
      name: newUser.full_name,
      email: newUser.email,
      role: newUser.role,
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    logAuthError('Register error:', {
      error: error?.message || error,
      stack: error?.stack || null,
      body: req.body,
    });
    return res.status(500).json({ message: 'Server Error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, full_name, email, role, password_hash')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (userError) {
      console.error('Supabase login lookup error:', userError);
      return res.status(500).json({ message: 'Server Error' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.role);

    return res.json({
      _id: user.id,
      name: user.full_name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

const getMe = async (req, res) => {
  try {
    const { id } = req.user;
    const { data: user, error } = await supabase
      .from('users')
      .select('id, full_name, email, role, is_verified')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('GetMe error:', error);
      return res.status(500).json({ message: 'Server Error' });
    }

    return res.json(user);
  } catch (error) {
    console.error('GetMe exception:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { register, login, getMe };
