const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const dbConfig = require('../config/dbConfig');

console.log(`[🔥DB] ${process.env.NODE_ENV}`);

// connection pool 생성
module.exports = mysql.createPool({
  ...dbConfig,
  connectionLimit: 10,
  waitForConnections: true, // 사용가능한 pool이 없을 경우 대기
});
