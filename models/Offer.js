const mongoose = require('mongoose');

// Single active announcement shown as the top banner + hero badge.
const offerSchema = new mongoose.Schema(
  {
    badge: { type: String, default: 'Festive Offer' },
    title: { type: String, default: 'Flat 15% OFF on Custom Cakes' },
    subtitle: {
      type: String,
      default: 'Handcrafted in Kilakarai · Fresh every morning · WhatsApp us to order',
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Offer', offerSchema);
