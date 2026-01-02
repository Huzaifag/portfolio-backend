const Admin = require('../models/Admin');

// Render login form
exports.getLogin = (req, res) => {
  res.render('pages/login', { title: 'Login', error: null, currentPath: req.path });
};

// Handle login
exports.postLogin = async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (!admin) {
    return res.render('pages/login', { title: 'Login', error: 'Invalid credentials', currentPath: req.path });
  }
  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    return res.render('pages/login', { title: 'Login', error: 'Invalid credentials', currentPath: req.path });
  }
  req.session.adminId = admin._id;
  res.redirect('/');
};

// Handle logout
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};

// Middleware to protect admin routes
exports.requireAdmin = (req, res, next) => {
  if (!req.session || !req.session.adminId) {
    return res.redirect('/login');
  }
  next();
};
