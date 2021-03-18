import mongoose from 'mongoose';
import TaskModel from '../models/taskModel.js';
import CompetitionModel from '../models/competitionModel.js';
import { normalizeString } from '../utils/utils.js';

const { ObjectId } = mongoose.Types;

const runTaskCode = async (req, res) => {
  const { competition, nut } = req.params;
  const comp = await CompetitionModel.findOne({ nameNormalized: normalizeString(competition) });
  const foundTask = await TaskModel.findOne(
    {
      day: nut,
      parentCompetition: ObjectId(comp._id),
    },
  ).select('prependedCode appendedCode codeContext testCases');
  return foundTask;
};

export { runTaskCode };
