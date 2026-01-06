const Skill = require('../models/Skill');

// Get all skills
exports.getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.find();
    res.status(200).json(skills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single skill by ID
exports.getSkillById = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ error: 'Skill not found' });
    res.status(200).json(skill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new skill
exports.createSkill = async (req, res) => {
  try {
    const { name, icon } = req.body;
    const newSkill = new Skill({ name, icon });
    await newSkill.save();
    res.status(201).json(newSkill);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update skill
exports.updateSkill = async (req, res) => {
  try {
    const { name, icon } = req.body;
    const updated = await Skill.findByIdAndUpdate(
      req.params.id,
      { name, icon },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Skill not found' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete skill
exports.deleteSkill = async (req, res) => {
  try {
    const deleted = await Skill.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Skill not found' });
    res.status(200).json({ message: 'Skill deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
