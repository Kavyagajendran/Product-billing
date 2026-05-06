const express = require('express');
const router = express.Router();
const CustomerProductPrice = require('../models/CustomerProductPrice');

// Get all custom prices for a specific customer
router.get('/:customerId', async (req, res) => {
  try {
    const prices = await CustomerProductPrice.find({ customerId: req.params.customerId }).populate('productId');
    res.json(prices);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Add or update a custom price
router.post('/', async (req, res) => {
  try {
    const { customerId, productId, customPrice } = req.body;
    
    // Upsert (update if exists, otherwise insert)
    const priceRecord = await CustomerProductPrice.findOneAndUpdate(
      { customerId, productId },
      { customPrice },
      { new: true, upsert: true }
    ).populate('productId');
    
    res.json(priceRecord);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Delete a custom price
router.delete('/:id', async (req, res) => {
  try {
    await CustomerProductPrice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Custom price removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
