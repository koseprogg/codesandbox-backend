const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const LANGS = {
  JAVASCRIPT: 'javascript',
  JAVA: 'java',
};

const TaskSchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    day: Number,
    name: String,
    description: String,
    languages: [
      {
        type: String,
        enum: Object.keys(LANGS),
      },
    ],
    testCases: [
      {
        testCode: String,
        weight: Number,
        correctAnswer: String,
        testDescription: String,
      },
    ],
    fixture: String,
    prize: String,
    codeContext: [
      {
        key: String,
        value: String,
      },
    ],
    image: String,
    prependedCode: String,
    forbiddenRegexes: [String],
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
module.exports.LANGS = LANGS;
