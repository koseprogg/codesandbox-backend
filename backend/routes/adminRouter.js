import express from 'express';
import mongoose from 'mongoose';
import CompetitionModel from '../models/competitionModel.js';
import TaskModel from '../models/taskModel.js';
import { normalizeString } from '../utils/utils.js';

const router = express.Router();
const { ObjectId } = mongoose.Types;

router.post('/competitions', async (req, res) => {
  const { competitionDetails } = req.body;

  const existingCompetition = await CompetitionModel.find({ name: competitionDetails.name });
  if (existingCompetition.length === 0) {
    competitionDetails._id = new ObjectId();
    competitionDetails.nameNormalized = normalizeString(competitionDetails.name);
    const competition = new CompetitionModel(competitionDetails);
    const created = await new CompetitionModel(competition).save();
    res.status(200).send(created);
  } else {
    res.status(409).send({ message: 'Name already taken' });
  }
});

router.post('/competitions/:names/', async (req, res) => {
  const { names } = req.params;
  const { taskDetails } = req.body;

  const existingCompetition = await CompetitionModel.find({ name: names });
  if (existingCompetition.length === 0) {
    res.status(404).send('No parent competition by that name.');
  } else {
    const existingTask = await TaskModel.find({ day: taskDetails.day });
    if (existingTask.length === 0) {
      const existingCompetitionId = ObjectId(existingCompetition[0]._id);

      taskDetails._id = new ObjectId();
      taskDetails.parentCompetition = existingCompetitionId;
      const createdTask = await new TaskModel(taskDetails).save();

      await CompetitionModel.findByIdAndUpdate({ _id: existingCompetitionId },
        { $push: { tasks: createdTask._id } },
        { new: true, useFindAndModify: false });
      res.status(200).send(createdTask);
    } else {
      res.status(409).send('Task day already taken for this competition.');
    }
  }
});

const adminRouter = router;

export default adminRouter;
