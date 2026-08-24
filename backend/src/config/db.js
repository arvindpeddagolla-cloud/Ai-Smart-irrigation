import mongoose from 'mongoose';

let isMockDB = false;

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️ WARNING: MONGODB_URI not found in env. Running in Mock In-Memory Database Mode.');
    isMockDB = true;
    global.isMockDB = true;
    return null;
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`\x1b[32m%s\x1b[0m`, `❇️ MongoDB Connected: ${conn.connection.host}`);
    isMockDB = false;
    global.isMockDB = false;
    return conn;
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `❌ MongoDB connection error: ${error.message}`);
    console.warn('\x1b[33m%s\x1b[0m', '⚠️ Falling back to Mock In-Memory Database Mode.');
    isMockDB = true;
    global.isMockDB = true;
    return null;
  }
};

export const getDBStatus = () => {
  return isMockDB ? 'MOCK_IN_MEMORY' : 'MONGODB';
};
