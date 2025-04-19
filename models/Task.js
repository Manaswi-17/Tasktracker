const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  status: String,
  timestamp: {
    type: Date,
    default: Date.now,
  }
}, { _id: false });

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'overdue'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  startDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  dependsOn: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  history: [historySchema]
});

module.exports = mongoose.model('Task', taskSchema);
