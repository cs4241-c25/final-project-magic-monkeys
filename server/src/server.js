import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to connect to DB', err);
  process.exit(1);
});
