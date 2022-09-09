const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getApplyIsLimited = async (conn) => {
  const [row] = await conn.query('SELECT male_is_limited, female_is_limited FROM `service`;');

  let maleIsLimited = row[0]['male_is_limited'];
  maleIsLimited === 0 ? (maleIsLimited = false) : (maleIsLimited = true);

  let femaleIsLimited = row[0]['female_is_limited'];
  femaleIsLimited === 0 ? (femaleIsLimited = false) : (femaleIsLimited = true);

  return { maleIsLimited, femaleIsLimited };
};

const getMaleLimitNum = async (conn) => {
  const [row] = await conn.query('SELECT male_limit_num FROM `service`;');

  let result = row[0]['male_limit_num'];
  if (!result) result = 0;

  return convertSnakeToCamel.keysToCamel(result);
};

const getFemaleLimitNum = async (conn) => {
  const [row] = await conn.query('SELECT female_limit_num FROM `service`;');

  let result = row[0]['female_limit_num'];
  if (!result) result = 0;

  return convertSnakeToCamel.keysToCamel(result);
};

const getWaitingTeam = async (conn) => {
  // 'mysql2/promise'는 결과값을 배열로 반환
  const [row] = await conn.query('SELECT COUNT(*) AS waiting_team FROM `user_ourteam` WHERE is_deleted=false;');
  let result = row[0]['waiting_team'];

  if (!result) result = 0;

  return convertSnakeToCamel.keysToCamel(result);
};

module.exports = {
  getApplyIsLimited,
  getMaleLimitNum,
  getFemaleLimitNum,
  getWaitingTeam,
};
