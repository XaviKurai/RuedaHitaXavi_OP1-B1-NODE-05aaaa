const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

app.use(cors());
// Aquest middleware deixa el JSON rebut disponible a req.body.
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Gestor de tasques en funcionament!' });
});

// Agrupem totes les operacions de tasques sota el mateix prefix.
app.use('/api/tasks', taskRoutes);

// Aquesta resposta s'aplica només si cap ruta anterior no coincideix.
app.use((req, res) => {
  res.status(404).json({
    message: 'Ruta no trobada',
    path: req.path
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'El JSON de la petició no és vàlid' });
  }

  if (error.status === 400 || error.name === 'CastError') {
    return res.status(400).json({ message: 'Les dades de la petició no són vàlides' });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Les dades de la tasca no són vàlides',
      details: Object.values(error.errors).map((validationError) => validationError.message)
    });
  }

  console.error('Error inesperat:', error.message);
  res.status(500).json({ message: 'Error intern del servidor' });
});

module.exports = app;
