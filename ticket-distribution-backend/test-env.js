console.log('✅ Node.js is working');
console.log('📂 Current directory:', __dirname);
console.log('🚀 Node version:', process.version);

// Test basic module loading
try {
  const mongoose = require('mongoose');
  console.log('✅ Mongoose module loaded');
} catch (e) {
  console.log('❌ Mongoose module failed:', e.message);
}

try {
  const bcrypt = require('bcryptjs');
  console.log('✅ Bcrypt module loaded');
} catch (e) {
  console.log('❌ Bcrypt module failed:', e.message);
}

// Test file system
const fs = require('fs');
const path = require('path');

console.log('📁 Checking project structure...');
const modelsPath = path.join(__dirname, 'src', 'models');
if (fs.existsSync(modelsPath)) {
  console.log('✅ Models directory exists');
  const files = fs.readdirSync(modelsPath);
  console.log('📄 Model files:', files.join(', '));
} else {
  console.log('❌ Models directory not found');
}

console.log('🏁 Environment test completed');
