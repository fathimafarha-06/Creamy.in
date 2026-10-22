const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const Admin = require('../models/Admin');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const Offer = require('../models/Offer');
const { requireAdmin } = require('../middleware/auth');

const CATEGORIES = ['Cakes', 'Cupcakes', 'Cookies', 'Custom Cakes'];

// ---------- Auth ----------

router.get('/login', (req, res) => {
  if (req.session.adminId) return res.redirect('/admin/dashboard');
  res.render('admin/login', { title: 'Admin Login — Creamy.in', error: null });
});

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username: String(username || '').toLowerCase().trim() });
    if (!admin) return res.status(401).render('admin/login', { title: 'Admin Login', error: 'Invalid credentials.' });
    const ok = await bcrypt.compare(String(password || ''), admin.passwordHash);
    if (!ok) return res.status(401).render('admin/login', { title: 'Admin Login', error: 'Invalid credentials.' });
    req.session.adminId = admin._id;
    req.session.adminName = admin.username;
    res.redirect('/admin/dashboard');
  } catch (err) {
    next(err);
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

// ---------- Dashboard ----------

router.get('/dashboard', requireAdmin, async (req, res, next) => {
  try {
    const [items, orders, offer, revenueAgg] = await Promise.all([
      MenuItem.find().sort({ createdAt: -1 }).lean(),
      Order.find().sort({ createdAt: -1 }).limit(30).lean(),
      Offer.findOne().sort({ updatedAt: -1 }).lean(),
      Order.aggregate([{ $match: { status: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    ]);
    const totalRevenue = revenueAgg[0] ? revenueAgg[0].total : 0;
    const orderCount = await Order.countDocuments();
    const newCount = await Order.countDocuments({ status: 'New' });
    res.render('admin/dashboard', {
      title: 'Dashboard — Creamy.in Admin',
      items,
      orders,
      offer: offer || { badge: '', title: '', subtitle: '', active: true },
      stats: { revenue: totalRevenue, orders: orderCount, items: items.length, fresh: newCount },
      categories: CATEGORIES,
      adminName: req.session.adminName || 'Admin',
      query: req.query,
    });
  } catch (err) {
    next(err);
  }
});

// ---------- Menu CRUD ----------

router.post('/items', requireAdmin, async (req, res, next) => {
  try {
    const { title, price, category, image, description, available } = req.body;
    await MenuItem.create({
      title,
      price: Number(price),
      category: CATEGORIES.includes(category) ? category : 'Cakes',
      image: image || '/images/bread.jpg',
      description: description || '',
      available: available === 'on' || available === true || available === 'true',
    });
    res.redirect('/admin/dashboard?saved=1#menu');
  } catch (err) {
    next(err);
  }
});

router.post('/items/:id/edit', requireAdmin, async (req, res, next) => {
  try {
    const { title, price, category, image, description, available } = req.body;
    await MenuItem.findByIdAndUpdate(req.params.id, {
      title,
      price: Number(price),
      category: CATEGORIES.includes(category) ? category : 'Cakes',
      image: image || '/images/bread.jpg',
      description: description || '',
      available: available === 'on' || available === true || available === 'true',
    });
    res.redirect('/admin/dashboard?saved=1#menu');
  } catch (err) {
    next(err);
  }
});

router.post('/items/:id/delete', requireAdmin, async (req, res, next) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.redirect('/admin/dashboard?deleted=1#menu');
  } catch (err) {
    next(err);
  }
});

// ---------- Offers ----------

router.post('/offer', requireAdmin, async (req, res, next) => {
  try {
    const { badge, title, subtitle, active } = req.body;
    const payload = {
      badge: badge || '',
      title: title || '',
      subtitle: subtitle || '',
      active: active === 'on' || active === true || active === 'true',
    };
    const existing = await Offer.findOne().sort({ updatedAt: -1 });
    if (existing) await Offer.findByIdAndUpdate(existing._id, payload);
    else await Offer.create(payload);
    res.redirect('/admin/dashboard?offer=1#offer');
  } catch (err) {
    next(err);
  }
});

// ---------- Orders ----------

router.post('/orders/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const allowed = ['New', 'Confirmed', 'Baking', 'Delivered', 'Cancelled'];
    const { status } = req.body;
    if (allowed.includes(status)) await Order.findByIdAndUpdate(req.params.id, { status });
    res.redirect('/admin/dashboard#orders');
  } catch (err) {
    next(err);
  }
});

router.post('/orders/:id/delete', requireAdmin, async (req, res, next) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.redirect('/admin/dashboard#orders');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
