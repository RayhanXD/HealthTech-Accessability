require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  console.log('🔍 Testing MongoDB Connection...\n');
  
  // Check if MONGODB_URI exists
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set in .env file');
    process.exit(1);
  }
  
  // Mask password in connection string for display
  const maskedUri = process.env.MONGODB_URI.replace(/:[^:@]+@/, ':****@');
  console.log('📋 Connection String (masked):', maskedUri);
  console.log('📋 Connection String length:', process.env.MONGODB_URI.length);
  
  // Check connection string format
  if (!process.env.MONGODB_URI.startsWith('mongodb://') && !process.env.MONGODB_URI.startsWith('mongodb+srv://')) {
    console.error('❌ Invalid connection string format. Must start with mongodb:// or mongodb+srv://');
    process.exit(1);
  }
  
  // Extract username and database from connection string
  try {
    const match = process.env.MONGODB_URI.match(/mongodb\+?srv?:\/\/([^:]+):([^@]+)@(.+?)\/([^?]+)/);
    if (match) {
      const [, username, password, host, database] = match;
      console.log('📋 Username:', username);
      console.log('📋 Password length:', password.length);
      console.log('📋 Host:', host);
      console.log('📋 Database:', database || '(default)');
      
      // Check for common password issues
      const specialChars = /[@#%$&+:;=?[\]{}|\\\/<>'"]/;
      if (specialChars.test(password) && !password.includes('%')) {
        console.error('⚠️  WARNING: Password contains special characters that likely need URL encoding!');
        console.error('   Special characters found in password that need encoding:');
        console.error('   @ → %40  |  # → %23  |  % → %25  |  / → %2F');
        console.error('   ? → %3F  |  & → %26  |  = → %3D  |  + → %2B');
        console.error('   : → %3A  |  ; → %3B  |  space → %20');
        console.error('\n   To fix: Replace special characters in your password with their URL-encoded equivalents in the connection string.');
      }
    }
  } catch (e) {
    console.warn('⚠️  Could not parse connection string:', e.message);
  }
  
  console.log('\n🔌 Attempting to connect with connection options...\n');
  
  // Try with connection options
  const connectionOptions = {
    serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    socketTimeoutMS: 45000,
    family: 4, // Use IPv4, skip trying IPv6
    retryWrites: true,
    w: 'majority'
  };
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, connectionOptions);
    console.log('✅ MongoDB connected successfully!');
    console.log('📊 Database name:', mongoose.connection.name);
    console.log('📊 Ready state:', mongoose.connection.readyState);
    console.log('📊 Host:', mongoose.connection.host);
    console.log('📊 Port:', mongoose.connection.port);
    
    // Test a simple operation
    const adminDb = mongoose.connection.db.admin();
    const result = await adminDb.ping();
    console.log('✅ Ping successful:', result);
    
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.error('\n💡 Authentication error - Check:');
      console.error('   1. Username is correct');
      console.error('   2. Password is correct and URL-encoded if it contains special characters');
      console.error('   3. Database user has the correct privileges');
    } else if (error.message.includes('IP')) {
      console.error('\n💡 IP whitelist error - Check:');
      console.error('   1. Your current IP is whitelisted in MongoDB Atlas');
      console.error('   2. Network Access List allows your IP');
      console.error('   3. Wait a few minutes after adding IP for changes to propagate');
    } else if (error.message.includes('ReplicaSetNoPrimary') || error.message.includes('serverSelectionTimeoutMS')) {
      console.error('\n💡 Connection timeout/ReplicaSet error - Possible issues:');
      console.error('   1. Password contains special characters that need URL encoding');
      console.error('   2. Network/firewall blocking connection');
      console.error('   3. MongoDB Atlas cluster might be paused or unavailable');
      console.error('   4. Incorrect connection string format');
      console.error('\n🔧 Try URL-encoding your password:');
      console.error('   Replace @ with %40');
      console.error('   Replace # with %23');
      console.error('   Replace / with %2F');
      console.error('   Replace ? with %3F');
      console.error('   Replace & with %26');
      console.error('   Replace : with %3A');
      console.error('   Replace = with %3D');
      console.error('   Replace + with %2B');
      console.error('   Replace % with %25');
      console.error('   Replace spaces with %20');
    }
    
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Connection closed');
  }
}

testConnection();

