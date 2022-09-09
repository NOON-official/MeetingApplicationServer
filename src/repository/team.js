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

// 현재의 경우 is_deleted=false인 경우 모두 신청 인원에 포함
const getMaleApplyNum = async (conn) => {
  const [row] = await conn.query(
    'SELECT COUNT(*) AS male_apply_num FROM `user_ourteam` WHERE gender=1 AND is_deleted=false;',
  );

  return convertSnakeToCamel.keysToCamel(row[0]['male_apply_num']);
};

const getFemaleApplyNum = async (conn) => {
  const [row] = await conn.query(
    'SELECT COUNT(*) AS female_apply_num FROM `user_ourteam` WHERE gender=2 AND is_deleted=false;',
  );

  return convertSnakeToCamel.keysToCamel(row[0]['female_apply_num']);
};

// 대기중인 팀 수 조회
// 현재 is_delete=false인 경우 모두 대기중인 팀으로 간주
const getWaitingTeam = async (conn) => {
  const [row] = await conn.query('SELECT COUNT(*) AS waiting_team FROM `user_ourteam` WHERE is_deleted=false;');

  return convertSnakeToCamel.keysToCamel(row[0]['waiting_team']);
};

module.exports = {
  saveUserOurteam,
  getIsMatchingByUserId,
  getOurteamByOurteamId,
  getMaleApplyNum,
  getFemaleApplyNum,
  getWaitingTeam,
};
