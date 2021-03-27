import mongoose from 'mongoose';
import TaskModel from '../models/taskModel.js';
import CompetitionModel from '../models/competitionModel.js';
import { normalizeString } from '../utils/utils.js';

const { ObjectId } = mongoose.Types;

const getTask = async (req) => {
  const { name, day } = req.params;
  const comp = await CompetitionModel.findOne({ nameNormalized: normalizeString(name) });
  const foundTask = await TaskModel.findOne(
    {
      day,
      parentCompetition: ObjectId(comp._id),
    },
  ).select('prependedCode appendedCode codeContext testCases _id');
  return foundTask;
};

export { getTask };
