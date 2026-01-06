const Skill = require('../models/Skill');

// List all skills
exports.index = async (req, res) => {
  const skills = await Skill.find().sort({ createdAt: -1 });
  res.render('pages/skill/index', { title: 'Skills', skills, currentPath: req.path });
};

// Show create form
exports.createForm = (req, res) => {
  res.render('pages/skill/create', { title: 'Add Skill', currentPath: req.path });
};

// Create skill
exports.create = async (req, res) => {
  const { name, image, expertyLevel } = req.body;
  await Skill.create({ name, image, expertyLevel });
  res.redirect('/skill');
};

// Show single skill
exports.show = async (req, res) => {
  const skill = await Skill.findById(req.params.id);
  res.render('pages/skill/show', { title: 'Skill Details', skill, currentPath: req.path });
};

// Show edit form
exports.editForm = async (req, res) => {
  const skill = await Skill.findById(req.params.id);
  res.render('pages/skill/edit', { title: 'Edit Skill', skill, currentPath: req.path });
};

// Update skill
exports.update = async (req, res) => {
  const { name, image, expertyLevel } = req.body;
  await Skill.findByIdAndUpdate(req.params.id, { name, image, expertyLevel });
  res.redirect('/skill');
};

// Delete skill
exports.delete = async (req, res) => {
  await Skill.findByIdAndDelete(req.params.id);
  res.redirect('/skill');
};
