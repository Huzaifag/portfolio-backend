const MediaFolder = require('../models/MediaFolder');
const Media = require('../models/Media');

// List folders and media in a folder (or root)
exports.folderView = async (req, res) => {
  const folderId = req.params.folderId || null;
  const folders = await MediaFolder.find({ parent: folderId });
  const media = await Media.find({ folder: folderId });
  let currentFolder = null;
  if (folderId) currentFolder = await MediaFolder.findById(folderId);
  res.render('pages/media/index', {
    title: 'Media Library',
    folders,
    media,
    currentFolder,
    currentPath: req.path
  });
};

// Create new folder
exports.createFolder = async (req, res) => {
  const { name, parent } = req.body;
  await MediaFolder.create({ name, parent: parent || null });
  res.redirect(parent ? `/media/folder/${parent}` : '/media');
};

// Rename folder
exports.renameFolder = async (req, res) => {
  const { name } = req.body;
  await MediaFolder.findByIdAndUpdate(req.params.folderId, { name });
  res.redirect('back');
};

// Delete folder (and optionally all media inside)
exports.deleteFolder = async (req, res) => {
  const folderId = req.params.folderId;
  await MediaFolder.findByIdAndDelete(folderId);
  await Media.deleteMany({ folder: folderId });
  await MediaFolder.deleteMany({ parent: folderId }); // delete subfolders
  res.redirect('/media');
};
