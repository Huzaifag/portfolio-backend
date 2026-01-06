const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['fullstack', 'frontend', 'backend'],
    required: true,
  },
  image: {
    type: String, // URL or media reference
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  shortDetail: {
    type: String,
    required: true,
  },
  gitLink: {
    type: String,
    required: true,
  },
  screenshots: [{
    type: String, // Array of URLs or media references
    required: false,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
