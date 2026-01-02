const multer = require('multer');
// Cloudinary removed
const path = require('path');
const fs = require('fs');

// ------------------ Local storage for documents ------------------
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    cb(null, name);
  },
});


// ------------------ Multer instance (local only) ------------------
const upload = multer({ storage: localStorage });

module.exports = upload;