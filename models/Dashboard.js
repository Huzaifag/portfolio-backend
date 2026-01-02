const mongoose = require('mongoose');

const dashboardSchema = new mongoose.Schema({
  widgets: [
    {
      type: String,
    }
  ],
  stats: {
    type: Object,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Dashboard', dashboardSchema);
