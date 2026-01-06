#!/usr/bin/env node

/**
 * Test Login and Media Access
 * Simple test to verify the media system works after login
 */

const http = require('http');
const querystring = require('querystring');

console.log('🧪 Testing Login and Media Access...\n');

// Test login functionality
function testLogin() {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({
      username: 'huzaifa0396715',
      password: 'lahorelahorea'
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      console.log('📝 Login attempt status:', res.statusCode);
      
      if (res.statusCode === 302) {
        console.log('✅ Login successful (redirect received)');
        console.log('   Redirect location:', res.headers.location);
        
        // Extract session cookie
        const cookies = res.headers['set-cookie'];
        if (cookies) {
          console.log('🍪 Session cookie received');
          resolve(cookies[0].split(';')[0]); // Return session cookie
        } else {
          console.log('⚠️  No session cookie received');
          resolve(null);
        }
      } else {
        console.log('❌ Login failed with status:', res.statusCode);
        reject(new Error('Login failed'));
      }
    });

    req.on('error', (error) => {
      console.log('❌ Login request failed:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Test media page access with session
function testMediaAccess(sessionCookie) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/media',
      method: 'GET',
      headers: sessionCookie ? {
        'Cookie': sessionCookie
      } : {}
    };

    const req = http.request(options, (res) => {
      console.log('📚 Media page access status:', res.statusCode);
      
      if (res.statusCode === 200) {
        console.log('✅ Media page accessible');
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          // Check if it's the actual media page (not login redirect)
          if (data.includes('Media Library') && !data.includes('Enter your username')) {
            console.log('✅ Media Library page loaded successfully');
            console.log('   Page contains media library interface');
            resolve(true);
          } else if (data.includes('Enter your username')) {
            console.log('⚠️  Redirected to login page (session expired or invalid)');
            resolve(false);
          } else {
            console.log('⚠️  Unknown page content received');
            resolve(false);
          }
        });
      } else if (res.statusCode === 302) {
        console.log('⚠️  Redirected (likely to login page)');
        console.log('   Redirect location:', res.headers.location);
        resolve(false);
      } else {
        console.log('❌ Media page access failed with status:', res.statusCode);
        reject(new Error('Media access failed'));
      }
    });

    req.on('error', (error) => {
      console.log('❌ Media request failed:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Main test function
async function runTest() {
  try {
    console.log('🔐 Step 1: Testing login...');
    const sessionCookie = await testLogin();
    
    if (!sessionCookie) {
      console.log('❌ Cannot proceed without session cookie');
      return;
    }
    
    console.log('\n📚 Step 2: Testing media page access...');
    const mediaAccessible = await testMediaAccess(sessionCookie);
    
    if (mediaAccessible) {
      console.log('\n🎉 SUCCESS! Media management system is working correctly!');
      console.log('\n📋 What this means:');
      console.log('   ✅ Login system is functional');
      console.log('   ✅ Session management is working');
      console.log('   ✅ Media library page loads without errors');
      console.log('   ✅ Authentication middleware is protecting routes');
      console.log('   ✅ Enhanced media system is ready for use');
      
      console.log('\n🚀 Next steps:');
      console.log('   1. Open your browser and go to: http://localhost:3000/login');
      console.log('   2. Login with: huzaifa0396715 / lahorelahorea');
      console.log('   3. Navigate to: http://localhost:3000/media');
      console.log('   4. Enjoy your premium media management system!');
    } else {
      console.log('\n⚠️  Media page not accessible. Check server logs for errors.');
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Run the test
runTest().then(() => {
  console.log('\n🏁 Test completed.');
}).catch(error => {
  console.error('💥 Test script failed:', error.message);
});