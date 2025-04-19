const Task = require('../models/Task');

async function checkOverdueTasks() {
  const now = new Date();
  const tasks = await Task.find({ status: { $ne: 'completed' } });
  for (let task of tasks) {
    if (task.dueDate < now && task.status !== 'overdue') {
      task.status = 'overdue';
      task.history.push({ status: 'overdue' });
      await task.save();
      console.log(`⚠️ Task "${task.title}" is now overdue!`);
    }
  }
}

module.exports = checkOverdueTasks;
