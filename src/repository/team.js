const convertSnakeToCamel = require('../lib/convertSnakeToCamel');
const { toArrayOfString, toArrayOfNumber } = require('../lib/convertArrayToString');

const saveUserOurteam = async (conn, params) => {
  // 1. 우리팀 정보 저장
  await conn.query('INSERT INTO `user_ourteam` (user_id, gender, num, age, drink, intro) VALUES (?, ?, ?, ?, ?, ?);', [
    params.userId,
    params.gender,
    params.num,
    params.age,
    params.drink,
    params.intro,
  ]);

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
  await conn.query('INSERT INTO `ourteam_role` (ourteam_id, role) VALUES (?, ?);', [newOurteamId, params.role]);

  // 2. 우리팀 선호 정보 저장
  await conn.query('INSERT INTO `ourteam_preference` (ourteam_id, age, same_university) VALUES (?, ?, ?);', [
    newOurteamId,
    params.preferenceAge,
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
    'UPDATE `user_ourteam` SET gender=(?), num=(?), age=(?), drink=(?), intro=(?), state=0, page_num=3 WHERE id=(?);',
    [params.gender, params.num, params.age, params.drink, params.intro, params.ourteamId],
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
  await conn.query('UPDATE `ourteam_role` SET role=(?) WHERE ourteam_id=(?);', [params.role, params.ourteamId]);

  // 2. 우리팀 선호 정보 업데이트
  await conn.query('UPDATE `ourteam_preference` SET age=(?), same_university=(?) WHERE ourteam_id=(?);', [
    params.preferenceAge,
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
  // 매칭 그만두기(가삭제) 또는 거절한 경우 제외
  const [row] = await conn.query(
    'SELECT id FROM `user_ourteam` WHERE user_id=(?) AND state!=-1 AND is_deleted=false;',
    [userId],
  );

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
    'SELECT id AS ourteam_id, gender, num, age, drink, intro FROM `user_ourteam` WHERE id = (?) AND state!=-1 AND is_deleted = false;',
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

  [row] = await conn.query('SELECT age, same_university FROM `ourteam_preference` WHERE ourteam_id = (?);', [
    ourteamId,
  ]);
  if (!row[0]) return 0;

  // 우리팀 선호 나이
  ourteamPreference.age = toArrayOfString(row[0]['age']);

  // 같은 학교
  ourteamPreference.sameUniversity = row[0]['same_university'];

  [row] = await conn.query('SELECT preference_vibe  FROM `ourteam_preference_vibe` WHERE ourteam_id = (?);', [
    ourteamId,
  ]);
  if (!row[0]['preference_vibe']) return 0;
  ourteamPreference.vibe = toArrayOfNumber(row[0]['preference_vibe']);

  return convertSnakeToCamel.keysToCamel({ ourteam, ourteamPreference });
};

// 가삭제(state = -1)인 경우 포함
const getTeamInfoByTeamId = async (conn, ourteamId) => {
  let row;
  let ourteam;
  let ourteamPreference = {};
  // 1. 우리팀 정보

  [row] = await conn.query(
    'SELECT id AS ourteam_id, gender, num, age, drink, intro FROM `user_ourteam` WHERE id = (?) AND is_deleted = false;',
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

  [row] = await conn.query('SELECT age, same_university FROM `ourteam_preference` WHERE ourteam_id = (?);', [
    ourteamId,
  ]);
  if (!row[0]) return 0;

  // 우리팀 선호 나이
  ourteamPreference.age = toArrayOfString(row[0]['age']);

  // 같은 학교
  ourteamPreference.sameUniversity = row[0]['same_university'];

  [row] = await conn.query('SELECT preference_vibe  FROM `ourteam_preference_vibe` WHERE ourteam_id = (?);', [
    ourteamId,
  ]);
  if (!row[0]['preference_vibe']) return 0;
  ourteamPreference.vibe = toArrayOfNumber(row[0]['preference_vibe']);

  return convertSnakeToCamel.keysToCamel({ ourteam, ourteamPreference });
};

const getCurrentTeamForReapply = async (conn, ourteamId) => {
  let row;
  let ourteam;
  let ourteamPreference = {};
  // 1. 우리팀 정보

  [row] = await conn.query(
    'SELECT user_id, gender, num, age, drink, intro FROM `user_ourteam` WHERE id = (?) AND state!=-1 AND is_deleted = false;',
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

  [row] = await conn.query('SELECT age, same_university FROM `ourteam_preference` WHERE ourteam_id = (?);', [
    ourteamId,
  ]);
  if (!row[0]) return 0;

  // 우리팀 선호 나이
  ourteamPreference.age = toArrayOfString(row[0]['age']);

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
    'SELECT IF(male_team_id=(?), female_team_id, male_team_id) AS partner_team_id FROM `match_team` WHERE (male_team_id=(?) OR female_team_id=(?)) AND is_deleted=false;',
    [ourteamId, ourteamId, ourteamId],
  );

  if (!row[0]) return -1;

  return row[0]['partner_team_id'];
};

const getMatchingResultByTeamId = async (conn, teamId) => {
  const [row] = await conn.query(
    'SELECT kakao_id FROM `user` u INNER JOIN `user_ourteam` uo ON u.id = uo.user_id WHERE uo.id = (?);',
    [teamId],
  );

  if (!row[0]) return 0;

  return convertSnakeToCamel.keysToCamel(row[0]);
};

// 성별, 인원수 조건에 맞는 매칭 전인 팀 리스트 조회
const getTeamByAdmin = async (conn, genderId, numId, stateId) => {
  const [row] = await conn.query(
    'SELECT uo.id AS ourteam_id, u.id AS user_id, u.nickname, u.phone, uo.gender, uo.num, uo.age, uo.drink, uo.intro, oj.job, ou.university, oa.area, od.day, oap.appearance, om.mbti, oro.role, opj.preference_job, op.age AS preference_age, op.same_university, opv.preference_vibe, uo.updated_at FROM `user_ourteam` uo INNER JOIN `user` u ON uo.user_id = u.id INNER JOIN `ourteam_job` oj ON uo.id = oj.ourteam_id INNER JOIN `ourteam_university` ou ON uo.id = ou.ourteam_id INNER JOIN `ourteam_area` oa ON uo.id = oa.ourteam_id INNER JOIN `ourteam_day` od ON uo.id = od.ourteam_id INNER JOIN `ourteam_appearance` oap ON uo.id = oap.ourteam_id INNER JOIN `ourteam_mbti` om ON uo.id = om.ourteam_id INNER JOIN `ourteam_role` oro ON uo.id = oro.ourteam_id INNER JOIN `ourteam_preference` op ON uo.id = op.ourteam_id INNER JOIN `ourteam_preference_job` opj ON uo.id = opj.ourteam_id INNER JOIN `ourteam_preference_vibe` opv ON uo.id = opv.ourteam_id WHERE u.is_deleted = false AND uo.gender = (?) AND uo.num = (?) AND uo.state = (0) AND uo.is_deleted = false ORDER BY uo.updated_at ASC, uo.age ASC;',
    [genderId, numId, stateId],
  );

  return convertSnakeToCamel.keysToCamel(row);
};

const getSuccessMaleTeamByAdmin = async (conn, genderId) => {
  const [row] = await conn.query(
    'SELECT uo.id AS ourteam_id, mt.female_team_id AS partner_team_id, u.id AS user_id, u.nickname, u.phone, uo.gender, uo.num, uo.age, uo.height, uo.drink, uo.intro, oj.job, ou.university, oa.area, od.day, oap.appearance, om.mbti, ofa.fashion, oro.role, opj.preference_job, op.age AS preference_age, op.height AS preference_height, op.same_university, opv.preference_vibe, uo.updated_at FROM `user_ourteam` uo INNER JOIN `user` u ON uo.user_id = u.id INNER JOIN `ourteam_job` oj ON uo.id = oj.ourteam_id INNER JOIN `ourteam_university` ou ON uo.id = ou.ourteam_id INNER JOIN `ourteam_area` oa ON uo.id = oa.ourteam_id INNER JOIN `ourteam_day` od ON uo.id = od.ourteam_id INNER JOIN `ourteam_appearance` oap ON uo.id = oap.ourteam_id INNER JOIN `ourteam_mbti` om ON uo.id = om.ourteam_id INNER JOIN `ourteam_fashion` ofa ON uo.id = ofa.ourteam_id INNER JOIN `ourteam_role` oro ON uo.id = oro.ourteam_id INNER JOIN `ourteam_preference` op ON uo.id = op.ourteam_id INNER JOIN `ourteam_preference_job` opj ON uo.id = opj.ourteam_id INNER JOIN `ourteam_preference_vibe` opv ON uo.id = opv.ourteam_id INNER JOIN `match_team` mt ON uo.id = mt.male_team_id WHERE u.is_deleted = false AND mt.is_deleted = false AND uo.gender = (?) AND uo.state = 1 AND uo.is_deleted = false ORDER BY uo.updated_at ASC',
    [genderId],
  );

  return convertSnakeToCamel.keysToCamel(row);
};

const getSuccessFemaleTeamByAdmin = async (conn, genderId) => {
  const [row] = await conn.query(
    'SELECT uo.id AS ourteam_id, mt.male_team_id AS partner_team_id, u.id AS user_id, u.nickname, u.phone, uo.gender, uo.num, uo.age, uo.height, uo.drink, uo.intro, oj.job, ou.university, oa.area, od.day, oap.appearance, om.mbti, ofa.fashion, oro.role, opj.preference_job, op.age AS preference_age, op.height AS preference_height, op.same_university, opv.preference_vibe, uo.updated_at FROM `user_ourteam` uo INNER JOIN `user` u ON uo.user_id = u.id INNER JOIN `ourteam_job` oj ON uo.id = oj.ourteam_id INNER JOIN `ourteam_university` ou ON uo.id = ou.ourteam_id INNER JOIN `ourteam_area` oa ON uo.id = oa.ourteam_id INNER JOIN `ourteam_day` od ON uo.id = od.ourteam_id INNER JOIN `ourteam_appearance` oap ON uo.id = oap.ourteam_id INNER JOIN `ourteam_mbti` om ON uo.id = om.ourteam_id INNER JOIN `ourteam_fashion` ofa ON uo.id = ofa.ourteam_id INNER JOIN `ourteam_role` oro ON uo.id = oro.ourteam_id INNER JOIN `ourteam_preference` op ON uo.id = op.ourteam_id INNER JOIN `ourteam_preference_job` opj ON uo.id = opj.ourteam_id INNER JOIN `ourteam_preference_vibe` opv ON uo.id = opv.ourteam_id INNER JOIN `match_team` mt ON uo.id = mt.female_team_id WHERE u.is_deleted = false AND mt.is_deleted = false AND uo.gender = (?) AND uo.state = 1 AND uo.is_deleted = false ORDER BY uo.updated_at ASC',
    [genderId],
  );

  return convertSnakeToCamel.keysToCamel(row);
};

const getFailTeamByAdmin = async (conn, genderId) => {
  const [row] = await conn.query(
    'SELECT uo.id AS ourteam_id, u.id AS user_id, u.nickname, u.phone, uo.gender, uo.num, uo.age, uo.height, uo.drink, uo.intro, oj.job, ou.university, oa.area, od.day, oap.appearance, om.mbti, ofa.fashion, oro.role, opj.preference_job, op.age AS preference_age, op.height AS preference_height, op.same_university, opv.preference_vibe, uo.updated_at FROM `user_ourteam` uo INNER JOIN `user` u ON uo.user_id = u.id INNER JOIN `ourteam_job` oj ON uo.id = oj.ourteam_id INNER JOIN `ourteam_university` ou ON uo.id = ou.ourteam_id INNER JOIN `ourteam_area` oa ON uo.id = oa.ourteam_id INNER JOIN `ourteam_day` od ON uo.id = od.ourteam_id INNER JOIN `ourteam_appearance` oap ON uo.id = oap.ourteam_id INNER JOIN `ourteam_mbti` om ON uo.id = om.ourteam_id INNER JOIN `ourteam_fashion` ofa ON uo.id = ofa.ourteam_id INNER JOIN `ourteam_role` oro ON uo.id = oro.ourteam_id INNER JOIN `ourteam_preference` op ON uo.id = op.ourteam_id INNER JOIN `ourteam_preference_job` opj ON uo.id = opj.ourteam_id INNER JOIN `ourteam_preference_vibe` opv ON uo.id = opv.ourteam_id WHERE u.is_deleted = false AND uo.gender = (?) AND uo.state = 2 AND uo.is_deleted = false ORDER BY uo.updated_at ASC;',
    [genderId],
  );

  return convertSnakeToCamel.keysToCamel(row);
};

const matchTeam = async (conn, maleTeamId, femaleTeamId, chatLink) => {
  const [row1] = await conn.query(
    'SELECT male_team_id FROM `match_team` WHERE male_team_id=(?) and is_deleted=false;',
    [maleTeamId],
  );
  const [row2] = await conn.query(
    'SELECT female_team_id FROM `match_team` WHERE female_team_id=(?) and is_deleted=false;',
    [femaleTeamId],
  );

  // 둘 중 한 명이 이미 매칭된 유저인 경우
  if (!!row1[0] || !!row2[0]) {
    return false;
  }

  await conn.query('INSERT INTO `match_team` (male_team_id, female_team_id, chat_link) VALUES (?, ?, ?);', [
    maleTeamId,
    femaleTeamId,
    chatLink,
  ]);

  await conn.query('UPDATE `user_ourteam` SET state=1 WHERE id=(?);', [maleTeamId]);
  await conn.query('UPDATE `user_ourteam` SET state=1 WHERE id=(?);', [femaleTeamId]);

  return true;
};

const closeMatching = async (conn, maleTeamId, femaleTeamId) => {
  const [row] = await conn.query(
    'SELECT * FROM `match_team` WHERE male_team_id=(?) AND female_team_id=(?) and is_deleted=false;',
    [maleTeamId, femaleTeamId],
  );

  // 매칭 정보가 없는 경우
  if (!row[0]) {
    return false;
  }

  await conn.query('UPDATE `match_team` SET is_deleted=true WHERE male_team_id=(?) AND female_team_id=(?);', [
    maleTeamId,
    femaleTeamId,
  ]);
  await conn.query('UPDATE `user_ourteam` SET is_deleted=true WHERE id=(?);', [maleTeamId]);
  await conn.query('UPDATE `user_ourteam` SET is_deleted=true WHERE id=(?);', [femaleTeamId]);

  return true;
};

const closeTeam = async (conn, ourteamId) => {
  const [row] = await conn.query('SELECT * FROM `user_ourteam` WHERE id=(?) AND state=2 AND is_deleted=false;', [
    ourteamId,
  ]);

  // 매칭 정보가 없는 경우
  if (!row[0]) {
    return false;
  }

  await conn.query('UPDATE `user_ourteam` SET is_deleted=true WHERE id=(?);', [ourteamId]);

  return true;
};

// const updateTeamReapply = async (conn, ourteamId) => {
//   const [row] = await conn.query('SELECT * FROM `user_ourteam` WHERE id=(?) AND is_deleted=false;', [ourteamId]);

//   // 매칭 정보가 없는 경우
//   if (!row[0]) {
//     return false;
//   }

//   await conn.query('UPDATE `user_ourteam` SET state=0, page_num=3 WHERE id=(?);', [ourteamId]);

//   return true;
// };

const failTeam = async (conn, ourteamId) => {
  const [row] = await conn.query('SELECT * FROM `user_ourteam` WHERE id=(?) AND state=0 AND is_deleted=false;', [
    ourteamId,
  ]);

  // 매칭중인 팀 정보가 없는 경우
  if (!row[0]) {
    return false;
  }

  await conn.query('UPDATE `user_ourteam` SET state=2 WHERE id=(?);', [ourteamId]);

  return true;
};

const revertMatchTeam = async (conn, maleTeamId, femaleTeamId) => {
  const [row1] = await conn.query(
    // 매칭 정보
    'SELECT * FROM `match_team` WHERE male_team_id=(?) AND female_team_id=(?) AND is_deleted=false;',
    [maleTeamId, femaleTeamId],
  );

  // 남자팀 정보
  const [row2] = await conn.query('SELECT * FROM `user_ourteam` WHERE id=(?) AND state=1 AND is_deleted=false;', [
    maleTeamId,
  ]);

  // 여자팀 정보
  const [row3] = await conn.query('SELECT * FROM `user_ourteam` WHERE id=(?) AND state=1 AND is_deleted=false;', [
    femaleTeamId,
  ]);

  // 매칭 정보가 없거나, 해당 팀 정보가 없는 경우
  if (!row1[0] || !row2[0] || !row3[0]) {
    return false;
  }

  await conn.query('UPDATE `user_ourteam` SET state=0 WHERE id=(?) AND is_deleted=false;', [maleTeamId]);
  await conn.query('UPDATE `user_ourteam` SET state=0 WHERE id=(?) AND is_deleted=false;', [femaleTeamId]);

  await conn.query('DELETE FROM `match_team` WHERE male_team_id=(?) AND female_team_id=(?) AND is_deleted=false;', [
    maleTeamId,
    femaleTeamId,
  ]);

  return true;
};

const revertFailTeam = async (conn, ourteamId) => {
  const [row] = await conn.query('SELECT * FROM `user_ourteam` WHERE id=(?) AND state=2 AND is_deleted=false;', [
    ourteamId,
  ]);

  // 매칭실패한 팀 정보가 없는 경우
  if (!row[0]) {
    return false;
  }

  await conn.query('UPDATE `user_ourteam` SET state=0 WHERE id=(?);', [ourteamId]);

  return true;
};

const getOurteamPageByOurteamId = async (conn, ourteamId) => {
  const [row] = await conn.query(
    'SELECT page_num FROM `user_ourteam` WHERE id=(?) AND state!=-1 AND is_deleted=false;',
    [ourteamId],
  );

  // 해당 팀 정보가 없는 경우
  if (!row[0]) {
    return -1;
  }

  return convertSnakeToCamel.keysToCamel(row[0]['page_num']);
};

const getCurrentMatchingStatus = async (conn, ourteamId, partnerTeamId) => {
  const [row] = await conn.query('SELECT gender FROM `user_ourteam` WHERE id=(?) and is_deleted=false;', [ourteamId]);

  // 남자팀인 경우
  if (row[0]['gender'] === 1) {
    const [row] = await conn.query(
      'SELECT male_team_is_accepted AS ourteam_is_accepted, female_team_is_accepted AS partner_team_is_accepted FROM `match_team` WHERE male_team_id=(?) AND female_team_id=(?) AND is_deleted=false;',
      [ourteamId, partnerTeamId],
    );
    return convertSnakeToCamel.keysToCamel(row[0]);
  }
  // 여자팀인 경우
  else if (row[0]['gender'] === 2) {
    const [row] = await conn.query(
      'SELECT female_team_is_accepted AS ourteam_is_accepted, male_team_is_accepted AS partner_team_is_accepted FROM `match_team` WHERE female_team_id=(?) AND male_team_id=(?) AND is_deleted=false;',
      [ourteamId, partnerTeamId],
    );
    return convertSnakeToCamel.keysToCamel(row[0]);
  }
  // 해당 팀 정보가 없는 경우
  else {
    return -1;
  }
};

const updateMatchingResponseTrue = async (conn, ourteamId, partnerTeamId) => {
  const [row] = await conn.query('SELECT gender FROM `user_ourteam` WHERE id=(?) and is_deleted=false;', [ourteamId]);

  // 남자팀인 경우
  if (row[0]['gender'] === 1) {
    await conn.query(
      'UPDATE `match_team` SET male_team_is_accepted=true  WHERE male_team_id=(?) AND female_team_id=(?) AND is_deleted=false;',
      [ourteamId, partnerTeamId],
    );
  }
  // 여자팀인 경우
  else if (row[0]['gender'] === 2) {
    await conn.query(
      'UPDATE `match_team` SET female_team_is_accepted=true  WHERE female_team_id=(?) AND male_team_id=(?) AND is_deleted=false;',
      [ourteamId, partnerTeamId],
    );
  }
  // 해당 팀 정보가 없는 경우
  else {
    return -1;
  }
};

const updateMatchingResponseFalse = async (conn, ourteamId, partnerTeamId) => {
  const [row] = await conn.query('SELECT gender FROM `user_ourteam` WHERE id=(?) and is_deleted=false;', [ourteamId]);

  // 남자팀인 경우
  if (row[0]['gender'] === 1) {
    await conn.query(
      'UPDATE `match_team` SET male_team_is_accepted=false  WHERE male_team_id=(?) AND female_team_id=(?) AND is_deleted=false;',
      [ourteamId, partnerTeamId],
    );
  }
  // 여자팀인 경우
  else if (row[0]['gender'] === 2) {
    await conn.query(
      'UPDATE `match_team` SET female_team_is_accepted=false  WHERE female_team_id=(?) AND male_team_id=(?) AND is_deleted=false;',
      [ourteamId, partnerTeamId],
    );
  }
  // 해당 팀 정보가 없는 경우
  else {
    return -1;
  }
};

const updateTeamPageNum = async (conn, teamId, teamNewPage) => {
  await conn.query('UPDATE `user_ourteam` SET page_num=(?) WHERE id=(?) AND is_deleted=false;', [teamNewPage, teamId]);
};

const updateTeamState = async (conn, teamId, teamNewState) => {
  await conn.query('UPDATE `user_ourteam` SET state=(?) WHERE id=(?) AND is_deleted=false;', [teamNewState, teamId]);
};

const saveTeamRefuseReason = async (conn, params) => {
  await conn.query('INSERT INTO `ourteam_refuse_reason` (ourteam_id, reason, other) VALUES (?, ?, ?);', [
    params.ourteamId,
    params.id,
    params.other,
  ]);
};

module.exports = {
  saveUserOurteam,
  updateUserOurteam,
  getIsMatchingByUserId,
  getOurteamByOurteamId,
  getTeamInfoByTeamId,
  getCurrentTeamForReapply,
  getMaleApplyNum,
  getFemaleApplyNum,
  getWaitingTeam,
  getOurteamIdByUserId,
  getUserIdByOurteamId,
  getOurteamStatusByOurteamId,
  getPartnerTeamIdByOurteamId,
  getMatchingResultByTeamId,
  getTeamByAdmin,
  getSuccessMaleTeamByAdmin,
  getSuccessFemaleTeamByAdmin,
  getFailTeamByAdmin,
  matchTeam,
  closeMatching,
  closeTeam,
  // updateTeamReapply,
  failTeam,
  revertMatchTeam,
  revertFailTeam,
  getOurteamPageByOurteamId,
  getCurrentMatchingStatus,
  updateMatchingResponseTrue,
  updateTeamPageNum,
  updateTeamState,
  updateMatchingResponseFalse,
  saveTeamRefuseReason,
};
