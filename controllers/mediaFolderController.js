const MediaFolder = require('../models/MediaFolder');
const Media = require('../models/Media');

// List folders and media in a folder (or root)
exports.folderView = async (req, res) => {
  try {
    const folderId = req.params.folderId || null;
    const { 
      search, 
      type, 
      sortBy = 'uploadedAt', 
      sortOrder = 'desc',
      view = 'grid' // grid or list view
    } = req.query;

    // Build filter for media
    let mediaFilter = { 
      folder: folderId,
      status: 'active'
    };
    
    if (type && type !== 'all') {
      mediaFilter.type = type;
    }
    
    if (search) {
      mediaFilter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Get folders and media
    const folders = await MediaFolder.find({ parent: folderId }).sort({ name: 1 });
    
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const media = await Media.find(mediaFilter)
      .sort(sortConfig)
      .populate('uploadedBy', 'username');

    // Get current folder info
    let currentFolder = null;
    if (folderId) {
      currentFolder = await MediaFolder.findById(folderId);
    }

    // Get breadcrumb path
    const breadcrumbs = await getBreadcrumbs(folderId);

    // Get folder statistics
    const stats = {
      totalFolders: folders.length,
      totalMedia: media.length,
      totalSize: media.reduce((sum, item) => sum + (item.fileSize || 0), 0)
    };

    // Create pagination object (even if not used in folder view)
    const pagination = {
      current: 1,
      total: 1,
      hasNext: false,
      hasPrev: false,
      next: 1,
      prev: 1
    };

    res.render('pages/media/index', {
      title: 'Media Library',
      folders,
      media,
      currentFolder,
      breadcrumbs,
      currentPath: req.path,
      filters: { search, type, sortBy, sortOrder, view },
      stats,
      pagination,
      totalMedia: media.length
    });
  } catch (error) {
    console.error('Error in folderView:', error);
    res.status(500).render('pages/error', { error: 'Failed to load folder' });
  }
};

// Create new folder
exports.createFolder = async (req, res) => {
  try {
    const { name, parent, description, color, icon } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).redirect((parent ? `/media/folder/${parent}` : '/media') + '?error=' + encodeURIComponent('Folder name is required'));
    }

    // Check for duplicate folder names in the same parent
    const existingFolder = await MediaFolder.findOne({ 
      name: name.trim(), 
      parent: parent || null 
    });
    
    if (existingFolder) {
      return res.status(400).redirect((parent ? `/media/folder/${parent}` : '/media') + '?error=' + encodeURIComponent('Folder with this name already exists'));
    }

    const folderData = {
      name: name.trim(),
      parent: parent || null,
      description: description || '',
      color: color || '#6366f1',
      icon: icon || 'folder',
      createdBy: req.session && req.session.adminId ? req.session.adminId : null,
    };

    await MediaFolder.create(folderData);
    
    const redirectUrl = parent ? `/media/folder/${parent}?success=1` : '/media?success=1';
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error creating folder:', error);
    const redirectUrl = req.body.parent ? `/media/folder/${req.body.parent}` : '/media';
    res.status(500).redirect(redirectUrl + '?error=' + encodeURIComponent('Failed to create folder'));
  }
};

// Rename folder
exports.renameFolder = async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;
    const folderId = req.params.folderId;
    
    if (!name || name.trim() === '') {
      return res.status(400).redirect('back');
    }

    const folder = await MediaFolder.findById(folderId);
    if (!folder) {
      return res.status(404).redirect('/media?error=' + encodeURIComponent('Folder not found'));
    }

    // Check for duplicate folder names in the same parent (excluding current folder)
    const existingFolder = await MediaFolder.findOne({ 
      name: name.trim(), 
      parent: folder.parent,
      _id: { $ne: folderId }
    });
    
    if (existingFolder) {
      return res.status(400).redirect('back');
    }

    const updateData = {
      name: name.trim(),
      updatedAt: new Date()
    };

    if (description !== undefined) updateData.description = description;
    if (color) updateData.color = color;
    if (icon) updateData.icon = icon;

    await MediaFolder.findByIdAndUpdate(folderId, updateData);
    
    res.redirect('back');
  } catch (error) {
    console.error('Error renaming folder:', error);
    res.status(500).redirect('back');
  }
};

// Delete folder (and optionally all media inside)
exports.deleteFolder = async (req, res) => {
  try {
    const folderId = req.params.folderId;
    const { deleteContents = 'false' } = req.body;
    
    const folder = await MediaFolder.findById(folderId);
    if (!folder) {
      return res.status(404).redirect('/media?error=' + encodeURIComponent('Folder not found'));
    }

    if (deleteContents === 'true') {
      // Delete all media in this folder and subfolders recursively
      await deleteMediaInFolderRecursive(folderId);
      
      // Delete all subfolders recursively
      await deleteFoldersRecursive(folderId);
    } else {
      // Move media to parent folder
      await Media.updateMany(
        { folder: folderId },
        { folder: folder.parent, updatedAt: new Date() }
      );
      
      // Move subfolders to parent folder
      await MediaFolder.updateMany(
        { parent: folderId },
        { parent: folder.parent, updatedAt: new Date() }
      );
    }

    // Delete the folder itself
    await MediaFolder.findByIdAndDelete(folderId);

    // Update parent folder statistics
    if (folder.parent) {
      await updateFolderStats(folder.parent);
    }

    const redirectUrl = folder.parent ? `/media/folder/${folder.parent}?success=1` : '/media?success=1';
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).redirect('/media?error=' + encodeURIComponent('Failed to delete folder'));
  }
};

// Get folder tree (API endpoint)
exports.getFolderTree = async (req, res) => {
  try {
    const folders = await MediaFolder.find().sort({ name: 1 });
    const tree = buildFolderTree(folders);
    res.json(tree);
  } catch (error) {
    console.error('Error getting folder tree:', error);
    res.status(500).json({ error: 'Failed to get folder tree' });
  }
};

// Move folder to different parent
exports.moveFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    const { targetParent } = req.body;
    
    const folder = await MediaFolder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Prevent moving folder into itself or its descendants
    if (targetParent && await isDescendant(targetParent, folderId)) {
      return res.status(400).json({ error: 'Cannot move folder into itself or its descendants' });
    }

    // Check for duplicate names in target location
    const existingFolder = await MediaFolder.findOne({
      name: folder.name,
      parent: targetParent || null,
      _id: { $ne: folderId }
    });

    if (existingFolder) {
      return res.status(400).json({ error: 'Folder with this name already exists in target location' });
    }

    await MediaFolder.findByIdAndUpdate(folderId, {
      parent: targetParent || null,
      updatedAt: new Date()
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error moving folder:', error);
    res.status(500).json({ error: 'Failed to move folder' });
  }
};

// Helper function to get breadcrumb navigation
async function getBreadcrumbs(folderId) {
  const breadcrumbs = [];
  let currentFolder = folderId ? await MediaFolder.findById(folderId) : null;
  
  while (currentFolder) {
    breadcrumbs.unshift({
      id: currentFolder._id,
      name: currentFolder.name,
      color: currentFolder.color
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

// Helper function to build folder tree
function buildFolderTree(folders, parentId = null) {
  const tree = [];
  
  folders.forEach(folder => {
    if (String(folder.parent) === String(parentId)) {
      const children = buildFolderTree(folders, folder._id);
      tree.push({
        id: folder._id,
        name: folder.name,
        color: folder.color,
        icon: folder.icon,
        mediaCount: folder.mediaCount,
        children
      });
    }
  });
  
  return tree;
}

// Helper function to delete media in folder recursively
async function deleteMediaInFolderRecursive(folderId) {
  const fs = require('fs');
  const path = require('path');
  
  // Get all media in this folder
  const media = await Media.find({ folder: folderId });
  
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
  
  // Delete media records
  await Media.deleteMany({ folder: folderId });
  
  // Get subfolders and delete their media recursively
  const subfolders = await MediaFolder.find({ parent: folderId });
  for (const subfolder of subfolders) {
    await deleteMediaInFolderRecursive(subfolder._id);
  }
}

// Helper function to delete folders recursively
async function deleteFoldersRecursive(folderId) {
  const subfolders = await MediaFolder.find({ parent: folderId });
  
  for (const subfolder of subfolders) {
    await deleteFoldersRecursive(subfolder._id);
  }
  
  await MediaFolder.deleteMany({ parent: folderId });
}

// Helper function to check if a folder is a descendant of another
async function isDescendant(potentialDescendant, ancestorId) {
  let currentFolder = await MediaFolder.findById(potentialDescendant);
  
  while (currentFolder && currentFolder.parent) {
    if (String(currentFolder.parent) === String(ancestorId)) {
      return true;
    }
    currentFolder = await MediaFolder.findById(currentFolder.parent);
  }
  
  return false;
}
