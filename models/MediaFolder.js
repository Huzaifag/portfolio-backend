const mongoose = require('mongoose');

const mediaFolderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MediaFolder',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  // Enhanced folder features
  description: {
    type: String,
  },
  color: {
    type: String,
    default: '#6366f1', // Default indigo color
  },
  icon: {
    type: String,
    default: 'folder', // FontAwesome icon name
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  // Folder statistics (computed)
  mediaCount: {
    type: Number,
    default: 0,
  },
  totalSize: {
    type: Number,
    default: 0, // in bytes
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
});

// Index for better performance
mediaFolderSchema.index({ parent: 1 });
mediaFolderSchema.index({ name: 1, parent: 1 }, { unique: true });

// Update the updatedAt field before saving
mediaFolderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('MediaFolder', mediaFolderSchema);
