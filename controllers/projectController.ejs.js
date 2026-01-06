const Project = require('../models/Project');

// List all projects
exports.index = async (req, res) => {
  const projects = await Project.find().sort({ createdAt: -1 });
  res.render('pages/project/index', { title: 'Projects', projects, currentPath: req.path });
};

// Show create form
exports.createForm = (req, res) => {
  res.render('pages/project/create', { title: 'Add Project', currentPath: req.path });
};

// Create project
exports.create = async (req, res) => {
  const { category, image, title, shortDetail, gitLink, screenshots } = req.body;
  let screenshotsArr = Array.isArray(screenshots) ? screenshots : (screenshots ? [screenshots] : []);
  await Project.create({ category, image, title, shortDetail, gitLink, screenshots: screenshotsArr });
  res.redirect('/project');
};

// Show single project
exports.show = async (req, res) => {
  const project = await Project.findById(req.params.id);
  res.render('pages/project/show', { title: 'Project Details', project, currentPath: req.path });
};

// Show edit form
exports.editForm = async (req, res) => {
  const project = await Project.findById(req.params.id);
  res.render('pages/project/edit', { title: 'Edit Project', project, currentPath: req.path });
};

// Update project
exports.update = async (req, res) => {
  const { category, image, title, shortDetail, gitLink, screenshots } = req.body;
  let screenshotsArr = Array.isArray(screenshots) ? screenshots : (screenshots ? [screenshots] : []);
  await Project.findByIdAndUpdate(req.params.id, { category, image, title, shortDetail, gitLink, screenshots: screenshotsArr });
  res.redirect('/project');
};

// Delete project
exports.delete = async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.redirect('/project');
};
