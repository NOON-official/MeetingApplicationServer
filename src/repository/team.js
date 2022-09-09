const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const saveUserOurteam = async (conn, params) => {
  await conn.query('INSERT INTO `user_ourteam` (user_id, gender, num, age, intro) VALUES (?, ?, ?, ?, ?);', [
    params.userId,
    params.gender,
    params.num,
    params.age,
    params.intro,
  ]);

  [newOurteamId] = await conn.query('SELECT LAST_INSERT_ID();');
  newOurteamId = newOurteamId[0]['LAST_INSERT_ID()'];

  // 배열 자료형 params 테이블에 저장
  await conn.query('INSERT INTO `ourteam_job` (ourteam_id, job) VALUES ?;', [params.job.map((j) => [newOurteamId, j])]);
  await conn.query('INSERT INTO `ourteam_university` (ourteam_id, university) VALUES ?;', [
    params.university.map((u) => [newOurteamId, u]),
  ]);
  await conn.query('INSERT INTO `ourteam_area` (ourteam_id, area) VALUES ?;', [
    params.area.map((a) => [newOurteamId, a]),
  ]);
  await conn.query('INSERT INTO `ourteam_day` (ourteam_id, day) VALUES ?;', [params.day.map((d) => [newOurteamId, d])]);
  await conn.query('INSERT INTO `ourteam_appearance` (ourteam_id, appearance) VALUES ?;', [
    params.appearance.map((a) => [newOurteamId, a]),
  ]);
  await conn.query('INSERT INTO `ourteam_mbti` (ourteam_id, mbti) VALUES ?;', [
    params.mbti.map((m) => [newOurteamId, m]),
  ]);
  await conn.query('INSERT INTO `ourteam_fashion` (ourteam_id, fashion) VALUES ?;', [
    params.fashion.map((f) => [newOurteamId, f]),
  ]);
  await conn.query('INSERT INTO `ourteam_role` (ourteam_id, role) VALUES ?;', [
    params.role.map((r) => [newOurteamId, r]),
  ]);

  return convertSnakeToCamel.keysToCamel(newOurteamId);
};

const getIsMatchingByUserId = async (conn, userId) => {
  const [row] = await conn.query('SELECT * FROM `user_ourteam` WHERE user_id = (?) and is_deleted = false;', [userId]);
  if (!row[0]) return false;
  else return true;
};

const getOurteamByOurteamId = async (conn, ourteamId) => {
  const [row] = await conn.query('SELECT * FROM `user_ourteam` WHERE id = (?) and is_deleted = false;', [ourteamId]);

  return convertSnakeToCamel.keysToCamel(row[0]);
};

module.exports = {
  saveUserOurteam,
  getIsMatchingByUserId,
  getOurteamByOurteamId,
};
