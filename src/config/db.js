import mongoose from 'mongoose';

async function connectDB() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/rest_api_db';
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

mongoose.connection.on('error', (err) => {
  console.error('Unexpected MongoDB connection error:', err);
});

export default connectDB;
