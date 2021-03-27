const express = require('express');
const {
  getTaskSubmissionsByUser,
  getTaskLeaderboard,
} = require( '../controllers/submissionController');
const {
  getAllCompetitions, getCompetitionByName,
  getNutByCompetitionNameAndDay, runCodeForNut,
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

router.get('/:name/day/:day/submissions', (req, res) => {
  getTaskSubmissionsByUser(req, res);
});

router.get('/:name/day/:day/leaderboard', (req, res) => {
  getTaskLeaderboard(req, res);
});

router.post('/:name/day/:day', async (req, res) => {
  runCodeForNut(req, res);
});

const competitionsRouter = router;

module.exports = competitionsRouter;
