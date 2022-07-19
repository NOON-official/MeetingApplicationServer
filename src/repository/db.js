const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const dbConfig = require('./dbConfig');

console.log(`[🔥DB] ${process.env.NODE_ENV}`);

// connection pool 생성
const pool = mysql.createPool({
  ...dbConfig,
  connectionLimit: 10,
  waitForConnections: true, // 사용가능한 pool이 없을 경우 대기
  acquireTimeout: 60 * 1000,
});

function connect(callback) {
  pool.getConnection(function (err, conn) {
    if (!err) {
      callback(conn);
    }
  });
}

module.exports = { connect };
