

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const mediaFolderController = require('../controllers/mediaFolderController');
const mediaController = require('../controllers/mediaController');
const certificationController = require('../controllers/certificationController');
// Certification CRUD (EJS views)
router.get('/certifications', authController.requireAdmin, certificationController.index);
router.get('/certifications/new', authController.requireAdmin, certificationController.createForm);
router.post('/certifications', authController.requireAdmin, certificationController.create);
router.get('/certifications/:id', authController.requireAdmin, certificationController.show);
router.get('/certifications/:id/edit', authController.requireAdmin, certificationController.editForm);
router.post('/certifications/:id', authController.requireAdmin, certificationController.update);
router.post('/certifications/:id/delete', authController.requireAdmin, certificationController.delete);

// Media Folder CRUD and navigation
// View folders and media in a folder (or root)
router.get('/media', authController.requireAdmin, mediaFolderController.folderView);
router.get('/media/folder/:folderId', authController.requireAdmin, mediaFolderController.folderView);

// Create folder
router.post('/media/folder', authController.requireAdmin, mediaFolderController.createFolder);

// Rename folder
router.post('/media/folder/:folderId/rename', authController.requireAdmin, mediaFolderController.renameFolder);

// Delete folder
router.post('/media/folder/:folderId/delete', authController.requireAdmin, mediaFolderController.deleteFolder);

// Media CRUD (EJS views)
// Index - list all media
router.get('/media', authController.requireAdmin, mediaController.index);

// New - show form
router.get('/media/new', authController.requireAdmin, mediaController.createForm);

const upload = require('../middleware/upload');
// Create (with file upload)
router.post('/media', authController.requireAdmin, upload.single('file'), mediaController.create);

// Show
router.get('/media/:id', authController.requireAdmin, mediaController.show);

// Edit - show form
router.get('/media/:id/edit', authController.requireAdmin, mediaController.editForm);

// Update
router.post('/media/:id', authController.requireAdmin, mediaController.update);

// Delete
router.post('/media/:id/delete', authController.requireAdmin, mediaController.delete);

// Home route (protected)
router.get('/', require('../controllers/authController').requireAdmin, (req, res) => {
  res.render('index', { title: 'Home', currentPath: req.path });
});

// Auth routes
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/logout', authController.logout);


// Personal Info CRUD (EJS views)
const PersonalInfo = require('../models/PersonalInfo');

// Index - list all personal info
router.get('/personal-info', authController.requireAdmin, async (req, res) => {
  const infos = await PersonalInfo.find().sort({ createdAt: -1 });
  res.render('pages/personal_info/index', { title: 'Personal Info', infos, currentPath: req.path });
});

// New - show form
router.get('/personal-info/new', authController.requireAdmin, (req, res) => {
  res.render('pages/personal_info/create', { title: 'Add Personal Info', currentPath: req.path });
});

// Create
router.post('/personal-info', authController.requireAdmin, async (req, res) => {
  let { name, title, summary, profileImage, skills } = req.body;
  if (skills) {
    skills = skills.split(',').map(s => {
      const [name, value] = s.split(':');
      return { name: name.trim(), value: Number(value) };
    });
  }
  await PersonalInfo.create({ name, title, summary, profileImage, skills });
  res.redirect('/personal-info');
});

// Show
router.get('/personal-info/:id', authController.requireAdmin, async (req, res) => {
  const info = await PersonalInfo.findById(req.params.id);
  res.render('pages/personal_info/show', { title: 'Personal Info', info, currentPath: req.path });
});

// Edit - show form
router.get('/personal-info/:id/edit', authController.requireAdmin, async (req, res) => {
  const info = await PersonalInfo.findById(req.params.id);
  res.render('pages/personal_info/edit', { title: 'Edit Personal Info', info, currentPath: req.path });
});

// Update
router.post('/personal-info/:id', authController.requireAdmin, async (req, res) => {
  let { name, title, summary, profileImage, skills } = req.body;
  if (skills) {
    skills = skills.split(',').map(s => {
      const [name, value] = s.split(':');
      return { name: name.trim(), value: Number(value) };
    });
  }
  await PersonalInfo.findByIdAndUpdate(req.params.id, { name, title, summary, profileImage, skills });
  res.redirect('/personal-info');
});

// Delete
router.post('/personal-info/:id/delete', authController.requireAdmin, async (req, res) => {
  await PersonalInfo.findByIdAndDelete(req.params.id);
  res.redirect('/personal-info');
});

// // Contact route
// router.get('/contact', (req, res) => {
//   res.render('contact', { title: 'Contact' });
// });


// Education CRUD (EJS views)
const educationController = require('../controllers/educationController');

// Index - list all education
router.get('/education', authController.requireAdmin, educationController.index);

// New - show form
router.get('/education/new', authController.requireAdmin, educationController.createForm);

// Create
router.post('/education', authController.requireAdmin, educationController.create);

// Show
router.get('/education/:id', authController.requireAdmin, educationController.show);

// Edit - show form
router.get('/education/:id/edit', authController.requireAdmin, educationController.editForm);

// Update
router.post('/education/:id', authController.requireAdmin, educationController.update);

// Delete
router.post('/education/:id/delete', authController.requireAdmin, educationController.delete);

module.exports = router;
