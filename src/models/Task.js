const mongoose = require('mongoose');

/**
 * Task Schema Definition
 * - title: Required string with automatic whitespace trimming
 * - description: Required string with automatic whitespace trimming
 * - status: Enum restricted to ['pending', 'in-progress', 'completed'] with default 'pending'
 * - priority: Enum restricted to ['low', 'medium', 'high'] with default 'medium'
 * - dueDate: Optional date field
 * - createdAt / updatedAt: Auto-managed by Mongoose timestamps
 */
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'in-progress', 'completed'],
      message: '{VALUE} is not a valid status. Allowed values are: pending, in-progress, completed'
    },
    default: 'pending'
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: '{VALUE} is not a valid priority. Allowed values are: low, medium, high'
    },
    default: 'medium'
  },
  dueDate: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
