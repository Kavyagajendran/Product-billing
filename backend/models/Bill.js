const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  customerName: String,
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    weightInGrams: Number,
    quantity: { type: Number, default: 1 },
    pricePer50g: Number,
    totalPrice: Number,
    appliedPricingType: { type: String, enum: ['base', 'discount', 'custom'], default: 'base' }
  }],
  totalAmount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
    expires: '90d' // Automatically delete documents after 90 days (approx 3 months)
  }
});

module.exports = mongoose.model('Bill', billSchema);
