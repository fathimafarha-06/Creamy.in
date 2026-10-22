const mongoose = require('mongoose');

// Menu item served on the customer storefront + managed in admin dashboard.
const menuItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ['Cakes', 'Cupcakes', 'Cookies', 'Custom Cakes'],
      default: 'Cakes',
    },
    // Local path served from /images or /public, e.g. "/images/bread.jpg"
    image: { type: String, required: true, default: '/images/bread.jpg' },
    description: { type: String, default: '', trim: true },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);
