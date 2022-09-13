const convertSnakeToCamel = require('../lib/convertSnakeToCamel');
const { toArrayOfString, toArrayOfNumber } = require('../lib/convertArrayToString');

const saveUserOurteam = async (conn, params) => {
  // 1. 우리팀 정보 저장
  await conn.query(
    'INSERT INTO `user_ourteam` (user_id, gender, num, age, height, drink, intro) VALUES (?, ?, ?, ?, ?, ?, ?);',
    [params.userId, params.gender, params.num, params.age, params.height, params.drink, params.intro],
  );

  [newOurteamId] = await conn.query('SELECT LAST_INSERT_ID();');
  newOurteamId = newOurteamId[0]['LAST_INSERT_ID()'];

  // 배열 자료형 params 테이블에 저장
  await conn.query('INSERT INTO `ourteam_job` (ourteam_id, job) VALUES (?, ?);', [newOurteamId, params.job]);
  await conn.query('INSERT INTO `ourteam_university` (ourteam_id, university) VALUES (?, ?);', [
    newOurteamId,
    params.university,
  ]);
  await conn.query('INSERT INTO `ourteam_area` (ourteam_id, area) VALUES (?, ?);', [newOurteamId, params.area]);
  await conn.query('INSERT INTO `ourteam_day` (ourteam_id, day) VALUES (?, ?);', [newOurteamId, params.day]);
  await conn.query('INSERT INTO `ourteam_appearance` (ourteam_id, appearance) VALUES (?, ?);', [
    newOurteamId,
    params.appearance,
  ]);
  await conn.query('INSERT INTO `ourteam_mbti` (ourteam_id, mbti) VALUES (?, ?);', [newOurteamId, params.mbti]);
  await conn.query('INSERT INTO `ourteam_fashion` (ourteam_id, fashion) VALUES (?, ?);', [
    newOurteamId,
    params.fashion,
  ]);
  await conn.query('INSERT INTO `ourteam_role` (ourteam_id, role) VALUES (?, ?);', [newOurteamId, params.role]);

  // 2. 우리팀 선호 정보 저장
  await conn.query('INSERT INTO `ourteam_preference` (ourteam_id, age, height, same_university) VALUES (?, ?, ?, ?);', [
    newOurteamId,
    params.preferenceAge,
    params.preferenceHeight,
    params.sameUniversity,
  ]);

  // 배열 자료형 params를 테이블에 저장
  await conn.query('INSERT INTO `ourteam_preference_job` (ourteam_id, preference_job) VALUES (?, ?);', [
    newOurteamId,
    params.preferenceJob,
  ]);
  await conn.query('INSERT INTO `ourteam_preference_vibe` (ourteam_id, preference_vibe) VALUES (?, ?);', [
    newOurteamId,
    params.vibe,
  ]);

  return convertSnakeToCamel.keysToCamel(newOurteamId);
};

const updateUserOurteam = async (conn, params) => {
  // 1. 우리팀 정보 업데이트
  await conn.query(
    'UPDATE `user_ourteam` SET gender=(?), num=(?), age=(?), height=(?), drink=(?), intro=(?) WHERE id=(?);',
    [params.gender, params.num, params.age, params.height, params.drink, params.intro, params.ourteamId],
  );

  // 배열 타입 데이터 업데이트
  await conn.query('UPDATE `ourteam_job` SET job=(?) WHERE ourteam_id=(?);', [params.job, params.ourteamId]);
  await conn.query('UPDATE `ourteam_university` SET university=(?) WHERE ourteam_id=(?);', [
    params.university,
    params.ourteamId,
  ]);
  await conn.query('UPDATE `ourteam_area` SET area=(?) WHERE ourteam_id=(?);', [params.area, params.ourteamId]);
  await conn.query('UPDATE `ourteam_day` SET day=(?) WHERE ourteam_id=(?);', [params.day, params.ourteamId]);
  await conn.query('UPDATE `ourteam_appearance` SET appearance=(?) WHERE ourteam_id=(?);', [
    params.appearance,
    params.ourteamId,
  ]);
  await conn.query('UPDATE `ourteam_mbti` SET mbti=(?) WHERE ourteam_id=(?);', [params.mbti, params.ourteamId]);
  await conn.query('UPDATE `ourteam_fashion` SET fashion=(?) WHERE ourteam_id=(?);', [
    params.fashion,
    params.ourteamId,
  ]);
  await conn.query('UPDATE `ourteam_role` SET role=(?) WHERE ourteam_id=(?);', [params.role, params.ourteamId]);

  // 2. 우리팀 선호 정보 업데이트
  await conn.query('UPDATE `ourteam_preference` SET age=(?), height=(?), same_university=(?) WHERE ourteam_id=(?);', [
    params.preferenceAge,
    params.preferenceHeight,
    params.sameUniversity,
    params.ourteamId,
  ]);

  // 배열 타입 데이터 업데이트
  await conn.query('UPDATE `ourteam_preference_job` SET preference_job=(?) WHERE ourteam_id=(?);', [
    params.preferenceJob,
    params.ourteamId,
  ]);
  await conn.query('UPDATE `ourteam_preference_vibe` SET preference_vibe=(?) WHERE ourteam_id=(?);', [
    params.vibe,
    params.ourteamId,
  ]);

  return convertSnakeToCamel.keysToCamel(params.ourteamId);
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
  if (!row[0]) return 0;
  ourteam = row[0];

  // 우리팀 직업
  [row] = await conn.query('SELECT job  FROM `ourteam_job` WHERE ourteam_id = (?);', [ourteamId]);
  if (!row[0]['job']) return 0;
  ourteam.job = toArrayOfNumber(row[0]['job']);

  // 우리팀 대학교
  [row] = await conn.query('SELECT university  FROM `ourteam_university` WHERE ourteam_id = (?);', [ourteamId]);
  if (!row[0]['university']) return 0;
  ourteam.university = toArrayOfNumber(row[0]['university']);

  // 우리팀 지역
  [row] = await conn.query('SELECT area  FROM `ourteam_area` WHERE ourteam_id = (?);', [ourteamId]);
  if (!row[0]['area']) return 0;
  ourteam.area = toArrayOfNumber(row[0]['area']);

  // 우리팀 요일
  [row] = await conn.query('SELECT day  FROM `ourteam_day` WHERE ourteam_id = (?);', [ourteamId]);
  if (!row[0]['day']) return 0;
  ourteam.day = toArrayOfNumber(row[0]['day']);

  // 우리팀 외모
  [row] = await conn.query('SELECT appearance  FROM `ourteam_appearance` WHERE ourteam_id = (?);', [ourteamId]);
  if (!row[0]['appearance']) return 0;
  ourteam.appearance = toArrayOfNumber(row[0]['appearance']);

  // 우리팀 MBTI
  [row] = await conn.query('SELECT mbti  FROM `ourteam_mbti` WHERE ourteam_id = (?);', [ourteamId]);
  if (!row[0]['mbti']) return 0;
  ourteam.mbti = toArrayOfNumber(row[0]['mbti']);

  // 우리팀 패션
  [row] = await conn.query('SELECT fashion  FROM `ourteam_fashion` WHERE ourteam_id = (?);', [ourteamId]);
  if (!row[0]['fashion']) return 0;
  ourteam.fashion = toArrayOfNumber(row[0]['fashion']);

  // 우리팀 구성원
  [row] = await conn.query('SELECT role  FROM `ourteam_role` WHERE ourteam_id = (?);', [ourteamId]);
  if (!row[0]['role']) return 0;
  ourteam.role = toArrayOfNumber(row[0]['role']);

  ourteam = convertSnakeToCamel.keysToCamel(ourteam);

  // 2. 우리팀 선호 정보
  // 우리팀 선호 직업
  [row] = await conn.query('SELECT preference_job  FROM `ourteam_preference_job` WHERE ourteam_id = (?);', [ourteamId]);
  if (!row[0]['preference_job']) return 0;
  ourteamPreference.job = toArrayOfNumber(row[0]['preference_job']);

  [row] = await conn.query('SELECT age, height, same_university FROM `ourteam_preference` WHERE ourteam_id = (?);', [
    ourteamId,
  ]);
  if (!row[0]) return 0;

  // 우리팀 선호 나이
  ourteamPreference.age = toArrayOfString(row[0]['age']);

  // 우리팀 선호 키
  ourteamPreference.height = toArrayOfString(row[0]['height']);

  // 같은 학교
  ourteamPreference.sameUniversity = row[0]['same_university'];

  [row] = await conn.query('SELECT preference_vibe  FROM `ourteam_preference_vibe` WHERE ourteam_id = (?);', [
    ourteamId,
  ]);
  if (!row[0]['preference_vibe']) return 0;
  ourteamPreference.vibe = toArrayOfNumber(row[0]['preference_vibe']);

  return convertSnakeToCamel.keysToCamel({ ourteam, ourteamPreference });
};

const getPartnerTeamIdByOurteamId = async (conn, ourteamId) => {
  const [row] = await conn.query(
    'SELECT IF(male_team_id=(?), female_team_id, male_team_id) AS partner_team_id FROM `match_team` WHERE (male_team_id=(?) OR female_team_id=(?))',
    [ourteamId, ourteamId, ourteamId],
  );

  if (!row[0]) return -1;

  return row[0]['partner_team_id'];
};

const getMatchingResultByOurteamId = async (conn, ourteamId) => {
  const [row] = await conn.query('SELECT chat_link FROM `match_team` WHERE (male_team_id=(?) OR female_team_id=(?));', [
    ourteamId,
    ourteamId,
  ]);

  if (!row[0]) return 0;

  return convertSnakeToCamel.keysToCamel(row[0]);
};

module.exports = {
  saveUserOurteam,
  updateUserOurteam,
  getIsMatchingByUserId,
  getOurteamByOurteamId,
  getMaleApplyNum,
  getFemaleApplyNum,
  getWaitingTeam,
  getOurteamIdByUserId,
  getUserIdByOurteamId,
  getOurteamStatusByOurteamId,
  getPartnerTeamIdByOurteamId,
  getMatchingResultByOurteamId,
};
