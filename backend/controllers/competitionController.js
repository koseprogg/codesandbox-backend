/* eslint-disable no-return-assign */
const { VM } = require('vm2');
const Docker = require('dockerode');
const streams = require('memory-streams');

const docker = new Docker();

const CompetitionModel = require('../models/competitionModel');
const { LANGS } = require('../models/taskModel');
const { getTask } = require('./nutController');
const { normalizeString } = require('../utils/utils');
const { canEdit } = require('../utils/auth');
const { parseCodewarriorRes } = require('../utils/codewarrior');
const { saveSubmission } = require('./submissionController');
const { userIsAllowed } = require('../routes/adminRouter');

const getAllCompetitions = (req, res) => {
  CompetitionModel.find({})
    .select('name isActive image')
    .then((competitions) => res.json(competitions))
    .catch(() => res.status(400).send('Something went wrong.'));
};

const getCompetitionByName = async (req, res) => {
  const { name } = req.params;

  const competition = await CompetitionModel.findOne({
    nameNormalized: normalizeString(name),
  })
    .select('name isActive image tasks allowAny allowedUsers')
    .populate('tasks', 'name day description image prize')
    .sort('-day')
    .populate('allowedUsers')
    .exec();
  if (!competition) {
    res.status(404).send('Not found.');
  }
  const {
    tasks, name: compN, image, allowAny, allowedUsers,
  } = competition;
  res.status(200).json({
    canEdit: !!(
      canEdit(req.user, competition)
      || userIsAllowed(req.user, allowedUsers)
      || (allowAny && req.user)
    ),
    name: compN,
    image,
    tasks,
    allowAny,
  });
};

const getNutByCompetitionNameAndDay = (req, res) => {
  const { day, name } = req.params;

  CompetitionModel.findOne({ nameNormalized: normalizeString(name) })
    .select('name tasks')
    .populate({
      path: 'tasks',
      match: { day: parseInt(day, 10) },
      select: 'name day description image prize languages',
    })
    .then((tasks) => res.json(tasks))
    .catch(() => res.status(400).send('Something went wrong.'));
};

const getNutByName = async (req, res) => {
  const { name, taskname } = req.params;

  const comp = await CompetitionModel.findOne({
    nameNormalized: normalizeString(name),
  })
    .select('name tasks createdBy')
    .populate({
      path: 'tasks',
      match: { name: taskname },
      select: 'name day description image prize languages createdBy',
      populate: {
        path: 'createdBy',
        model: 'users',
      },
    })
    .lean();

  const { name: compname, tasks } = comp;

  const pTasks = tasks.map((task) => ({
    ...task,
    canEdit: canEdit(req.user, task),
  }));

  res.json({
    name: compname,
    tasks: pTasks,
  });
};

const runCodeForNut = async (req, res) => {
  const { code, sendSubmission, language: submissionLang } = req.body;
  const task = await getTask(req);
  const {
    testCases,
    prependedCode,
    appendedCode,
    _id,
    forbiddenRegexes,
    fixture,
    totalScore,
  } = task;

  let stacktrace = '';
  let testResults = [];
  let totalPossibleWeight = 0;
  let time;
  testCases.forEach((testCase) => (totalPossibleWeight += testCase.weight));

  if (totalScore) totalPossibleWeight = totalScore;

  if (!Object.values(LANGS).includes(submissionLang)) {
    res.status(400).send({
      msg: 'Angitt språk er ikke støttet for denne oppgaven',
    });
    return;
  }

  if (forbiddenRegexes.length > 0) {
    const anyRegexMatch = forbiddenRegexes.some((regex) => new RegExp(regex).test(code));
    if (anyRegexMatch) {
      res.status(400).send({
        msg: 'Koden din følger ikke reglene satt for oppgaven!',
      });
      return;
    }
  }

  if (submissionLang === LANGS.JAVASCRIPT) {
    const timeStart = process.hrtime();
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

        // eslint-disable-next-line eqeqeq
        if (testResult == correctAnswer) {
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
        stacktrace = e.toString();
        return {
          testDescription: testCase.testDescription,
          achievedWeight: 0,
          success: false,
          yourOutput: '',
        };
      }
    });
    time = process.hrtime(timeStart)[1] / 1000000;
  } else {
    const dockerOut = new streams.WritableStream();
    const dockerErr = new streams.WritableStream();

    testResults = await docker
      .run(
        `codewars/${submissionLang}-runner`,
        [
          'run',
          '-l',
          submissionLang,
          '-c',
          code,
          '-t',
          'cw',
          '-f',
          fixture,
          '-t',
          '10',
        ],
        [dockerOut, dockerErr],
        {
          NetworkDisabled: true,
          Remove: true,
          Tty: false,
        },
      )
      .then(([, container]) => {
        container.remove();
        stacktrace = dockerErr.toString();
        const results = parseCodewarriorRes(dockerOut.toString());
        return results;
      })
      .finally(() => {
        dockerOut.end();
        dockerErr.end();
      });

    time = testResults.reduce((tot, r) => tot + (r.time || 0), 0);
  }

  let totalAchievedWeight = 0;
  testResults.forEach((testResult) => {
    totalAchievedWeight += testResult.achievedWeight || 0;
  });

  const score = Math.floor((totalAchievedWeight / totalPossibleWeight) * 100);
  const characterCount = code.length;

  if (req.user && sendSubmission !== false) {
    await saveSubmission(
      req.user,
      code,
      totalAchievedWeight,
      time,
      characterCount,
      _id,
    );
  }

  res.status(200).send({
    result: {
      score,
      possibleScore: totalPossibleWeight,
      achievedScore: totalAchievedWeight,
      characterCount,
      elapsedTimeInMilis: time,
    },
    msg: stacktrace,
  });
};

module.exports = {
  getAllCompetitions,
  getCompetitionByName,
  getNutByCompetitionNameAndDay,
  getNutByName,
  runCodeForNut,
};
