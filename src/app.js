const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const printer = require('./lib/printer');

async function createApp(config) {
  const app = express();

  // 개발용 라이브러리
  if (process.env.NODE_ENV !== 'production') {
    const swaggerUi = require('swagger-ui-express');
    const swaggerDocument = require('./lib/swagger');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));
  }

  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }
  app.use(cors());

  app.use(express.json());

  app.use('/api', require('./endpoint'));

  app.use('*', (req, res) => {
    res.status(404).json({ message: '올바르지 않은 경로입니다.' });
  });
  app.use(defaultErrorHandler());

  function start() {
    printer.info('#######################################');
    printer.info('       Meeting Application Server      ');
    printer.info('#######################################');

    app
      .listen(config.port, () => {
        printer.info(`서버를 시작했습니다. [${config.baseURL}]`);
      })
      .on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          printer.error(`서버 시작에 실패했습니다. ${config.port}번 포트를 다른 프로그램이 사용중입니다.`);
        } else {
          printer.error(err);
        }
      });
  }

  return {
    start,
  };
}

function defaultErrorHandler() {
  return (err, req, res, next) => {
    res.status(500).json({ message: err.toString() });
    throw err;
  };
}

module.exports = { createApp };
