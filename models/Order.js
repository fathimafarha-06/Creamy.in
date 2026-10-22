const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, default: 'Walk-in Customer', trim: true },
    customerPhone: { type: String, default: '', trim: true },
    address: { type: String, default: '', trim: true },
    note: { type: String, default: '', trim: true },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true, min: 0 },
    source: { type: String, enum: ['website', 'whatsapp', 'custom'], default: 'website' },
    status: {
      type: String,
      enum: ['New', 'Confirmed', 'Baking', 'Delivered', 'Cancelled'],
      default: 'New',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
