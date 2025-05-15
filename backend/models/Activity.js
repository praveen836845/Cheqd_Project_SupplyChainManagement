const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  counterpartyOrg: {
    type: String,
    required: true
  }
});

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity; 