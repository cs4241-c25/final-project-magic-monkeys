const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3001;

// Connect to MongoDB
// connectDB().then(() => {
//   app.listen(PORT, '0.0.0.0', () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// }).catch((err) => {
//   console.error('Failed to connect to DB', err);
//   process.exit(1);
// });
