const Media = require('../models/Media');
const MediaFolder = require('../models/MediaFolder');
const path = require('path');
const fs = require('fs');

// List all media with advanced filtering and search
exports.index = async (req, res) => {
  try {
    const { 
      search, 
      type, 
      folder, 
      sortBy = 'uploadedAt', 
      sortOrder = 'desc',
      page = 1,
      limit = 20,
      tags
    } = req.query;

    // Build filter object
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
    
    // Text search
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;
    
    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get media with pagination
    const media = await Media.find(filter)
      .sort(sortConfig)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('uploadedBy', 'username')
      .populate('folder', 'name');

    // Get total count for pagination
    const totalMedia = await Media.countDocuments(filter);
    const totalPages = Math.ceil(totalMedia / limit);

    // Get folders for current directory
    const currentFolderId = folder && folder !== 'null' ? folder : null;
    const folders = await MediaFolder.find({ parent: currentFolderId });
    
    // Get current folder info
    let currentFolder = null;
    if (currentFolderId) {
      currentFolder = await MediaFolder.findById(currentFolderId);
    }

    // Get breadcrumb path
    const breadcrumbs = await getBreadcrumbs(currentFolderId);

    res.render('pages/media/index', { 
      title: 'Media Library', 
      media, 
      folders,
      currentFolder,
      breadcrumbs,
      currentPath: req.path,
      pagination: {
        current: parseInt(page),
        total: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        next: parseInt(page) + 1,
        prev: parseInt(page) - 1
      },
      filters: { search, type, sortBy, sortOrder, tags },
      totalMedia
    });
  } catch (error) {
    console.error('Error in media index:', error);
    res.status(500).render('pages/error', { error: 'Failed to load media library' });
  }
};

// Show upload form
exports.createForm = async (req, res) => {
  try {
    const { error, success } = req.query;
    const currentFolder_id = req.query.folder || null;
    let currentFolder = null;
    
    if (currentFolder_id) {
      currentFolder = await MediaFolder.findById(currentFolder_id);
    }

    // Get all folders for folder selection
    const allFolders = await MediaFolder.find().sort({ name: 1 });
    
    res.render('pages/media/create', { 
      title: 'Upload Media', 
      currentPath: req.path, 
      error, 
      success, 
      currentFolder,
      allFolders
    });
  } catch (error) {
    console.error('Error in createForm:', error);
    res.status(500).render('pages/error', { error: 'Failed to load upload form' });
  }
};

// Upload new media (enhanced)
exports.create = async (req, res) => {
  try {
    const { type, title, description, folder, tags: tagsString, isPublic } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).redirect('/media/new?error=' + encodeURIComponent('No file uploaded'));
    }

    // Process tags
    let tags = [];
    if (tagsString && typeof tagsString === 'string') {
      tags = tagsString.split(',').map(t => t.trim()).filter(Boolean);
    }

    // Create media record with enhanced metadata
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
      uploadedBy: req.session && req.session.adminId ? req.session.adminId : null,
      isPublic: isPublic === 'on' || isPublic === true,
    };

    const media = await Media.create(mediaData);

    // Update folder statistics
    if (folder) {
      await updateFolderStats(folder);
    }

    // Redirect with success message
    const redirectUrl = folder ? `/media?folder=${folder}&success=1` : '/media?success=1';
    res.redirect(redirectUrl);
  } catch (err) {
    console.error('Upload failed:', err);
    const errorMsg = err.message || 'Upload failed';
    res.status(500).redirect('/media/new?error=' + encodeURIComponent(errorMsg));
  }
};

// Bulk upload
exports.bulkCreate = async (req, res) => {
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
          uploadedBy: req.session && req.session.adminId ? req.session.adminId : null,
          isPublic: isPublic === 'on' || isPublic === true,
        };

        const media = await Media.create(mediaData);
        uploadedMedia.push(media);
      } catch (error) {
        errors.push({ filename: file.originalName, error: error.message });
      }
    }

    // Update folder statistics
    if (folder) {
      await updateFolderStats(folder);
    }

    res.json({ 
      success: true, 
      uploaded: uploadedMedia.length, 
      errors: errors.length,
      details: { uploadedMedia, errors }
    });
  } catch (error) {
    console.error('Bulk upload failed:', error);
    res.status(500).json({ error: 'Bulk upload failed' });
  }
};

// Show single media
exports.show = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id)
      .populate('uploadedBy', 'username')
      .populate('folder', 'name');
    
    if (!media) {
      return res.status(404).render('pages/error', { error: 'Media not found' });
    }

    // Update access tracking
    media.lastAccessed = new Date();
    media.downloadCount += 1;
    await media.save();

    res.render('pages/media/show', { 
      title: 'Media Details', 
      media, 
      currentPath: req.path 
    });
  } catch (error) {
    console.error('Error showing media:', error);
    res.status(500).render('pages/error', { error: 'Failed to load media' });
  }
};

// Show edit form
exports.editForm = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id).populate('folder', 'name');
    
    if (!media) {
      return res.status(404).render('pages/error', { error: 'Media not found' });
    }

    // Get all folders for folder selection
    const allFolders = await MediaFolder.find().sort({ name: 1 });
    
    res.render('pages/media/edit', { 
      title: 'Edit Media', 
      media, 
      allFolders,
      currentPath: req.path 
    });
  } catch (error) {
    console.error('Error in editForm:', error);
    res.status(500).render('pages/error', { error: 'Failed to load edit form' });
  }
};

// Update media
exports.update = async (req, res) => {
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
      isPublic: isPublic === 'on' || isPublic === true,
      updatedAt: new Date()
    };

    await Media.findByIdAndUpdate(req.params.id, updateData);
    
    res.redirect(`/media/${req.params.id}?success=1`);
  } catch (error) {
    console.error('Error updating media:', error);
    res.status(500).redirect(`/media/${req.params.id}/edit?error=` + encodeURIComponent('Update failed'));
  }
};

// Delete media
exports.delete = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Delete physical file
    const filePath = path.join(__dirname, '..', media.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await Media.findByIdAndDelete(req.params.id);

    // Update folder statistics
    if (media.folder) {
      await updateFolderStats(media.folder);
    }

    res.redirect('/media?success=1');
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).redirect('/media?error=' + encodeURIComponent('Delete failed'));
  }
};

// Bulk delete
exports.bulkDelete = async (req, res) => {
  try {
    const { mediaIds } = req.body;
    
    if (!mediaIds || !Array.isArray(mediaIds)) {
      return res.status(400).json({ error: 'Invalid media IDs' });
    }

    const media = await Media.find({ _id: { $in: mediaIds } });
    const deletedFiles = [];
    const errors = [];

    for (const item of media) {
      try {
        // Delete physical file
        const filePath = path.join(__dirname, '..', item.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        deletedFiles.push(item._id);
      } catch (error) {
        errors.push({ id: item._id, error: error.message });
      }
    }

    // Delete from database
    await Media.deleteMany({ _id: { $in: deletedFiles } });

    // Update folder statistics for affected folders
    const affectedFolders = [...new Set(media.map(m => m.folder).filter(Boolean))];
    for (const folderId of affectedFolders) {
      await updateFolderStats(folderId);
    }

    res.json({ 
      success: true, 
      deleted: deletedFiles.length, 
      errors: errors.length,
      details: { deletedFiles, errors }
    });
  } catch (error) {
    console.error('Bulk delete failed:', error);
    res.status(500).json({ error: 'Bulk delete failed' });
  }
};

// Move media to different folder
exports.move = async (req, res) => {
  try {
    const { mediaIds, targetFolder } = req.body;
    
    if (!mediaIds || !Array.isArray(mediaIds)) {
      return res.status(400).json({ error: 'Invalid media IDs' });
    }

    const media = await Media.find({ _id: { $in: mediaIds } });
    const affectedFolders = [...new Set(media.map(m => m.folder).filter(Boolean))];
    
    // Update media folder
    await Media.updateMany(
      { _id: { $in: mediaIds } },
      { folder: targetFolder || null, updatedAt: new Date() }
    );

    // Update statistics for old folders
    for (const folderId of affectedFolders) {
      await updateFolderStats(folderId);
    }

    // Update statistics for new folder
    if (targetFolder) {
      await updateFolderStats(targetFolder);
    }

    res.json({ success: true, moved: mediaIds.length });
  } catch (error) {
    console.error('Move failed:', error);
    res.status(500).json({ error: 'Move failed' });
  }
};

// Helper function to get breadcrumb navigation
async function getBreadcrumbs(folderId) {
  const breadcrumbs = [];
  let currentFolder = folderId ? await MediaFolder.findById(folderId) : null;
  
  while (currentFolder) {
    breadcrumbs.unshift({
      id: currentFolder._id,
      name: currentFolder.name
    });
    
    if (currentFolder.parent) {
      currentFolder = await MediaFolder.findById(currentFolder.parent);
    } else {
      break;
    }
  }
  
  return breadcrumbs;
}

// Helper function to update folder statistics
async function updateFolderStats(folderId) {
  try {
    const mediaCount = await Media.countDocuments({ folder: folderId, status: 'active' });
    const mediaFiles = await Media.find({ folder: folderId, status: 'active' }, 'fileSize');
    const totalSize = mediaFiles.reduce((sum, file) => sum + (file.fileSize || 0), 0);
    
    await MediaFolder.findByIdAndUpdate(folderId, {
      mediaCount,
      totalSize,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating folder stats:', error);
  }
}
