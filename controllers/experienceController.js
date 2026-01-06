const Experience = require('../models/Experience');

// Get all experiences
exports.getAllExperiences = async (req, res) => {
  try {
    const experiences = await Experience.find();
    res.status(200).json(experiences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single experience by ID
exports.getExperienceById = async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    if (!experience) return res.status(404).json({ error: 'Experience not found' });
    res.status(200).json(experience);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new experience
exports.createExperience = async (req, res) => {
  try {
    const { title, company, duration, description } = req.body;
    const newExperience = new Experience({ title, company, duration, description });
    await newExperience.save();
    res.status(201).json(newExperience);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update experience
exports.updateExperience = async (req, res) => {
  try {
    const { title, company, duration, description } = req.body;
    const updated = await Experience.findByIdAndUpdate(
      req.params.id,
      { title, company, duration, description },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Experience not found' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete experience
exports.deleteExperience = async (req, res) => {
  try {
    const deleted = await Experience.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Experience not found' });
    res.status(200).json({ message: 'Experience deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
