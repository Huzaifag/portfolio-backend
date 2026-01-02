const mongoose = require('mongoose');

const personalInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    default: '',
  },
  skills: [
    {
      name: String,
      value: Number,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('PersonalInfo', personalInfoSchema);
