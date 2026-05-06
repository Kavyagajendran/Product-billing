const mongoose = require('mongoose');

const customerProductPriceSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  customPrice: {
    type: Number,
    required: true // price per 50g for this specific customer
  }
}, { timestamps: true });

// Ensure a customer can only have one custom price per product
customerProductPriceSchema.index({ customerId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('CustomerProductPrice', customerProductPriceSchema);
