const mongoose = require('mongoose');
const { normalizeString } = require('../utils/utils');

const TaskModel = require('../models/taskModel');
const CompetitionModel = require('../models/competitionModel');

const { ObjectId } = mongoose.Types;

const getTask = async (req) => {
  const { name, taskname } = req.params;
  const comp = await CompetitionModel.findOne({
    nameNormalized: normalizeString(name),
  });
  const foundTask = await TaskModel.findOne({
    name: taskname,
    parentCompetition: ObjectId(comp._id),
  });
  return foundTask;
};

module.exports = { getTask };
