/* eslint-disable no-return-assign */
const { VM } = require('vm2');

const CompetitionModel = require('../models/competitionModel');
const { getTask } = require('./nutController');
const { normalizeString } = require('../utils/utils');
const { saveSubmission } = require('./submissionController');

const getAllCompetitions = (req, res) => {
  CompetitionModel.find({})
    .select('name isActive image')
    .then((competitions) => res.json(competitions))
    .catch(() => res.status(400).send('Something went wrong.'));
};

const getCompetitionByName = (req, res) => {
  const { name } = req.params;

  CompetitionModel.findOne({ nameNormalized: normalizeString(name) })
    .select('name isActive image tasks')
    .populate('tasks', 'name day description subtasks image prize')
    .sort('-day')
    .then((tasks) => res.json(tasks))
    .catch(() => res.status(400).send('Something went wrong.'));
};

const getNutByCompetitionNameAndDay = (req, res) => {
  const { day, name } = req.params;

  CompetitionModel.findOne({ nameNormalized: normalizeString(name) })
    .select('name tasks')
    .populate({
      path: 'tasks',
      match: { day: parseInt(day, 10) },
      select: 'name day description subtasks image prize',
    })
    .then((tasks) => res.json(tasks))
    .catch(() => res.status(400).send('Something went wrong.'));
};

const runCodeForNut = async (req, res) => {
  const { code } = req.body;
  const task = await getTask(req);
  const {
    testCases, prependedCode, appendedCode, _id,
  } = task;

  let stacktrace = '';
  let testResults = [];
  let totalPossibleWeight = 0;
  testCases.forEach((testCase) => (totalPossibleWeight += testCase.weight));

  testResults = testCases.map((testCase) => {
    try {
      const vm = new VM({
        timeout: 10000,
      });
      vm.run(prependedCode);
      vm.run(code);
      vm.run(appendedCode);
      const testResult = vm.run(testCase.testCode);

      // TODO FIXME
      const correctAnswer = JSON.parse(testCase.correctAnswer);

      if (testResult === correctAnswer) {
        return {
          testDescription: testCase.testDescription,
          achievedWeight: testCase.weight,
          success: true,
          yourOutput: JSON.stringify(testResult),
        };
      }
      return {
        testDescription: testCase.testDescription,
        achievedWeight: 0,
        success: false,
        yourOutput: JSON.stringify(testResult),
      };
    } catch (e) {
      stacktrace = e;
      return {
        testDescription: testCase.testDescription,
        achievedWeight: 0,
        success: false,
        yourOutput: '',
      };
    }
  });

  let totalAchievedWeight = 0;
  testResults.forEach((testResult) => {
    totalAchievedWeight += testResult.achievedWeight;
  });

  const score = Math.floor((totalAchievedWeight / totalPossibleWeight) * 100);

  if (req.user) {
    await saveSubmission(req.user, code, totalAchievedWeight, _id);
  }

  res.status(200).send({
    result: {
      score,
      possibleScore: totalPossibleWeight,
      achievedScore: totalAchievedWeight,
    },
    msg: stacktrace.toString(),
  });
};

module.exports = {
  getAllCompetitions,
  getCompetitionByName,
  getNutByCompetitionNameAndDay,
  runCodeForNut,
};
