const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true
  },

  isCurrent: {
    type: Boolean,
    default: false
  },

  serviceId: {
    type: String,
    required: true
  },
  tokenNumber: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'arrived', 'served', 'skipped'],
    default: 'waiting'
  },
  isOnSite: {
    type: Boolean,
    default: false
  },
  location: {
    lat: {
      type: Number,
      required: false
    },
    lng: {
      type: Number,
      required: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Token', tokenSchema);
