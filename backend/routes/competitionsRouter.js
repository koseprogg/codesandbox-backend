const express = require('express');
const { ensureAuth } = require('../utils/auth');
const {
  getTaskSubmissionsByUser,
  getTaskLeaderboard,
  getCompetitionLeaderboard,
} = require('../controllers/submissionController');
const {
  getAllCompetitions,
  getCompetitionByName,
  getNutByCompetitionNameAndDay,
  getNutByName,
  runCodeForNut,
} = require('../controllers/competitionController');
const { ensureLegalCode } = require('../utils/codeValidation');

const router = express.Router();

// const endpoint = 'competitions';

router.get('/', (req, res) => {
  getAllCompetitions(req, res);
});

router.get('/:name', (req, res) => {
  getCompetitionByName(req, res);
});

router.get('/:name/day/:day', (req, res) => {
  getNutByCompetitionNameAndDay(req, res);
});

router.get('/:name/leaderboard', ensureAuth, (req, res) => {
  getCompetitionLeaderboard(req, res);
});

router.get('/:name/:taskname', (req, res) => {
  getNutByName(req, res);
});

router.get('/:name/:taskname/submissions', ensureAuth, (req, res) => {
  getTaskSubmissionsByUser(req, res);
});

router.get('/:name/:taskname/leaderboard', ensureAuth, (req, res) => {
  getTaskLeaderboard(req, res);
});

router.post('/:name/:taskname', ensureLegalCode, async (req, res) => {
  runCodeForNut(req, res);
});

const competitionsRouter = router;

module.exports = competitionsRouter;
