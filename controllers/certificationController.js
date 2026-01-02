const Certification = require('../models/Certification');

// List all certifications
exports.index = async (req, res) => {
  const certifications = await Certification.find().populate('media').sort({ issuedAt: -1, createdAt: -1 });
  res.render('pages/certification/index', { certifications, title: 'Certifications', currentPath: req.path });
};

const Media = require('../models/Media');

// Show create form
exports.createForm = async (req, res) => {
  const mediaList = await Media.find().sort({ uploadedAt: -1 });
  res.render('pages/certification/create', { title: 'Add Certification', mediaList, currentPath: req.path });
};

// Create new certification
exports.create = async (req, res) => {
  try {
    await Certification.create(req.body);
    res.redirect('/certifications');
  } catch (err) {
    const mediaList = await Media.find().sort({ uploadedAt: -1 });
    res.render('pages/certification/create', { title: 'Add Certification', error: err.message, mediaList, currentPath: req.path });
  }
};

// Show single certification
exports.show = async (req, res) => {
  const cert = await Certification.findById(req.params.id).populate('media');
  res.render('pages/certification/show', { cert, title: cert.title, currentPath: req.path });
};

// Show edit form
exports.editForm = async (req, res) => {
  const cert = await Certification.findById(req.params.id);
  const mediaList = await Media.find().sort({ uploadedAt: -1 });
  res.render('pages/certification/edit', { cert, title: 'Edit Certification', mediaList, currentPath: req.path });
};

// Update certification
exports.update = async (req, res) => {
  await Certification.findByIdAndUpdate(req.params.id, req.body);
  res.redirect('/certifications');
};

// Delete certification
exports.delete = async (req, res) => {
  await Certification.findByIdAndDelete(req.params.id);
  res.redirect('/certifications');
};
