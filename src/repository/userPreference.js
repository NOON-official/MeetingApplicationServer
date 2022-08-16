const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getIsMatchingByOurteamId = async (conn, ourteamId) => {
  const [row] = await conn.query('SELECT * FROM `ourteam_preference` WHERE ourteam_id = (?);', [ourteamId]);
  if (!row[0]) return false;
  else return true;
};

const saveUserPreference = async (conn, params) => {
  await conn.query(
    'INSERT INTO `ourteam_preference` (ourteam_id, start_age, end_age, same_university) VALUES (?, ?, ?, ?);',
    [params.ourteamId, params.age[0], params.age[1], params.sameUniversity],
  );

  // 배열 자료형 params를 테이블에 저장
  await conn.query('INSERT INTO `ourteam_preference_job` (ourteam_id, preference_job) VALUES ?;', [
    params.job.map((j) => [params.ourteamId, j]),
  ]);
  await conn.query('INSERT INTO `ourteam_preference_vibe` (ourteam_id, preference_vibe) VALUES ?;', [
    params.vibe.map((v) => [params.ourteamId, v]),
  ]);

  return true;
};

module.exports = {
  getIsMatchingByOurteamId,
  saveUserPreference,
};
