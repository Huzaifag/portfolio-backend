const PersonalInfo = require('../models/PersonalInfo');

// Create personal info
exports.createPersonalInfo = async (req, res) => {
  try {
    const info = new PersonalInfo(req.body);
    await info.save();
    res.status(201).json(info);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all personal info (or latest)
exports.getPersonalInfo = async (req, res) => {
  try {
    // For single-user portfolio, return the latest entry
    const info = await PersonalInfo.findOne().sort({ createdAt: -1 });
    if (!info) return res.status(404).json({ error: 'No personal info found' });
    res.json(info);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update personal info by ID
exports.updatePersonalInfo = async (req, res) => {
  try {
    const info = await PersonalInfo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!info) return res.status(404).json({ error: 'Personal info not found' });
    res.json(info);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete personal info by ID
exports.deletePersonalInfo = async (req, res) => {
  try {
    const info = await PersonalInfo.findByIdAndDelete(req.params.id);
    if (!info) return res.status(404).json({ error: 'Personal info not found' });
    res.json({ message: 'Personal info deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
