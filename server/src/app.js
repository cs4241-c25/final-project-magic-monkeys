import 'dotenv/config';  // loads variables from .env into process.env
import express from 'express';
import cors from 'cors';

import userRoutes from '../routes/userRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', userRoutes);

// Example route
app.get('/', (req, res) => {
  res.send('Hello from MovieMates backend!');
});

export default app;
