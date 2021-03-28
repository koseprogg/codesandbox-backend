const mongoose = require('mongoose');
const SubmissionModel = require('../models/submissionModel');
const CompetitionModel = require('../models/competitionModel');
const UserModel = require('../models/UserModel');

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

const getCompetitionLeaderboard = async (req, res) => {
  const { name } = req.params;

  const competition = await CompetitionModel.findOne({ name });

  if (!competition) {
    res.status(404).send();
    return;
  }

  const submissions = await SubmissionModel.aggregate([
    {
      $match: {
        $expr: {
          $and: [
            {
              $in: [
                '$parentTask',
                competition.tasks.map((task) => new ObjectId(task)),
              ],
            },
            { $gt: ['$score', 0] },
          ],
        },
      },
    },
    {
      $group: {
        _id: '$user',
        createdAt: { $first: '$createdAt' },
        score: { $sum: '$score' },
      },
    },
    {
      $match: {
        score: { $gt: 0 },
      },
    },
    {
      $lookup: {
        from: 'users',
        let: { task_id: '$_id' },
        pipeline: [
          {
            $match: { $expr: { $eq: ['$_id', '$$task_id'] } },
          },
          {
            $project: {
              username: 1,
              profilePicture: 1,
              lastName: 1,
              firstName: 1,
            },
          },
        ],
        as: 'users',
      },
    },
    {
      $unwind: '$users',
    },
    { $sort: { score: -1, createdAt: 1 } },
  ]);

  res.status(200).send(submissions);
};

const getTaskLeaderboard = async (req, res) => {
  const { name, day } = req.params;

  const competition = await CompetitionModel.findOne({ name }).populate({
    path: 'tasks',
    match: { day },
    select: '_id',
  });

  if (!competition) {
    res.status(404).send();
    return;
  }

  const submissions = await SubmissionModel.aggregate([
    { $match: { parentTask: new ObjectId(competition.tasks[0]._id) } },
    { $match: { score: { $gt: 0 } } },
    { $sort: { score: -1 } },
    {
      $group: {
        _id: '$user',
        createdAt: { $first: '$createdAt' },
        score: { $first: '$score' },
      },
    },
    {
      $lookup: {
        from: 'users',
        let: { task_id: '$_id' },
        pipeline: [
          {
            $match: { $expr: { $eq: ['$_id', '$$task_id'] } },
          },
          {
            $project: {
              username: 1,
              profilePicture: 1,
              lastName: 1,
              firstName: 1,
            },
          },
        ],
        as: 'users',
      },
    },
    {
      $unwind: '$users',
    },
    { $sort: { score: -1, createdAt: 1 } },
  ]);

  res.status(200).send(submissions);
};

module.exports = {
  saveSubmission,
  getTaskSubmissionsByUser,
  getCompetitionLeaderboard,
  getTaskLeaderboard,
};
