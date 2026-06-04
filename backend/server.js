const dotenv = require('dotenv');

dotenv.config();

const app = require('./app');
const { verifyDatabaseConnection } = require('./database/connection');

const port = Number(process.env.PORT || 5000);

async function startServer() {
  try {
    await verifyDatabaseConnection();
    console.log('MySQL connection check passed');
  } catch (error) {
    console.warn(`MySQL connection check failed: ${error.message}`);
  }

  app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
  });
}

startServer();
