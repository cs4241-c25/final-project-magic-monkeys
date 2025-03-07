import 'dotenv/config';  // loads variables from .env into process.env
import express from 'express';
import cors from 'cors';

import userRoutes from '../routes/userRoutes.js';
import groupRoutes from '../routes/groupRoutes.js';
import userGroupRoutes from '../routes/userGroupRoutes.js';
import movieNightScheduleRoutes from '../routes/movieNightScheduleRoutes.js'
import tierListRoutes from '../routes/tierListRoutes.js';
import watchListRoutes from '../routes/watchListRoutes.js';
import movieNightRoutes from '../routes/movieNightRoutes.js';
import reviewRoutes from "../routes/reviewRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', userRoutes);
app.use('/api', tierListRoutes);
app.use('/api', watchListRoutes);
app.use('/api', groupRoutes);
app.use('/api', userGroupRoutes);
app.use('/api', movieNightRoutes);
app.use('/api', reviewRoutes);
app.use('/api', movieNightScheduleRoutes);

// Example route
app.get('/', (req, res) => {
  res.send('Hello from MovieMates backend!');
});

export default app;
