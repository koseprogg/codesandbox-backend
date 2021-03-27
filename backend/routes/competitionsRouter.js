import express from 'express';
import { VM } from 'vm2';
import CompetitionModel from '../models/competitionModel.js';
import TaskModel from '../models/taskModel.js';
import { getTask } from '../controllers/nutController.js';
import { normalizeString } from '../utils/utils.js';
import { saveSubmission, getTaskSubmissionsByUser } from '../controllers/submissionController.js';

const router = express.Router();

// const endpoint = 'competitions';

router.get('/', (req, res) => {
  CompetitionModel.find({})
    .select('name isActive image')
    .then((competitions) => res.json(competitions))
    .catch(() => res.status(400).send('Something went wrong.'));
});

router.get('/:name', (req, res) => {
  const { name } = req.params;

  CompetitionModel.findOne({ nameNormalized: normalizeString(name) })
    .select('name isActive image tasks')
    .populate('tasks', 'name day description subtasks image prize')
    .then((tasks) => res.json(tasks))
    .catch(() => res.status(400).send('Something went wrong.'));
});

router.get('/:name/', (req, res) => {
  const { name } = req.params;

  CompetitionModel.find({ nameNormalized: normalizeString(name) })
    .select('name tasks')
    .populate('tasks', 'name description image prize')
    .sort('-day')
    .then((tasks) => res.json(tasks))
    .catch(() => res.status(400).send('Something went wrong.'));
});

router.get('/:name/day/:day', (req, res) => {
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
});
// .populate('tasks', 'name day description subtasks image prize')

router.post('/:name/day/:day', async (req, res) => {
  const { code } = req.body;
  const task = await getTask(req);
  const {
    context, testCases, prependedCode, appendedCode, _id,
  } = task;

  const vm = new VM();

  let stacktrace = '';
  let testResults = [];
  try {
    vm.run(prependedCode);
    vm.run(code);
    vm.run(appendedCode);

    testResults = testCases.map((testCase) => {
      const testResult = vm.run(testCase.testCode);

      if (testResult === testCase.correctAnswer) {
        return ({
          testDescription: testCase.testDescription,
          achievedWeight: testCase.weight,
          success: true,
          yourOutput: JSON.stringify(testResult),
        });
      }
      return ({
        testDescription: testCase.testDescription,
        achievedWeight: 0,
        success: false,
        yourOutput: JSON.stringify(testResult),
      });
    });
  } catch (e) {
    stacktrace = e;
    console.log(e);
  }

  let score = 0;
  testResults.forEach((testResult) => score += testResult.achievedWeight);

  await saveSubmission(
    req.user || 'testUser',
    code,
    score,
    _id,
  );

  res.status(200).send({
    result: testResults,
    msg: stacktrace.toString(),
  });
});

const competitionsRouter = router;

export default competitionsRouter;
