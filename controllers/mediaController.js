const Media = require('../models/Media');
const MediaFolder = require('../models/MediaFolder');

// List all media
exports.index = async (req, res) => {
  const media = await Media.find().sort({ uploadedAt: -1 });
  res.render('pages/media/index', { title: 'Media Library', media, currentPath: req.path });
};

// Show upload form
exports.createForm = (req, res) => {
  const { error, success } = req.query;
  console.log(req.query);
  const currentFolder_id = req.query.folder || null;
  let currentFolder = null;
  fetchCurrentFolder = async () => {
    if (currentFolder_id) {
      currentFolder = await MediaFolder.findById(currentFolder_id);
    }
  };
  fetchCurrentFolder().then(() => {
    res.render('pages/media/create', { title: 'Upload Media', currentPath: req.path, error, success, currentFolder });
  });
};

// Upload new media
exports.create = async (req, res) => {
  try {
    const { type, title, description, folder } = req.body;

    console.log('Upload request params:', req.params);

    console.log('Received upload request:', { type, title, description, folder, file: req.file });
    let tags = req.body.tags;
    if (tags && typeof tags === 'string') {
      tags = tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    const file = req.file;
    if (!file) {
      console.error('No file uploaded');
      return res.status(400).redirect('/media/new?error=No file uploaded');
    }
    if (!file.path || (!file.filename && !file.public_id)) {
      console.error('File object missing path or filename/public_id:', file);
      return res.status(500).redirect('/media/new?error=File upload failed');
    }
    console.log('File uploaded to Cloudinary:', file);
    // Set url to a public path for serving media
    const url = `/uploads/${file.filename}`;
    await Media.create({
      type,
      title,
      description,
      tags,
      folder: folder || null,
      url,
      public_id: file.filename,
      uploadedBy: req.session && req.session.adminId ? req.session.adminId : null,
    });
    if (folder) {
      res.redirect(`/media/folder/${folder}?success=1`);
    } else {
      res.redirect('/media?success=1');
    }
  } catch (err) {
    console.error('Upload failed:', err);
    const errorMsg = err && err.message ? err.message : 'Unknown error';
    res.status(500).redirect('/media/new?error=' + encodeURIComponent(errorMsg));
  }
};

// Show single media
exports.show = async (req, res) => {
  const media = await Media.findById(req.params.id);
  res.render('pages/media/show', { title: 'Media Details', media, currentPath: req.path });
};

// Show edit form
exports.editForm = async (req, res) => {
  const media = await Media.findById(req.params.id);
  res.render('pages/media/edit', { title: 'Edit Media', media, currentPath: req.path });
};

// Update media
exports.update = async (req, res) => {
  await Media.findByIdAndUpdate(req.params.id, req.body);
  res.redirect('/media');
};

// Delete media
exports.delete = async (req, res) => {
  await Media.findByIdAndDelete(req.params.id);
  res.redirect('/media');
};
