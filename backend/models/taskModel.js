import mongoose from 'mongoose';

const {Schema, model} = mongoose;

const TaskSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  description: String,
  subtasks: [String], 
  prize: String,
  codeContext: String,
  prependedCode: String,
  appendedCode: String,
  parentCompetition: {type: mongoose.Schema.Types.ObjectId, ref: 'competitions'}
}, {
  collection: 'tasks'
});

const TaskModel = model('tasks', TaskSchema);

export default TaskModel;