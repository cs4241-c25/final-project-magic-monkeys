import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// Import your routes
import userRoutes from '../routes/userRoutes.js';
import groupRoutes from '../routes/groupRoutes.js';
import userGroupRoutes from '../routes/userGroupRoutes.js';
import movieNightScheduleRoutes from '../routes/movieNightScheduleRoutes.js';
import tierListRoutes from '../routes/tierListRoutes.js';
import watchListRoutes from '../routes/watchListRoutes.js';
import movieNightRoutes from '../routes/movieNightRoutes.js';
import reviewRoutes from '../routes/reviewRoutes.js';
import userHappeningRoutes from '../routes/userHappeningRoutes.js';

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Attach your API routes
app.use('/api', userRoutes);
app.use('/api', tierListRoutes);
app.use('/api', watchListRoutes);
app.use('/api', groupRoutes);
app.use('/api', userGroupRoutes);
app.use('/api', movieNightRoutes);
app.use('/api', movieNightScheduleRoutes);
app.use('/api', reviewRoutes);
app.use('/api', userHappeningRoutes);

// Example route
app.get('/api', (req, res) => {
  res.send('Hello from MovieMates backend!');
});

/**
 * --- IMPORTANT PART FOR SERVING THE REACT APP ---
 * This path points to:  my-project/client/build
 */
const buildPath = path.join(__dirname, '..', '..', 'client', 'build');
app.use(express.static(buildPath));

/**
 * Catch-all route: any request not handled by the API
 * should serve your React app's index.html
 */
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

export default app;
