require('dotenv').config();  // loads variables from .env into process.env
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Example route
app.get('/', (req, res) => {
  res.send('Hello from MovieMates backend!');
});

module.exports = app;
