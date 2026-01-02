const Education = require('../models/Education');

// List all education records
exports.index = async (req, res) => {
  const educations = await Education.find().sort({ createdAt: -1 });
  res.render('pages/education/index', { title: 'Education', educations, currentPath: req.path });
};

// Show create form
exports.createForm = (req, res) => {
  res.render('pages/education/create', { title: 'Add Education', currentPath: req.path });
};

// Create new education
exports.create = async (req, res) => {
  await Education.create(req.body);
  res.redirect('/education');
};

// Show single education
exports.show = async (req, res) => {
  const education = await Education.findById(req.params.id);
  res.render('pages/education/show', { title: 'Education Details', education, currentPath: req.path });
};

// Show edit form
exports.editForm = async (req, res) => {
  const education = await Education.findById(req.params.id);
  res.render('pages/education/edit', { title: 'Edit Education', education, currentPath: req.path });
};

// Update education
exports.update = async (req, res) => {
  await Education.findByIdAndUpdate(req.params.id, req.body);
  res.redirect('/education');
};

// Delete education
exports.delete = async (req, res) => {
  await Education.findByIdAndDelete(req.params.id);
  res.redirect('/education');
};
