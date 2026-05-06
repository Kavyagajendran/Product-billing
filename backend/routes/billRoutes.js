const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');

// Save a new bill
router.post('/', async (req, res) => {
  try {
    const { items, totalAmount, customerId, customerName } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Bill must contain at least one item' });
    }

    const newBill = new Bill({ items, totalAmount, customerId, customerName });
    await newBill.save();
    
    res.status(201).json(newBill);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Get all bills
router.get('/', async (req, res) => {
  try {
    const bills = await Bill.find().sort({ date: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Delete a bill by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedBill = await Bill.findByIdAndDelete(req.params.id);
    if (!deletedBill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
