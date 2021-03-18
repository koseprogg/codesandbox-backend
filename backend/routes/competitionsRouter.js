import express from 'express';
import { VM } from 'vm2';
import CompetitionModel from '../models/competitionModel.js';
import TaskModel from '../models/taskModel.js';
import { runTaskCode } from '../controllers/nutController.js';
import { normalizeString } from '../utils/utils.js';

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
    .populate('tasks', 'name description image prize')
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

  CompetitionModel.find({ nameNormalized: normalizeString(name) })
    .select('name tasks')
    .populate({
      path: 'tasks',
      match: { day: parseInt(day, 10) },
      select: 'name description image prize subtasks',
    })
    .then((tasks) => res.json(tasks))
    .catch(() => res.status(400).send('Something went wrong.'));
});

router.post('/nuts/:competition/:nut', async (req, res) => {
  console.log('FIRE');
  const { code } = req.body;
  const task = await runTaskCode(req, res);
  const {
    context, testCases, prependedCode, appendedCode,
  } = task;

  const vm = new VM();

  let stacktrace = '';
  let results = null;
  try {
    vm.run(prependedCode);
    vm.run(code);
    vm.run(appendedCode);

    results = testCases.map((testCase) => {
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

  res.status(200).send({
    result: results,
    msg: stacktrace.toString(),
  });
});

const competitionsRouter = router;

export default competitionsRouter;
