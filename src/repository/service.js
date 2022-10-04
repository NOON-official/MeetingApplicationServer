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

const updateApplyStatus = async (conn, maleIsLimited, maleLimitNum, femaleIsLimited, femaleLimitNum) => {
  await conn.query(
    'UPDATE `service` SET male_is_limited=(?), male_limit_num=(?), female_is_limited=(?), female_limit_num=(?);',
    [maleIsLimited, maleLimitNum, femaleIsLimited, femaleLimitNum],
  );

  return true;
};

const getApplyStatus = async (conn) => {
  const [row] = await conn.query('SELECT * FROM `service`;');

  if (!row[0]) return false;

  return convertSnakeToCamel.keysToCamel(row[0]);
};

module.exports = {
  getApplyIsLimited,
  getMaleLimitNum,
  getFemaleLimitNum,
  updateApplyStatus,
  getApplyStatus,
};
