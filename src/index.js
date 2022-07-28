const { createApp } = require('./app');
const urlConfig = require('./config/urlConfig');

async function main() {
  const app = await createApp({
    baseURL: urlConfig.url,
    port: 5000,
  });
  app.start();
}

main();
