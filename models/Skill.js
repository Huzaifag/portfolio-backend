const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String, // Media URL or image path
    required: true,
  },
  expertyLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'expert'],
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);
