import express from 'express';
import CompetitionModel from '../models/competitionModel';
import TaskModel from '../models/taskModel';

const router = express.Router();

router.get('/competitions', (req, res) => {
  CompetitionModel.find({})
    .select('name, activeFrom activeTo image')
    .sort('-activeTo')
    .then(competitions => res.json(competitions))
    .catch(() => res.status(400).send("Something went wrong."))
});

router.get('/competitions/:name', (req, res) => {
  const {name} = req.params;

  CompetitionModel.find({name: name})
    .select('name, activeFrom activeTo image tasks')
    .populate('tasks', 'name description image prize')
    .then(tasks => res.json(tasks))
    .catch(() => res.status(400).send("Something went wrong."))
});

router.get('/competitions/:name/', (req, res) => {
  const {name} = req.params;

  CompetitionModel.find({name: name})
    .select('name, tasks')
    .populate('tasks', 'name description image prize')
    .sort('-day')
    .then(tasks => res.json(tasks))
    .catch(() => res.status(400).send("Something went wrong."))
});

router.get('/competitions/:name/day/:day', (req, res) => {
  const {day, name} = req.params;

  CompetitionModel.find({name: name})
    .select('name, tasks')
    .populate({
      path: 'tasks',
      match: {day: parseInt(day, 10)},
      select: 'name description image prize subtasks'
    })
    .then(tasks => res.json(tasks))
    .catch(() => res.status(400).send("Something went wrong."))
});

