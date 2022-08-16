const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getWaitingTeam = async (conn) => {
  // 'mysql2/promise'는 결과값을 배열로 반환
  const [row] = await conn.query('SELECT waiting_team FROM service;');
  result = row[0]['waiting_team'];

  return convertSnakeToCamel.keysToCamel(result);
};

module.exports = {
  getWaitingTeam,
};
