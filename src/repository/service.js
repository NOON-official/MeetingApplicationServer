const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getWaitingTeam = async (conn) => {
  // 'mysql2/promise'는 결과값을 배열로 반환
  const [row] = await conn.query('SELECT COUNT(*) AS waiting_team FROM `user_ourteam` WHERE is_deleted=false;');
  result = row[0]['waiting_team'];

  if (!result) result = 0;

  return convertSnakeToCamel.keysToCamel(result);
};

module.exports = {
  getWaitingTeam,
};
