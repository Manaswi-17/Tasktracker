require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const redisClient = require("./redis");
const taskRoutes = require('./routes/tasks');

const app = express();
app.use(express.json());
app.use('/tasks', taskRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

module.exports = app;
