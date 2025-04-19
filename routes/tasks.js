const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const redis = require('redis');
const client = redis.createClient({ url: process.env.REDIS_URL });
client.connect();

const CACHE_KEY = 'all_tasks';

// Create Task
router.post('/', async (req, res) => {
  try {
    const task = new Task({ ...req.body });
    task.history.push({ status: task.status });
    await task.save();
    await client.del(CACHE_KEY); // Invalidate cache
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get All Tasks (cached)
router.get('/', async (req, res) => {
  const cached = await client.get(CACHE_KEY);
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  const tasks = await Task.find().sort({ priority: -1 });
  await client.set(CACHE_KEY, JSON.stringify(tasks));
  res.json(tasks);
});

// Update Task Status
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const task = await Task.findById(req.params.id).populate('dependsOn');
    if (!task) return res.status(404).send("Task not found");

    if (status === 'in_progress') {
      const depsIncomplete = task.dependsOn.some(t => t.status !== 'completed');
      if (depsIncomplete) return res.status(400).send("Dependencies not completed");
    }

    task.status = status;
    task.history.push({ status });
    await task.save();

    await client.del(CACHE_KEY);
    console.log(`🔔 Task "${task.title}" status changed to "${status}"`);
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Task
router.delete('/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    await client.del(CACHE_KEY);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
