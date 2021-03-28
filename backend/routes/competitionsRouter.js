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
  runCodeForNut,
} = require('../controllers/competitionController');

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

router.get('/:name/day/:day/submissions', ensureAuth, (req, res) => {
  getTaskSubmissionsByUser(req, res);
});

router.get('/:name/leaderboard', ensureAuth, (req, res) => {
  getCompetitionLeaderboard(req, res);
});

router.get('/:name/day/:day/leaderboard', ensureAuth, (req, res) => {
  getTaskLeaderboard(req, res);
});

router.post('/:name/day/:day', async (req, res) => {
  runCodeForNut(req, res);
});

const competitionsRouter = router;

module.exports = competitionsRouter;
