const mongoose = require('mongoose');
const { normalizeString } = require('../utils/utils');

const TaskModel = require('../models/taskModel');
const CompetitionModel = require('../models/competitionModel');

const { ObjectId } = mongoose.Types;

const getTask = async (req) => {
  const { name, day } = req.params;
  const comp = await CompetitionModel.findOne({
    nameNormalized: normalizeString(name),
  });
  const foundTask = await TaskModel.findOne({
    day,
    parentCompetition: ObjectId(comp._id),
  }).select('prependedCode appendedCode codeContext forbiddenRegexes testCases _id');
  return foundTask;
};

module.exports = { getTask };
