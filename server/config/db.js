import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/resume_ai_pro');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('Ensure MongoDB service is running locally on port 27017, or verify your MONGODB_URI in .env');
    // We won't crash the server immediately, but we will warn the console.
  }
};

export default connectDB;
