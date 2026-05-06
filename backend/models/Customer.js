const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  customerType: {
    type: String,
    enum: ['Retail', 'Wholesale', 'VIP'],
    default: 'Retail'
  },
  discount: {
    type: Number,
    default: 0 // percentage discount
  }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
