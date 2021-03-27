const mongoose = require('mongoose');
const SubmissionModel = require('../models/submissionModel');
const CompetitionModel = require('../models/competitionModel');

const { ObjectId } = mongoose.Types;

const saveSubmission = async (
  submittingUser,
  submittedCode,
  achievedScore,
  taskId,
) => {
  const submission = new SubmissionModel({
    _id: new ObjectId(),
    parentTask: new ObjectId(taskId),
    submittedCode,
    score: achievedScore,
    user: submittingUser,
  });
  const createdSubmission = await submission.save();
  return createdSubmission;
};

const getTaskSubmissionsByUser = async (req, res) => {
  const { name, day } = req.params;
  const { user } = req;

  const competition = await CompetitionModel.findOne({ name }).populate({
    path: 'tasks',
    match: { day },
    select: '_id',
  });

  const submissions = await SubmissionModel.find({
    parentTask: competition.tasks[0]._id,
    user,
  });

  res.status(200).send(submissions);
};

const getTaskLeaderboard = async (req, res) => {
  const { name, day } = req.params;

  const competition = await CompetitionModel.findOne({ name }).populate({
    path: 'tasks',
    match: { day },
    select: '_id',
  });

  const submissions = await SubmissionModel.aggregate([
    { $match: { parentTask: new ObjectId(competition.tasks[0]._id) } },
    {
      $group: {
        _id: '$user',
        createdAt: { $first: '$createdAt' },
        score: { $first: '$score' },
      },
    },
    { $sort: { score: -1, createdAt: 1 } },
  ]);

  res.status(200).send(submissions);
};

module.exports = {
  saveSubmission,
  getTaskSubmissionsByUser,
  getTaskLeaderboard,
};
