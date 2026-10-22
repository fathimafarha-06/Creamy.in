const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const Offer = require('../models/Offer');
const Order = require('../models/Order');

// ---------- Storefront pages ----------

// GET / — hero + categories + menu grid + about + contact
router.get('/', async (req, res, next) => {
  try {
    const [items, offer] = await Promise.all([
      MenuItem.find({ available: true }).sort({ createdAt: -1 }).lean(),
      Offer.findOne({ active: true }).sort({ updatedAt: -1 }).lean(),
    ]);
    res.render('index', {
      title: 'Creamy.in — Artisan Home Bakery, Kilakarai',
      items,
      offer,
      whatsapp: process.env.WHATSAPP_NUMBER || '917845550886',
    });
  } catch (err) {
    next(err);
  }
});

// GET /customize — custom cake builder page
router.get('/customize', async (req, res, next) => {
  try {
    const offer = await Offer.findOne({ active: true }).sort({ updatedAt: -1 }).lean();
    res.render('customize', { title: 'Customize Your Cake — Creamy.in', offer });
  } catch (err) {
    next(err);
  }
});

// ---------- JSON APIs used by public/js/store.js ----------

// GET /api/menu — live menu for filtering (also used as fallback if SSR empty)
router.get('/api/menu', async (req, res, next) => {
  try {
    const items = await MenuItem.find({ available: true }).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// POST /api/orders — store a copy of every WhatsApp checkout for the dashboard
// Body: { customerName, customerPhone, address, note, items:[{title,price,qty}], total, source }
router.post('/api/orders', async (req, res, next) => {
  try {
    const { customerName, customerPhone, address, note, items, total, source } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty.' });
    }
    const cleanItems = items.map((i) => ({
      title: String(i.title || 'Item').slice(0, 120),
      price: Number(i.price) || 0,
      qty: Math.max(1, parseInt(i.qty, 10) || 1),
    }));
    const computed = cleanItems.reduce((s, i) => s + i.price * i.qty, 0);
    const order = await Order.create({
      customerName: String(customerName || 'Website Customer').slice(0, 100),
      customerPhone: String(customerPhone || '').slice(0, 20),
      address: String(address || '').slice(0, 300),
      note: String(note || '').slice(0, 500),
      items: cleanItems,
      total: Number(total) || computed,
      source: ['website', 'whatsapp', 'custom'].includes(source) ? source : 'website',
      status: 'New',
    });
    res.status(201).json({ ok: true, orderId: order._id });
  } catch (err) {
    next(err);
  }
});

// POST /customize — save a custom-cake enquiry as an order with source=custom
router.post('/customize', async (req, res, next) => {
  try {
    const { name, phone, flavour, size, message, date } = req.body;
    const label = `Custom Cake — ${flavour || 'Vanilla'} / ${size || '1kg'}`;
    await Order.create({
      customerName: name || 'Custom Cake Customer',
      customerPhone: phone || '',
      address: '',
      note: `Wanted for: ${date || '—'} | Message on cake: ${message || '—'}`,
      items: [{ title: label, price: 0, qty: 1 }],
      total: 0,
      source: 'custom',
      status: 'New',
    });
    res.redirect('/?customized=1#contact');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
