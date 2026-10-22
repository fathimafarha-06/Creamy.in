// server.js — Creamy.in Express + MongoDB + EJS application entry point.
require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const engine = require('ejs-mate');

const shopRoutes = require('./routes/shop');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/creamyin';

// ----- View engine (EJS + ejs-mate layouts) -----
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ----- Core middleware -----
app.use(express.urlencoded({ extended: true })); // form posts (admin CRUD, customize)
app.use(express.json()); // JSON API (/api/orders)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'creamy-in-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 8 }, // 8h admin session
  })
);

// ----- Static assets -----
// Local JPGs live in ./images (your uploaded folder) — served at /images/*.jpg
app.use('/images', express.static(path.join(__dirname, 'images')));
// CSS/JS live in ./public — served at /css, /js
app.use(express.static(path.join(__dirname, 'public')));

// Make session + branding available in every view
app.use((req, res, next) => {
  res.locals.isAdmin = Boolean(req.session && req.session.adminId);
  res.locals.adminName = (req.session && req.session.adminName) || null;
  res.locals.brand = {
    address: '13/37 Sangu Vetti Street, Kilakarai',
    phone: '+91 7845550886',
    whatsapp: process.env.WHATSAPP_NUMBER || '917845550886',
  };
  next();
});

// ----- Routes -----
app.use('/', shopRoutes);
app.use('/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => res.json({ ok: true, app: 'creamy.in' }));

// 404
app.use((req, res) => res.status(404).render('404', { title: 'Not found — Creamy.in' }));

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  if (req.path.startsWith('/api/')) return res.status(500).json({ error: 'Server error' });
  res.status(500).render('500', { title: 'Error — Creamy.in', error: err });
});

// ----- Boot: connect DB then listen -----
async function boot() {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
    console.log('✓ MongoDB connected:', MONGODB_URI);
  } catch (err) {
    console.error('✗ MongoDB connection failed. Start mongod or set MONGODB_URI in .env');
    console.error(String(err.message || err));
    // Still listen so the UI shell renders; APIs needing DB will 500 with a clear log.
  }
  app.listen(PORT, () => {
    console.log(`✓ Creamy.in running → http://localhost:${PORT}`);
    console.log(`  Admin login      → http://localhost:${PORT}/admin/login`);
  });
}

boot();
