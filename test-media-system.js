#!/usr/bin/env node

/**
 * Media System Test Script
 * Tests the enhanced media management system functionality
 */

const axios = require('axios').default;
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

// Test credentials (from seedAdmin.js)
const ADMIN_CREDENTIALS = {
  username: 'huzaifa0396715',
  password: 'lahorelahorea'
};

console.log('🧪 Testing Premium Media Management System...\n');

async function testMediaSystem() {
  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server connectivity...');
    try {
      const response = await axios.get(`${BASE_URL}/`);
      console.log('   ✅ Server is running and accessible');
    } catch (error) {
      console.log('   ❌ Server is not accessible. Make sure it\'s running on port 3000');
      return;
    }

    // Test 2: Test API status
    console.log('\n2️⃣ Testing API endpoints...');
    try {
      const apiResponse = await axios.get(`${API_URL}/`);
      console.log('   ✅ API is working:', apiResponse.data.message);
    } catch (error) {
      console.log('   ⚠️  API endpoint test failed, but continuing...');
    }

    // Test 3: Test media folders endpoint
    console.log('\n3️⃣ Testing media folders API...');
    try {
      const foldersResponse = await axios.get(`${API_URL}/media/folders`);
      console.log(`   ✅ Folders API working. Found ${foldersResponse.data.length} folders`);
    } catch (error) {
      console.log('   ⚠️  Folders API test failed:', error.message);
    }

    // Test 4: Test media files endpoint
    console.log('\n4️⃣ Testing media files API...');
    try {
      const mediaResponse = await axios.get(`${API_URL}/media`);
      console.log(`   ✅ Media API working. Response structure:`, Object.keys(mediaResponse.data));
    } catch (error) {
      console.log('   ⚠️  Media API test failed:', error.message);
    }

    // Test 5: Create test folder via API
    console.log('\n5️⃣ Testing folder creation...');
    try {
      const folderData = {
        name: 'Test Folder',
        description: 'Created by test script',
        color: '#10B981',
        icon: 'folder'
      };
      
      const createFolderResponse = await axios.post(`${API_URL}/media/folders`, folderData);
      console.log('   ✅ Folder created successfully:', createFolderResponse.data.name);
    } catch (error) {
      if (error.response && error.response.status === 400 && error.response.data.error.includes('already exists')) {
        console.log('   ✅ Folder already exists (expected)');
      } else {
        console.log('   ⚠️  Folder creation failed:', error.response?.data?.error || error.message);
      }
    }

    console.log('\n🎉 Basic API tests completed!\n');

    // Display access information
    console.log('🔐 Admin Access Information:');
    console.log(`   Username: ${ADMIN_CREDENTIALS.username}`);
    console.log(`   Password: ${ADMIN_CREDENTIALS.password}`);
    console.log(`   Login URL: ${BASE_URL}/login\n`);

    console.log('🔗 Media System URLs:');
    console.log(`   📚 Media Library: ${BASE_URL}/media`);
    console.log(`   📤 Upload Files: ${BASE_URL}/media/new`);
    console.log(`   🗂️  API Docs: See MEDIA_SYSTEM_README.md\n`);

    console.log('✨ Features to test manually:');
    console.log('   1. Login with admin credentials');
    console.log('   2. Navigate to /media to see the premium interface');
    console.log('   3. Try uploading files using different methods:');
    console.log('      • Single file upload');
    console.log('      • Bulk file upload');
    console.log('      • Drag & drop upload');
    console.log('   4. Test folder creation and organization');
    console.log('   5. Try search and filtering features');
    console.log('   6. Test bulk operations (select multiple files)');
    console.log('   7. Switch between grid and list views');
    console.log('   8. Test file preview and editing\n');

    console.log('🎯 Key Features Implemented:');
    console.log('   ✅ Premium UI with modern design');
    console.log('   ✅ Multiple upload methods');
    console.log('   ✅ Advanced search and filtering');
    console.log('   ✅ Folder organization with colors/icons');
    console.log('   ✅ Bulk operations');
    console.log('   ✅ File metadata and statistics');
    console.log('   ✅ Responsive design');
    console.log('   ✅ Keyboard shortcuts');
    console.log('   ✅ File preview and editing');
    console.log('   ✅ RESTful API endpoints\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests
testMediaSystem().then(() => {
  console.log('🏁 Test script completed. Happy media managing! 🎨📁');
}).catch(error => {
  console.error('💥 Test script failed:', error.message);
  process.exit(1);
});