import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('Using existing database connection');
      return;
    }

    const db = await mongoose.connect(process.env.MONGODB_URL, {
      dbName: 'artwall',
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('MongoDB connected successfully to database:', db.connection.name);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};

// Handle connection events
mongoose.connection.on('connected', () => console.log('Mongoose connected to DB'));
mongoose.connection.on('error', (err) => console.error('Mongoose connection error:', err));
mongoose.connection.on('disconnected', () => console.log('Mongoose disconnected'));