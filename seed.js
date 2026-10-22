// seed.js — run once with `npm run seed` to create admin + sample menu + offer.
// Uses the LOCAL ./images/*.jpg files already in the workspace.
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./models/Admin');
const MenuItem = require('./models/MenuItem');
const Offer = require('./models/Offer');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/creamyin';

const MENU = [
  { title: 'Classic Milk Bread Loaf', price: 60, category: 'Cakes', image: '/images/bread.jpg', description: 'Soft, golden, oven-fresh everyday loaf.' },
  { title: 'Whole Wheat Artisan Bread', price: 80, category: 'Cakes', image: '/images/bread2.jpg', description: 'Hearty whole wheat with a crisp crust.' },
  { title: 'Butter Brioche', price: 95, category: 'Cakes', image: '/images/bread3.jpg', description: 'Rich buttery crumb, slow-fermented.' },
  { title: 'Garlic Herb Loaf', price: 110, category: 'Cakes', image: '/images/bread4.jpg', description: 'Savoury loaf with garlic & herbs.' },
  { title: 'Filter Coffee Cake', price: 220, category: 'Cakes', image: '/images/coffe1.jpg', description: 'South-Indian filter coffee infused sponge.' },
  { title: 'Mocha Truffle Cake', price: 450, category: 'Cakes', image: '/images/coffe2.jpg', description: 'Dark chocolate + espresso ganache.' },
  { title: 'Cappuccino Delight', price: 380, category: 'Cakes', image: '/images/coffe3.jpg', description: 'Light coffee cream layers.' },
  { title: 'Cold Brew Fudge Cake', price: 499, category: 'Cakes', image: '/images/coffe4.jpg', description: 'Intense cold-brew chocolate fudge.' },
  { title: 'Vanilla Sprinkle Cupcake', price: 70, category: 'Cupcakes', image: '/images/cup%20cake%201.jpg', description: 'Fluffy vanilla with sprinkles.' },
  { title: 'Choco Chip Cupcake', price: 85, category: 'Cupcakes', image: '/images/cupcake2.jpg', description: 'Double chocolate chip.' },
  { title: 'Red Velvet Cupcake', price: 95, category: 'Cupcakes', image: '/images/cupcake3.jpg', description: 'Signature wine-red velvet + cream cheese.' },
  { title: 'Glazed Ring Donut (4 pc)', price: 160, category: 'Cookies', image: '/images/do1.jpg', description: 'Pillowy glazed rings, box of 4.' },
  { title: 'Chocolate Donut Box', price: 199, category: 'Cookies', image: '/images/do2.jpg', description: 'Assorted chocolate-dipped donuts.' },
  { title: 'Sugar Dust Donuts', price: 149, category: 'Cookies', image: '/images/do3.jpg', description: 'Classic sugar-dusted soft donuts.' },
  { title: 'Nutty Donut Combo', price: 229, category: 'Cookies', image: '/images/do4.jpg', description: 'Donuts topped with roasted nuts.' },
  { title: 'Butter Shortbread Cookies', price: 180, category: 'Cookies', image: '/images/pa1.jpg', description: 'Melt-in-mouth butter shortbread (250g).' },
  { title: 'Choco Chunk Cookies', price: 210, category: 'Cookies', image: '/images/pa2.jpg', description: 'Chunky chocolate cookies (250g).' },
  { title: 'Jam Thumbprint Cookies', price: 190, category: 'Cookies', image: '/images/pa3.jpg', description: 'Buttery cookies with fruit jam.' },
  { title: 'Assorted Tea-Time Box', price: 249, category: 'Cookies', image: '/images/pa4.jpg', description: 'Assorted pastries & cookies gift box.' },
  { title: 'Custom Photo Cake 1kg', price: 799, category: 'Custom Cakes', image: '/images/coffe4.jpg', description: 'Your photo printed on cake. 24h notice.' },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('connected', MONGODB_URI);

  const username = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'creamy123';
  const hash = await bcrypt.hash(password, 10);
  await Admin.findOneAndUpdate({ username }, { username, passwordHash: hash }, { upsert: true });
  console.log(`admin ready → ${username} / ${'*'.repeat(password.length)}`);

  await MenuItem.deleteMany({});
  await MenuItem.insertMany(MENU);
  console.log(`menu seeded → ${MENU.length} items`);

  await Offer.deleteMany({});
  await Offer.create({
    badge: 'Kilakarai • Fresh Daily',
    title: 'Flat 15% OFF on Custom Cakes this week',
    subtitle: 'Handcrafted home bakery · WhatsApp +91 7845550886 to order',
    active: true,
  });
  console.log('offer seeded');

  await mongoose.disconnect();
  console.log('done. run: npm run dev');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
