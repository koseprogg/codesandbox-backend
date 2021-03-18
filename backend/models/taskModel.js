import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const TaskSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  day: Number,
  name: String,
  description: String,
  subtasks: [String],
  testCases: [{
    testCode: String,
    weight: Number,
  }],
  prize: String,
  codeContext: [{
    key: String,
    value: String,
  }],
  image: String,
  prependedCode: String,
  appendedCode: String,
  parentCompetition: { type: mongoose.Schema.Types.ObjectId, ref: 'competitions' },
}, {
  collection: 'tasks',
});

const TaskModel = model('tasks', TaskSchema);

export default TaskModel;
