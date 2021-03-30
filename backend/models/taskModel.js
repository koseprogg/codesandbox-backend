const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const TaskSchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    day: Number,
    name: String,
    description: String,
    testCases: [
      {
        testCode: String,
        weight: Number,
        correctAnswer: String,
        testDescription: String,
      },
    ],
    prize: String,
    codeContext: [
      {
        key: String,
        value: String,
      },
    ],
    image: String,
    prependedCode: String,
    appendedCode: String,
    parentCompetition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'competitions',
    },
  },
  {
    autoCreate: true,
  },
);

const TaskModel = model('tasks', TaskSchema);

module.exports = TaskModel;
