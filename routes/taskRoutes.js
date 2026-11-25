const express = require('express');
const taskController = require('../controllers/taskController');

// El controlador conté la lògica i aquest router associa cada mètode i ruta.
const router = express.Router();

router.post('/', taskController.createTask);
router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
