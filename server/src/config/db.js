const mongoose = require('mongoose');

async function connectDB() {
  const MONGO_URI = process.env.MONGO_URI; // e.g., 'mongodb+srv://...'
  if (!MONGO_URI) {
    throw new Error('MONGO_URI not set in .env file');
  }
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('Connected to MongoDB');
}

module.exports = connectDB;
