const Experience = require('../models/Experience');

// List all experiences
exports.index = async (req, res) => {
    console.log('Rendering experience index page');
  const experiences = await Experience.find().sort({ createdAt: -1 });
  res.render('pages/experience/index', { title: 'Experience', experiences, currentPath: req.path });
};

// Show create form
exports.createForm = (req, res) => {
  res.render('pages/experience/create', { title: 'Add Experience', currentPath: req.path });
};

// Create experience
exports.create = async (req, res) => {
  const { title, company, duration, description } = req.body;
  await Experience.create({ title, company, duration, description });
  res.redirect('/experience');
};

// Show single experience
exports.show = async (req, res) => {
  const experience = await Experience.findById(req.params.id);
  res.render('pages/experience/show', { title: 'Experience Details', experience, currentPath: req.path });
};

// Show edit form
exports.editForm = async (req, res) => {
  const experience = await Experience.findById(req.params.id);
  res.render('pages/experience/edit', { title: 'Edit Experience', experience, currentPath: req.path });
};

// Update experience
exports.update = async (req, res) => {
  const { title, company, duration, description } = req.body;
  await Experience.findByIdAndUpdate(req.params.id, { title, company, duration, description });
  res.redirect('/experience');
};

// Delete experience
exports.delete = async (req, res) => {
  await Experience.findByIdAndDelete(req.params.id);
  res.redirect('/experience');
};
