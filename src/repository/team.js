const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const saveUserOurteam = async (conn, params) => {
  // 1. 우리팀 정보 저장
  await conn.query(
    'INSERT INTO `user_ourteam` (user_id, gender, num, age, height, drink, intro) VALUES (?, ?, ?, ?, ?, ?, ?);',
    [params.userId, params.gender, params.num, params.age, params.height, params.drink, params.intro],
  );

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

  // 2. 우리팀 선호 정보 저장
  await conn.query(
    'INSERT INTO `ourteam_preference` (ourteam_id, start_age, end_age, start_height, end_height, same_university) VALUES (?, ?, ?, ?, ?, ?);',
    [
      newOurteamId,
      params.preferenceAge[0],
      params.preferenceAge[1],
      params.preferenceHeight[0],
      params.preferenceHeight[1],
      params.sameUniversity,
    ],
  );

  // 배열 자료형 params를 테이블에 저장
  await conn.query('INSERT INTO `ourteam_preference_job` (ourteam_id, preference_job) VALUES ?;', [
    params.preferenceJob.map((j) => [newOurteamId, j]),
  ]);
  await conn.query('INSERT INTO `ourteam_preference_vibe` (ourteam_id, preference_vibe) VALUES ?;', [
    params.vibe.map((v) => [newOurteamId, v]),
  ]);

  return convertSnakeToCamel.keysToCamel(newOurteamId);
};

const getIsMatchingByUserId = async (conn, userId) => {
  const [row] = await conn.query('SELECT * FROM `user_ourteam` WHERE user_id = (?) and is_deleted = false;', [userId]);
  if (!row[0]) return false;
  else return true;
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

const getOurteamIdByUserId = async (conn, userId) => {
  const [row] = await conn.query('SELECT id FROM `user_ourteam` WHERE user_id=(?) and is_deleted=false;', [userId]);

  // 매칭 진행중인 팀 정보가 없는 경우
  if (!row[0]) {
    return -1;
  }

  return convertSnakeToCamel.keysToCamel(row[0]['id']);
};

const getUserIdByOurteamId = async (conn, ourteamId) => {
  const [row] = await conn.query('SELECT user_id FROM `user_ourteam` WHERE id=(?) and is_deleted=false;', [ourteamId]);

  // 매칭 진행중인 팀 정보가 없는 경우
  if (!row[0]) {
    return -1;
  }

  return convertSnakeToCamel.keysToCamel(row[0]['user_id']);
};

const getOurteamStatusByOurteamId = async (conn, ourteamId) => {
  const [row] = await conn.query('SELECT state FROM `user_ourteam` WHERE id=(?) and is_deleted=false;', [ourteamId]);

  // 해당 팀 정보가 없는 경우
  if (!row[0]) {
    return -1;
  }

  return convertSnakeToCamel.keysToCamel(row[0]['state']);
};

const getOurteamByOurteamId = async (conn, ourteamId) => {
  let row;
  let ourteam;
  let ourteamPreference = {};

  // 1. 우리팀 정보
  [row] = await conn.query(
    'SELECT id AS ourteam_id, gender, num, age, height, drink, intro FROM `user_ourteam` WHERE id = (?) and is_deleted = false;',
    [ourteamId],
  );
  ourteam = row[0];

  // 우리팀 직업
  [row] = await conn.query('SELECT JSON_ARRAYAGG(job) AS job  FROM `ourteam_job` WHERE ourteam_id = (?);', [ourteamId]);
  ourteam.job = row[0]['job'];

  // 우리팀 대학교
  [row] = await conn.query(
    'SELECT JSON_ARRAYAGG(university) AS university  FROM `ourteam_university` WHERE ourteam_id = (?);',
    [ourteamId],
  );
  ourteam.university = row[0]['university'];

  // 우리팀 지역
  [row] = await conn.query('SELECT JSON_ARRAYAGG(area) AS area  FROM `ourteam_area` WHERE ourteam_id = (?);', [
    ourteamId,
  ]);
  ourteam.area = row[0]['area'];

  // 우리팀 요일
  [row] = await conn.query('SELECT JSON_ARRAYAGG(day) AS day  FROM `ourteam_day` WHERE ourteam_id = (?);', [ourteamId]);
  ourteam.day = row[0]['day'];

  // 우리팀 외모
  [row] = await conn.query(
    'SELECT JSON_ARRAYAGG(appearance) AS appearance  FROM `ourteam_appearance` WHERE ourteam_id = (?);',
    [ourteamId],
  );
  ourteam.appearance = row[0]['appearance'];

  // 우리팀 MBTI
  [row] = await conn.query('SELECT JSON_ARRAYAGG(mbti) AS mbti  FROM `ourteam_mbti` WHERE ourteam_id = (?);', [
    ourteamId,
  ]);
  ourteam.mbti = row[0]['mbti'];

  // 우리팀 패션
  [row] = await conn.query('SELECT JSON_ARRAYAGG(fashion) AS fashion  FROM `ourteam_fashion` WHERE ourteam_id = (?);', [
    ourteamId,
  ]);
  ourteam.fashion = row[0]['fashion'];

  // 우리팀 구성원
  [row] = await conn.query('SELECT JSON_ARRAYAGG(role) AS role  FROM `ourteam_role` WHERE ourteam_id = (?);', [
    ourteamId,
  ]);
  ourteam.role = row[0]['role'];

  ourteam = convertSnakeToCamel.keysToCamel(ourteam);

  // 2. 우리팀 선호 정보
  // 우리팀 선호 직업
  [row] = await conn.query(
    'SELECT JSON_ARRAYAGG(preference_job) AS preference_job  FROM `ourteam_preference_job` WHERE ourteam_id = (?);',
    [ourteamId],
  );
  ourteamPreference.job = row[0]['preference_job'];

  [row] = await conn.query(
    'SELECT start_age, end_age, start_height, end_height, same_university FROM `ourteam_preference` WHERE ourteam_id = (?);',
    [ourteamId],
  );

  // 우리팀 선호 나이
  ourteamPreference.age = [row[0]['start_age'], row[0]['end_age']];

  // 우리팀 선호 키
  ourteamPreference.height = [row[0]['start_height'], row[0]['end_height']];

  // 같은 학교
  ourteamPreference.sameUniversity = row[0]['same_university'];

  [row] = await conn.query(
    'SELECT JSON_ARRAYAGG(preference_vibe) AS preference_vibe  FROM `ourteam_preference_vibe` WHERE ourteam_id = (?);',
    [ourteamId],
  );
  ourteamPreference.vibe = row[0]['preference_vibe'];

  return convertSnakeToCamel.keysToCamel({ ourteam, ourteamPreference });
};

module.exports = {
  saveUserOurteam,
  getIsMatchingByUserId,
  getOurteamByOurteamId,
  getMaleApplyNum,
  getFemaleApplyNum,
  getWaitingTeam,
  getOurteamIdByUserId,
  getUserIdByOurteamId,
  getOurteamStatusByOurteamId,
};
