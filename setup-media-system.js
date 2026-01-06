#!/usr/bin/env node

/**
 * Media System Setup Script
 * Initializes the enhanced media management system
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Premium Media Management System...\n');

// Create necessary directories
const directories = [
  'uploads',
  'uploads/image',
  'uploads/video', 
  'uploads/audio',
  'uploads/application',
  'uploads/text',
  'public/js',
  'public/css'
];

console.log('📁 Creating directories...');
directories.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`   ✅ Created: ${dir}`);
  } else {
    console.log(`   ⏭️  Exists: ${dir}`);
  }
});

// Check if .env file exists
console.log('\n🔧 Checking environment configuration...');
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('   ⚠️  .env file not found. Creating template...');
  
  const envTemplate = `# Media Management System Configuration
MONGO_URI=mongodb://localhost:27017/media-system
SESSION_SECRET=your-super-secret-session-key-change-this-in-production
NODE_ENV=development
PORT=3000

# Optional: Cloud storage configuration (future use)
# AWS_ACCESS_KEY_ID=your-aws-access-key
# AWS_SECRET_ACCESS_KEY=your-aws-secret-key
# AWS_BUCKET_NAME=your-s3-bucket
# AWS_REGION=us-east-1

# Optional: Email configuration (future use)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
`;

  fs.writeFileSync(envPath, envTemplate);
  console.log('   ✅ Created .env template file');
  console.log('   📝 Please update the .env file with your actual configuration');
} else {
  console.log('   ✅ .env file exists');
}

// Check package.json scripts
console.log('\n📦 Checking package.json scripts...');
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const requiredScripts = {
    'dev': 'nodemon server.js',
    'start': 'node server.js',
    'setup': 'node setup-media-system.js'
  };
  
  let scriptsUpdated = false;
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }
  
  Object.entries(requiredScripts).forEach(([script, command]) => {
    if (!packageJson.scripts[script]) {
      packageJson.scripts[script] = command;
      scriptsUpdated = true;
      console.log(`   ✅ Added script: ${script}`);
    } else {
      console.log(`   ⏭️  Script exists: ${script}`);
    }
  });
  
  if (scriptsUpdated) {
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('   📝 Updated package.json');
  }
} else {
  console.log('   ⚠️  package.json not found');
}

// Create a simple test file
console.log('\n🧪 Creating test files...');
const testDir = path.join(__dirname, 'test-media');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir);
  
  // Create a simple test image (1x1 pixel PNG)
  const testImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg==', 'base64');
  fs.writeFileSync(path.join(testDir, 'test-image.png'), testImageData);
  
  // Create a test text file
  const testTextContent = 'This is a test document for the media management system.\n\nYou can upload this file to test the document upload functionality.';
  fs.writeFileSync(path.join(testDir, 'test-document.txt'), testTextContent);
  
  console.log('   ✅ Created test media files in test-media/ directory');
} else {
  console.log('   ⏭️  Test media directory exists');
}

// Display setup completion message
console.log('\n🎉 Media Management System setup complete!\n');

console.log('📋 Next steps:');
console.log('   1. Update your .env file with the correct MongoDB URI');
console.log('   2. Make sure MongoDB is running');
console.log('   3. Install dependencies: npm install');
console.log('   4. Start the development server: npm run dev');
console.log('   5. Visit http://localhost:3000/media to access the media library\n');

console.log('🔗 Quick links:');
console.log('   • Media Library: http://localhost:3000/media');
console.log('   • Upload Files: http://localhost:3000/media/new');
console.log('   • API Documentation: See MEDIA_SYSTEM_README.md\n');

console.log('📚 Features available:');
console.log('   ✅ File upload (single & bulk)');
console.log('   ✅ Drag & drop interface');
console.log('   ✅ Folder organization');
console.log('   ✅ Advanced search & filtering');
console.log('   ✅ Grid & list view modes');
console.log('   ✅ File preview & metadata');
console.log('   ✅ Bulk operations (move, delete)');
console.log('   ✅ Responsive design');
console.log('   ✅ Keyboard shortcuts\n');

console.log('🆘 Need help?');
console.log('   • Check MEDIA_SYSTEM_README.md for detailed documentation');
console.log('   • Review the troubleshooting section');
console.log('   • Ensure all dependencies are installed\n');

console.log('Happy media managing! 🎨📁🚀');