const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String, // Unicode emoji or icon name
    required: true,
  },
  type: {
    type: String, // e.g., 'Full Stack Certification', 'Hackathon Winner', etc.
    required: true,
  },
  details: {
    type: String, // Optional extra details
  },
  issuedBy: {
    type: String,
  },
  issuedAt: {
    type: Date,
  },
  link: {
    type: String, // Optional URL to certificate
  },
  media: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Certification', certificationSchema);
