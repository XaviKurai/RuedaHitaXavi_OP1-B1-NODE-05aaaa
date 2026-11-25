require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');

const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI;

async function iniciarServidor() {
  if (!mongoUri) {
    throw new Error('Falta definir MONGO_URI al fitxer .env');
  }

  await mongoose.connect(mongoUri);
  console.log('Connexió amb MongoDB establerta');

  const server = app.listen(port, () => {
    console.log(`Servidor en marxa al port ${port}`);
  });

  server.on('error', async (error) => {
    console.error('No s’ha pogut iniciar el servidor:', error.message);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
}

iniciarServidor().catch(async (error) => {
  console.error('No s’ha pogut iniciar l’aplicació:', error.message);
  await mongoose.disconnect();
  process.exitCode = 1;
});
