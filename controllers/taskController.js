const mongoose = require('mongoose');
const Task = require('../models/Task');

const taskFields = [
  'title',
  'description',
  'cost',
  'hours_estimated',
  'hours_real',
  'image',
  'completed'
];

function readTaskFields(body) {
  if (body === undefined) {
    return {};
  }

  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    const error = new Error('El cos de la petició ha de ser un objecte JSON');
    error.status = 400;
    throw error;
  }

  return Object.fromEntries(
    taskFields
      .filter((field) => Object.hasOwn(body, field))
      .map((field) => [field, body[field]])
  );
}

function isValidId(id) {
  return mongoose.isObjectIdOrHexString(id);
}

exports.createTask = async (req, res) => {
  const task = new Task(readTaskFields(req.body));

  if (task.completed) {
    task.finished_at = new Date();
  }

  await task.save();
  res.status(201).json(task);
};

exports.getTasks = async (req, res) => {
  const tasks = await Task.find();
  res.status(200).json(tasks);
};

exports.getTask = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: 'L’ID de la tasca no és vàlid' });
  }

  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ message: 'Tasca no trobada' });
  }

  res.status(200).json(task);
};

exports.updateTask = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: 'L’ID de la tasca no és vàlid' });
  }

  const updates = readTaskFields(req.body);
  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ message: 'Tasca no trobada' });
  }

  const wasCompleted = task.completed;
  Object.assign(task, updates);

  if (task.completed) {
    if (!wasCompleted || !task.finished_at) {
      task.finished_at = new Date();
    }
  } else {
    task.finished_at = null;
  }

  await task.save();
  res.status(200).json(task);
};

exports.deleteTask = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: 'L’ID de la tasca no és vàlid' });
  }

  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) {
    return res.status(404).json({ message: 'Tasca no trobada' });
  }

  res.status(200).json({
    message: 'Tasca eliminada correctament',
    task
  });
};
