const mysql = require('mysql2/promise');

const dbConfig = require('../config/dbConfig');

console.log(`[🔥DB] ${process.env.NODE_ENV}`);

// connection pool 생성
module.exports = mysql.createPool({
  ...dbConfig,
  connectionLimit: 50,
  connectTimeout: 5000,
  waitForConnections: true, // 사용가능한 pool이 없을 경우 대기
});
