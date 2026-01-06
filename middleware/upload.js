const multer = require('multer');
const path = require('path');
const fs = require('fs');

// File type validation
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'video/mp4': 'mp4',
    'video/mpeg': 'mpeg',
    'video/quicktime': 'mov',
    'video/x-msvideo': 'avi',
    'video/webm': 'webm',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
    'audio/mp4': 'm4a',
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'text/plain': 'txt',
    'text/csv': 'csv',
    'application/zip': 'zip',
    'application/x-rar-compressed': 'rar',
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed. Allowed types: ${Object.keys(allowedTypes).join(', ')}`), false);
  }
};

// Enhanced local storage configuration
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    
    // Create subdirectories based on file type
    const fileType = file.mimetype.split('/')[0]; // image, video, audio, application, text
    const typeDir = path.join(uploadDir, fileType);
    
    // Create directories if they don't exist
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    if (!fs.existsSync(typeDir)) fs.mkdirSync(typeDir, { recursive: true });
    
    cb(null, typeDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1E9);
    const filename = `${timestamp}-${randomSuffix}-${sanitizedName}${ext}`;
    cb(null, filename);
  },
});

// File size limits (in bytes)
const limits = {
  fileSize: 100 * 1024 * 1024, // 100MB max file size
  files: 10, // Max 10 files at once for bulk upload
};

// Enhanced multer configuration
const upload = multer({ 
  storage: localStorage,
  fileFilter: fileFilter,
  limits: limits,
});

// Middleware to extract file metadata
const extractMetadata = (req, res, next) => {
  if (req.file) {
    const file = req.file;
    
    // Add metadata to the file object
    file.originalName = file.originalname;
    file.mimeType = file.mimetype;
    file.fileSize = file.size;
    
    // Determine file type category
    if (file.mimetype.startsWith('image/')) {
      file.typeCategory = 'image';
    } else if (file.mimetype.startsWith('video/')) {
      file.typeCategory = 'video';
    } else if (file.mimetype.startsWith('audio/')) {
      file.typeCategory = 'audio';
    } else if (file.mimetype === 'application/pdf' || 
               file.mimetype.includes('document') || 
               file.mimetype.includes('presentation') || 
               file.mimetype.includes('spreadsheet') ||
               file.mimetype === 'text/plain') {
      file.typeCategory = 'document';
    } else {
      file.typeCategory = 'other';
    }
    
    // Update the URL to include the subdirectory
    const relativePath = path.relative(path.join(__dirname, '..'), file.path);
    file.url = '/' + relativePath.replace(/\\/g, '/'); // Ensure forward slashes for URLs
  }
  
  next();
};

// Export both upload middleware and metadata extractor
module.exports = {
  upload,
  extractMetadata,
  single: (fieldName) => [upload.single(fieldName), extractMetadata],
  multiple: (fieldName, maxCount = 10) => [upload.array(fieldName, maxCount), extractMetadata],
};