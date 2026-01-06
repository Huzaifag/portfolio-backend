const express = require('express');
const router = express.Router();
// Skill CRUD
const skillController = require('../controllers/skillController');
router.get('/skills', skillController.getAllSkills);
router.get('/skills/:id', skillController.getSkillById);
router.post('/skills', skillController.createSkill);
router.put('/skills/:id', skillController.updateSkill);
router.delete('/skills/:id', skillController.deleteSkill);
// Project CRUD
const projectController = require('../controllers/projectController');
router.get('/projects', projectController.getAllProjects);
router.get('/projects/:id', projectController.getProjectById);
router.post('/projects', projectController.createProject);
router.put('/projects/:id', projectController.updateProject);
router.delete('/projects/:id', projectController.deleteProject);

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
const mediaFolderController = require('../controllers/mediaFolderController');
const { single, multiple } = require('../middleware/upload');

// Get all folders (optionally by parent)
router.get('/media/folders', async (req, res) => {
  try {
    const parent = req.query.parent || null;
    const folders = await MediaFolder.find({ parent }).sort({ name: 1 });
    res.json(folders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
});

// Get folder tree
router.get('/media/folder-tree', mediaFolderController.getFolderTree);

// Get all media (optionally by folder with advanced filtering)
router.get('/media', async (req, res) => {
  try {
    const { 
      folder, 
      type, 
      search, 
      sortBy = 'uploadedAt', 
      sortOrder = 'desc',
      page = 1,
      limit = 20,
      tags
    } = req.query;
    
    // Build filter
    let filter = { status: 'active' };
    
    if (folder && folder !== 'null') {
      filter.folder = folder;
    } else if (!folder || folder === 'null') {
      filter.folder = null;
    }
    
    if (type && type !== 'all') {
      filter.type = type;
    }
    
    if (tags) {
      filter.tags = { $in: tags.split(',') };
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;
    
    // Sort
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const media = await Media.find(filter)
      .sort(sortConfig)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('uploadedBy', 'username')
      .populate('folder', 'name');

    const totalMedia = await Media.countDocuments(filter);
    
    res.json({
      media,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(totalMedia / limit),
        totalItems: totalMedia
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

// Upload new media (single file)
router.post('/media', ...single('file'), async (req, res) => {
  try {
    const { type, title, folder, description, tags: tagsString, isPublic } = req.body;
    const file = req.file;
    
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    // Process tags
    let tags = [];
    if (tagsString && typeof tagsString === 'string') {
      tags = tagsString.split(',').map(t => t.trim()).filter(Boolean);
    }

    const mediaData = {
      type: type || file.typeCategory || 'other',
      title: title || file.originalName || file.filename,
      description: description || '',
      tags,
      folder: folder || null,
      url: file.url,
      originalName: file.originalName,
      mimeType: file.mimeType,
      fileSize: file.fileSize,
      public_id: file.filename,
      isPublic: isPublic === 'true' || isPublic === true,
    };

    const media = await Media.create(mediaData);
    res.json(media);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

// Bulk upload
router.post('/media/bulk', ...multiple('files', 10), async (req, res) => {
  try {
    const { folder, tags: tagsString, isPublic } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Process tags
    let tags = [];
    if (tagsString && typeof tagsString === 'string') {
      tags = tagsString.split(',').map(t => t.trim()).filter(Boolean);
    }

    const uploadedMedia = [];
    const errors = [];

    for (const file of files) {
      try {
        const mediaData = {
          type: file.typeCategory || 'other',
          title: file.originalName || file.filename,
          description: '',
          tags,
          folder: folder || null,
          url: file.url,
          originalName: file.originalName,
          mimeType: file.mimeType,
          fileSize: file.fileSize,
          public_id: file.filename,
          isPublic: isPublic === 'true' || isPublic === true,
        };

        const media = await Media.create(mediaData);
        uploadedMedia.push(media);
      } catch (error) {
        errors.push({ filename: file.originalName, error: error.message });
      }
    }

    res.json({ 
      success: true, 
      uploaded: uploadedMedia.length, 
      errors: errors.length,
      details: { uploadedMedia, errors }
    });
  } catch (error) {
    res.status(500).json({ error: 'Bulk upload failed' });
  }
});

// Create new folder
router.post('/media/folders', async (req, res) => {
  try {
    const { name, parent, description, color, icon } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    // Check for duplicate folder names
    const existingFolder = await MediaFolder.findOne({ 
      name: name.trim(), 
      parent: parent || null 
    });
    
    if (existingFolder) {
      return res.status(400).json({ error: 'Folder with this name already exists' });
    }

    const folder = await MediaFolder.create({ 
      name: name.trim(), 
      parent: parent || null,
      description: description || '',
      color: color || '#6366f1',
      icon: icon || 'folder'
    });
    
    res.json(folder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// Update media
router.put('/media/:id', async (req, res) => {
  try {
    const { title, description, tags: tagsString, folder, type, isPublic } = req.body;
    
    // Process tags
    let tags = [];
    if (tagsString && typeof tagsString === 'string') {
      tags = tagsString.split(',').map(t => t.trim()).filter(Boolean);
    }

    const updateData = {
      title,
      description,
      tags,
      folder: folder || null,
      type,
      isPublic: isPublic === 'true' || isPublic === true,
      updatedAt: new Date()
    };

    const media = await Media.findByIdAndUpdate(req.params.id, updateData, { new: true });
    
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }
    
    res.json(media);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update media' });
  }
});

// Delete media
router.delete('/media/:id', async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Delete physical file
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '..', media.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Media.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

// Bulk operations
router.post('/media/bulk-delete', async (req, res) => {
  try {
    const { mediaIds } = req.body;
    
    if (!mediaIds || !Array.isArray(mediaIds)) {
      return res.status(400).json({ error: 'Invalid media IDs' });
    }

    const media = await Media.find({ _id: { $in: mediaIds } });
    const fs = require('fs');
    const path = require('path');

    // Delete physical files
    for (const item of media) {
      try {
        const filePath = path.join(__dirname, '..', item.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }

    await Media.deleteMany({ _id: { $in: mediaIds } });
    res.json({ success: true, deleted: mediaIds.length });
  } catch (error) {
    res.status(500).json({ error: 'Bulk delete failed' });
  }
});

router.post('/media/bulk-move', async (req, res) => {
  try {
    const { mediaIds, targetFolder } = req.body;
    
    if (!mediaIds || !Array.isArray(mediaIds)) {
      return res.status(400).json({ error: 'Invalid media IDs' });
    }

    await Media.updateMany(
      { _id: { $in: mediaIds } },
      { folder: targetFolder || null, updatedAt: new Date() }
    );

    res.json({ success: true, moved: mediaIds.length });
  } catch (error) {
    res.status(500).json({ error: 'Move failed' });
  }
});
// Experience CRUD
const experienceController = require('../controllers/experienceController');
router.get('/experiences', experienceController.getAllExperiences);
router.get('/experiences/:id', experienceController.getExperienceById);
router.post('/experiences', experienceController.createExperience);
router.put('/experiences/:id', experienceController.updateExperience);
router.delete('/experiences/:id', experienceController.deleteExperience);

module.exports = router;