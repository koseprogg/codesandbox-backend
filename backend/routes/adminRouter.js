const express = require('express');
const mongoose = require('mongoose');
const CompetitionModel = require('../models/competitionModel.js');
const TaskModel = require('../models/taskModel.js');
const { normalizeString } = require('../utils/utils.js');
const { ensureAdmin, ensureAuth } = require('../utils/auth.js');

const router = express.Router();
const { ObjectId } = mongoose.Types;

router.post('/competitions', ensureAdmin, async (req, res) => {
  const competitionDetails = req.body;

  const existingCompetition = await CompetitionModel.find({
    name: competitionDetails.name,
  });

  if (existingCompetition.length === 0) {
    competitionDetails._id = new ObjectId();
    competitionDetails.nameNormalized = normalizeString(
      competitionDetails.name,
    );
    const competition = new CompetitionModel(competitionDetails);
    const created = await new CompetitionModel(competition).save();
    res.status(201).send(created);
  } else {
    res.status(409).send({ message: 'Name already taken' });
  }
});

router.post('/competitions/:name/', ensureAuth, async (req, res) => {
  const { name } = req.params;
  const taskDetails = req.body;

  const existingCompetition = await CompetitionModel.find({ name }).populate(
    'allowedUsers',
  );

  if (existingCompetition.length === 0) {
    res.status(404).send('No parent competition by that name.');
  } else {
    if (
      existingCompetition.allowedUsers
      && existingCompetition.allowedUsers.length !== 0
      && existingCompetition.allowedUsers.filter(
        (user) => user.username === req.user.username,
      ).length === 0
      && !existingCompetition.allowAny
      && !req.user.isAdmin
    ) {
      res.status(403).send('User is not allowed to access this resource.');
      return;
    }

    const existingCompetitionId = ObjectId(existingCompetition[0]._id);

    taskDetails._id = new ObjectId();
    taskDetails.parentCompetition = existingCompetitionId;
    const createdTask = await new TaskModel(taskDetails).save();

    await CompetitionModel.findByIdAndUpdate(
      { _id: existingCompetitionId },
      { $push: { tasks: createdTask._id } },
      { new: true, useFindAndModify: false },
    );
    res.status(201).send(createdTask);
  }
});

const adminRouter = router;

module.exports = adminRouter;
