const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Gestor de tasques en funcionament!' });
});

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

  console.error('Error inesperat:', error.message);
  res.status(500).json({ message: 'Error intern del servidor' });
});

module.exports = app;
