const express = require('express');
const router = express.Router();

// API status route
router.get('/', (req, res) => {
  res.json({ 
    status: 'API is working',
    message: 'Welcome to the Portfolio API',
    version: '1.0.0'
  });
});


// Personal Info CRUD
const personalInfoController = require('../controllers/personalInfoController');
router.post('/personal-info', personalInfoController.createPersonalInfo);
router.get('/personal-info', personalInfoController.getPersonalInfo);
router.put('/personal-info/:id', personalInfoController.updatePersonalInfo);
router.delete('/personal-info/:id', personalInfoController.deletePersonalInfo);

// Dashboard CRUD
const dashboardController = require('../controllers/dashboardController');
router.post('/dashboard', dashboardController.createDashboard);
router.get('/dashboard', dashboardController.getDashboard);
router.put('/dashboard/:id', dashboardController.updateDashboard);
router.delete('/dashboard/:id', dashboardController.deleteDashboard);

// Media Manager API
const Media = require('../models/Media');
const MediaFolder = require('../models/MediaFolder');
const upload = require('../middleware/upload');

// Get all folders (optionally by parent)
router.get('/media/folders', async (req, res) => {
  const parent = req.query.parent || null;
  const folders = await MediaFolder.find({ parent });
  res.json(folders);
});

// Get all media (optionally by folder)
router.get('/media', async (req, res) => {
  const folder = req.query.folder || null;
  const filter = folder ? { folder } : {};
  const media = await Media.find(filter).sort({ uploadedAt: -1 });
  res.json(media);
});


// Upload new media (local only)
router.post('/media', upload.single('file'), async (req, res) => {
  const { type, title, folder } = req.body;
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });
  // Set url to a public path for serving media
  const url = `/uploads/${file.filename}`;
  const media = await Media.create({
    type: type || 'image',
    title: title || file.originalname,
    folder: folder || null,
    url,
    public_id: file.filename,
  });
  res.json(media);
});

// Create new folder
router.post('/media/folders', async (req, res) => {
  const { name, parent } = req.body;
  const folder = await MediaFolder.create({ name, parent: parent || null });
  res.json(folder);
});

module.exports = router;