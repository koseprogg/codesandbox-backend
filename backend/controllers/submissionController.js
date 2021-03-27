import mongoose from 'mongoose';
import SubmissionModel from '../models/submissionModel.js';
import CompetitionModel from '../models/competitionModel.js';

const { ObjectId } = mongoose.Types;

const saveSubmission = async (submittingUser, submittedCode, achievedScore, taskId) => {
  const submission = new SubmissionModel({
    _id: new ObjectId(),
    parentTask: new ObjectId(taskId),
    submittedCode,
    score: achievedScore,
    submissionDate: new Date(),
    user: submittingUser,
  });
  const createdSubmission = await submission.save();
  return createdSubmission;
};

const getTaskSubmissionsByUser = async (req, res) => {
  // const { user } = req.headers;
  // const { name, day } = req.params;
  const name = 'Påskenøtt';
  const day = 6;

  const competition = await CompetitionModel
    .findOne({ name })
    .populate({
      path: 'tasks',
      match: { day },
      select: '_id',
    });

  const submissions = await SubmissionModel.find({
    parentTask: competition.tasks[0]._id,
    user: 'testUser',
  });

  res.status(200).send(submissions);
};

export { saveSubmission, getTaskSubmissionsByUser };
