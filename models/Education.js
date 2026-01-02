const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
	degree: {
		type: String,
		required: true,
	},
	institution: {
		type: String,
		required: true,
	},
	duration: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model('Education', educationSchema);
