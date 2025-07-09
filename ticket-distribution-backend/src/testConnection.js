const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('🔍 Testing MongoDB connection...');
    
    await mongoose.connect('mongodb://localhost:27017/ticket-distribution', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ MongoDB connected successfully!');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    console.log('Port:', mongoose.connection.port);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 Available collections:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    mongoose.connection.close();
    console.log('\n✅ Connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Check if MongoDB is accessible on localhost:27017');
    console.log('3. Try running: mongod --dbpath /path/to/your/db');
  }
}

testConnection();
