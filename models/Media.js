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
  updatedAt: {
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
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  // Enhanced metadata
  originalName: {
    type: String,
  },
  mimeType: {
    type: String,
  },
  fileSize: {
    type: Number, // in bytes
  },
  dimensions: {
    width: Number,
    height: Number,
  },
  duration: {
    type: Number, // for video/audio in seconds
  },
  public_id: {
    type: String, // for cloudinary or local filename
  },
  // Usage tracking
  downloadCount: {
    type: Number,
    default: 0,
  },
  lastAccessed: {
    type: Date,
  },
  // Status and visibility
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active',
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
});

// Indexes for better performance
mediaSchema.index({ type: 1, folder: 1 });
mediaSchema.index({ tags: 1 });
mediaSchema.index({ uploadedAt: -1 });
mediaSchema.index({ title: 'text', description: 'text' });

// Update the updatedAt field before saving
mediaSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Media', mediaSchema);
