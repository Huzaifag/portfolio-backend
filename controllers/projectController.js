const Project = require('../models/Project');

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single project by ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new project
exports.createProject = async (req, res) => {
  try {
    const { category, image, title, shortDetail, gitLink, screenshots } = req.body;
    let screenshotsArr = Array.isArray(screenshots) ? screenshots : (screenshots ? [screenshots] : []);
    const newProject = new Project({ category, image, title, shortDetail, gitLink, screenshots: screenshotsArr });
    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const { category, image, title, shortDetail, gitLink, screenshots } = req.body;
    let screenshotsArr = Array.isArray(screenshots) ? screenshots : (screenshots ? [screenshots] : []);
    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      { category, image, title, shortDetail, gitLink, screenshots: screenshotsArr },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Project not found' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Project not found' });
    res.status(200).json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
