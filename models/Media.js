const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'video', 'audio', 'document', 'resume', 'other'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  tags: [{
    type: String,
  }],
  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MediaFolder',
    default: null,
  },
  // Optionally, reference to user/admin who uploaded
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
});

module.exports = mongoose.model('Media', mediaSchema);
