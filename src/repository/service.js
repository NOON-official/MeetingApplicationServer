const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getWeeklyCount = async (conn) => {
  // 'mysql2/promise'는 결과값을 배열로 반환
  const [row] = await conn.query('SELECT weekly_count FROM service;');
  result = row[0]['weekly_count'];

  return convertSnakeToCamel.keysToCamel(result);
};

module.exports = {
  getWeeklyCount,
};
