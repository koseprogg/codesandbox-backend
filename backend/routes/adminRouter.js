const express = require('express');
const mongoose = require('mongoose');
const CompetitionModel = require('../models/competitionModel.js');
const TaskModel = require('../models/taskModel.js');
const { normalizeString } = require('../utils/utils.js');
const { ensureAdmin, ensureAuth, canEdit } = require('../utils/auth.js');

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
    competitionDetails.createdBy = ObjectId(req.user._id);
    const competition = new CompetitionModel(competitionDetails);
    const created = await new CompetitionModel(competition).save();
    res.status(201).send(created);
  } else {
    res.status(409).send({ msg: 'Name already taken' });
  }
});

const userIsAllowed = (user, allowedUsers) => allowedUsers
  && user
  && allowedUsers
  && allowedUsers.filter((u) => u._id === user.id).length !== 0;

router.post('/competitions/:name/', ensureAuth, async (req, res) => {
  const { name } = req.params;
  const taskDetails = req.body;

  const existingCompetition = await CompetitionModel.find({ name })
    .populate('allowedUsers')
    .populate('createdBy');

  if (existingCompetition.length === 0) {
    res.status(404).send({ msg: 'No parent competition by that name.' });
  } else {
    const comp = existingCompetition[0];
    if (
      !canEdit(req.user, comp)
      && !userIsAllowed(req.user, comp.allowedUsers)
      && !comp.allowAny
    ) {
      res
        .status(403)
        .send({ msg: 'User is not allowed to access this resource.' });
      return;
    }

    const existingCompetitionId = ObjectId(existingCompetition[0]._id);

    taskDetails._id = new ObjectId();
    taskDetails.parentCompetition = existingCompetitionId;
    taskDetails.createdBy = ObjectId(req.user._id);
    const createdTask = await new TaskModel(taskDetails).save();

    await CompetitionModel.findByIdAndUpdate(
      { _id: existingCompetitionId },
      { $push: { tasks: createdTask._id } },
      { new: true, useFindAndModify: false },
    );
    res.status(201).send(createdTask);
  }
});

router.get('/competitions/:name/:taskname', ensureAuth, async (req, res) => {
  const { taskname } = req.params;

  const task = await TaskModel.findOne({ name: taskname }).populate(
    'createdBy',
  );

  if (!task) {
    res.status(404);
    return;
  }
  if (!canEdit(req.user, task)) {
    res.status(403).send({ msg: 'user is not allowed to perform this action' });
    return;
  }

  res.json(task);
});

router.put('/competitions/:name/:taskname', ensureAuth, async (req, res) => {
  const { taskname } = req.params;
  const taskDetails = req.body;

  const task = await TaskModel.findOne({ name: taskname }).populate(
    'createdBy',
  );

  if (!task) {
    res.status(404);
    return;
  }
  if (!canEdit(req.user, task)) {
    res.status(403).send({ msg: 'user is not allowed to perform this action' });
  }

  await task.update(taskDetails);
  res.status(200).send(task);
});

router.delete('/competitions/:name/:taskname', ensureAuth, async (req, res) => {
  const { name, taskname } = req.params;

  const task = await TaskModel.findOne({ name: taskname }).populate(
    'createdBy',
  );
  const comp = await CompetitionModel.findOne({ name });
  if (!canEdit(req.user, task)) {
    res.status(403).send({ msg: 'User is not allowed to perform this action' });
    return;
  }
  if (!task) {
    res.status(404).send({ msg: 'cound not find task' });
    return;
  }

  await comp.tasks.pull({ _id: task._id });
  await task.delete();

  res.status(200).send({ msg: 'ok' });
});

const adminRouter = router;

module.exports = adminRouter;
module.exports.userIsAllowed = userIsAllowed;
