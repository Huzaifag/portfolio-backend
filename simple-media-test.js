#!/usr/bin/env node

/**
 * Simple Media System Test
 * Basic connectivity and setup verification
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Premium Media Management System...\n');

// Test server connectivity
function testServer() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3000/', (res) => {
      console.log('✅ Server is running and accessible');
      console.log(`   Status: ${res.statusCode}`);
      resolve(true);
    });
    
    req.on('error', (error) => {
      console.log('❌ Server is not accessible:', error.message);
      console.log('   Make sure the server is running: npm start');
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Server request timed out');
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Check if required files exist
function checkFiles() {
  console.log('\n📁 Checking enhanced media system files...');
  
  const requiredFiles = [
    'controllers/mediaController.js',
    'controllers/mediaFolderController.js',
    'models/Media.js',
    'models/MediaFolder.js',
    'middleware/upload.js',
    'views/pages/media/index.ejs',
    'views/pages/media/create.ejs',
    'views/pages/media/edit.ejs',
    'views/pages/media/show.ejs',
    'public/js/media-library.js',
    'public/css/media-library.css'
  ];
  
  let allFilesExist = true;
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(path.join(__dirname, file))) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ ${file} - MISSING`);
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

// Check directories
function checkDirectories() {
  console.log('\n📂 Checking upload directories...');
  
  const requiredDirs = [
    'uploads',
    'uploads/image',
    'uploads/video',
    'uploads/audio',
    'uploads/application',
    'uploads/text'
  ];
  
  requiredDirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (fs.existsSync(dirPath)) {
      console.log(`   ✅ ${dir}/`);
    } else {
      console.log(`   ⚠️  ${dir}/ - Creating...`);
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`   ✅ ${dir}/ - Created`);
    }
  });
}

// Main test function
async function runTests() {
  try {
    console.log('🚀 Premium Media Management System - Setup Verification\n');
    
    // Test 1: Check files
    const filesOk = checkFiles();
    if (!filesOk) {
      console.log('\n❌ Some required files are missing. Please ensure all files are properly created.');
      return;
    }
    
    // Test 2: Check directories
    checkDirectories();
    
    // Test 3: Test server
    console.log('\n🌐 Testing server connectivity...');
    try {
      await testServer();
    } catch (error) {
      console.log('\n⚠️  Server test failed, but files are ready.');
      console.log('   Start the server with: npm start');
      console.log('   Then access: http://localhost:3000/media');
      return;
    }
    
    console.log('\n🎉 All tests passed! Media system is ready.\n');
    
    // Display usage information
    console.log('🔐 Admin Login Information:');
    console.log('   Username: huzaifa0396715');
    console.log('   Password: lahorelahorea');
    console.log('   Login URL: http://localhost:3000/login\n');
    
    console.log('🔗 Media System Access:');
    console.log('   📚 Media Library: http://localhost:3000/media');
    console.log('   📤 Upload Files: http://localhost:3000/media/new\n');
    
    console.log('✨ Enhanced Features Available:');
    console.log('   🎨 Premium modern interface');
    console.log('   📤 Multiple upload methods (form, bulk, drag & drop)');
    console.log('   🗂️  Advanced folder organization');
    console.log('   🔍 Powerful search and filtering');
    console.log('   📋 Bulk operations (select multiple files)');
    console.log('   👁️  Rich file preview and editing');
    console.log('   📱 Responsive design for all devices');
    console.log('   ⌨️  Keyboard shortcuts for efficiency');
    console.log('   📊 File statistics and analytics\n');
    
    console.log('🎯 Quick Start Guide:');
    console.log('   1. Login with the admin credentials above');
    console.log('   2. Navigate to /media to see the enhanced interface');
    console.log('   3. Try uploading files using different methods');
    console.log('   4. Create folders and organize your media');
    console.log('   5. Use search and filters to find files quickly');
    console.log('   6. Test bulk operations by selecting multiple files');
    console.log('   7. Switch between grid and list views\n');
    
    console.log('📚 For detailed documentation, see: MEDIA_SYSTEM_README.md\n');
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Run the tests
runTests().then(() => {
  console.log('🏁 Setup verification completed. Happy media managing! 🎨📁🚀');
}).catch(error => {
  console.error('💥 Setup verification failed:', error.message);
});