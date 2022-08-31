const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { createApp } = require('./app');
const urlConfig = require('./config/urlConfig');

async function main() {
  const app = await createApp({
    baseURL: urlConfig.serverUrl,
    port: 5000,
  });
  app.start();
}

main();
