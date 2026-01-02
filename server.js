// server.js

'use strict';

// Core modules
const path = require('path');

// External dependencies
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const engine = require('ejs-mate');


// Load environment variables
dotenv.config();

// App initialization
const app = express();

// --------------------
// Storage Setup
// --------------------

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --------------------
// View Engine Setup
// --------------------
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --------------------
// Database Connection
// --------------------
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};
connectDB();

// --------------------
// Middleware
// --------------------

// Security
app.use(helmet({
  contentSecurityPolicy: false, // Temporarily disable CSP for debugging
}));

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));

// Compression
app.use(compression());

// Logger (only in dev)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static files - Add cache control headers
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Debugging middleware for static files
app.use((req, res, next) => {
  console.log(`Request URL: ${req.url}`);
  next();
});

// --------------------
// Session Setup
// --------------------
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Set true when using HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  })
}));

// --------------------
// Routes
// --------------------
app.use('/', require('./routes/webRoutes'));         // EJS Dashboard Routes
app.use('/api', require('./routes/apiRoutes'));   // REST APIs for Resume & Portfolio

// --------------------
// 404 Handler
// --------------------
app.use((req, res, next) => {
  res.status(404).render('404', {
    title: 'Page Not Found'
  });
});

// --------------------
// Global Error Handler
// --------------------
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// --------------------
// Server Startup
// --------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📁 Static files served from: ${path.join(__dirname, 'public')}`);
  console.log(`👀 View at: http://localhost:${PORT}`);
});
