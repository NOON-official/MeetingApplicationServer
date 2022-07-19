const { createApp } = require('./app');

async function main() {
  const app = await createApp({
    baseURL: 'http://localhost:5000',
    port: 5000,
  });
  app.start();
}

main();
