# Creamy.in — Artisan Home Bakery 🍰

Full-stack bakery shop: customer storefront + secure admin portal.
Beige (`#FDFBF7`, `#F5EBE0`) + Burgundy (`#6B1D2F`, `#5B1E31`) theme.

## Quick start

```bash
npm install
# 1. Start MongoDB locally (or set MONGODB_URI in .env to Atlas)
# 2. Seed admin + menu + offer (uses local ./images/*.jpg)
npm run seed
# 3. Run
npm run dev
```

- Store: http://localhost:3000
- Customize cake: http://localhost:3000/customize
- Admin login: http://localhost:3000/admin/login (default `admin` / `creamy123` — change in `.env`, re-run seed)

## WhatsApp ordering

Checkout builds a pre-formatted message and opens `https://wa.me/917845550886?text=...`
Every checkout is also POSTed to `/api/orders` so the admin dashboard lists it.

## Images

Product/banner JPGs live in `./images/` and are served at `/images/...`.
Seed data already points there. In admin, use paths like `/images/bread.jpg`.
File with a space: use `/images/cup%20cake%201.jpg`.

## Structure

```
server.js            Express + session + Mongo + EJS-mate setup
seed.js              Admin + menu + offer seeder
models/              MenuItem, Order, Admin, Offer
routes/shop.js       Storefront + /api/menu + /api/orders + /customize
routes/admin.js      Login, dashboard stats, menu CRUD, offers, order status
middleware/auth.js   requireAdmin session guard
views/               EJS: layout, index, customize, admin/login, admin/dashboard
public/css|js        Theme CSS + cart/wishlist/WhatsApp logic
images/              Local product JPGs
```
