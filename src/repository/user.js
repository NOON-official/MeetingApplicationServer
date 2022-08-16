const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const saveUserOurteam = async (conn, params) => {
  await conn.query(
    'INSERT INTO `user` (firebase_uid, kakao_id, phone, gender, num, age, job, university, role, area, day, appearance, mbti, fashion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
    [
      params.firebaseUid,
      params.kakaoId,
      params.phone,
      params.gender,
      params.num,
      params.age,
      JSON.stringify(params.job),
      JSON.stringify(params.university),
      JSON.stringify(params.role),
      JSON.stringify(params.area),
      JSON.stringify(params.day),
      JSON.stringify(params.appearance),
      JSON.stringify(params.mbti),
      JSON.stringify(params.fashion),
    ],
  );

  // 가장 마지막에 저장한 유저 id 가져오기 (== 마지막 auto_increment id)
  [newUserId] = await conn.query('SELECT LAST_INSERT_ID();');
  newUserId = newUserId[0]['LAST_INSERT_ID()'];

  const [row] = await conn.query(
    'SELECT id, kakao_uid, nickname, phone, gender, birthday, refresh_token FROM `user` WHERE id = (?) and is_deleted = false;',
    [newUserId],
  );

  return convertSnakeToCamel.keysToCamel(row[0]);
};

const getUserByKakaoUid = async (conn, kakaoUid) => {
  const [row] = await conn.query(
    'SELECT id, kakao_uid, nickname, phone, gender, birthday, refresh_token FROM `user` WHERE kakao_uid = (?) and is_deleted = false;',
    [kakaoUid],
  );

  return convertSnakeToCamel.keysToCamel(row[0]);
};

const saveUser = async (conn, kakaoUid, properties, kakaoAccount) => {
  await conn.query('INSERT INTO `user` (kakao_uid, nickname, birthday, gender) VALUES (?, ?, ?, ?);', [
    kakaoUid,
    properties.nickname,
    !!kakaoAccount && !!kakaoAccount.birthday ? kakaoAccount.birthday : null,
    !!kakaoAccount && !!kakaoAccount.gender ? kakaoAccount.gender : null,
  ]);

  // 가장 마지막에 저장한 유저 id 가져오기 (== 마지막 auto_increment id)
  [newUserId] = await conn.query('SELECT LAST_INSERT_ID();');
  newUserId = newUserId[0]['LAST_INSERT_ID()'];

  const [row] = await conn.query(
    'SELECT id, kakao_uid, nickname, phone, gender, birthday, refresh_token FROM `user` WHERE id = (?) and is_deleted = false;',
    [newUserId],
  );

  return convertSnakeToCamel.keysToCamel(row[0]);
};

const getRefreshTokenByUserId = async (conn, userId) => {
  const [row] = await conn.query('SELECT refresh_token FROM `user` WHERE id = (?)', [userId]);

  // 토큰이 존재하지 않는 경우
  if (!row[0]) return 0;

  const result = row[0]['refresh_token'];
  return convertSnakeToCamel.keysToCamel(result);
};

const saveRefreshToken = async (conn, refreshToken, userId) => {
  await conn.query('UPDATE `user` SET refresh_token = (?) WHERE id = (?);', [refreshToken, userId]);
};

const getUserById = async (conn, userId) => {
  const [row] = await conn.query(
    'SELECT id, kakao_uid, nickname, phone, gender, birthday, refresh_token FROM `user` WHERE id = (?) and is_deleted = false;',
    [userId],
  );

  return convertSnakeToCamel.keysToCamel(row[0]);
};

const getIsMatchingByUserId = async (conn, userId) => {
  const [row] = await conn.query('SELECT * FROM `user_ourteam` WHERE user_id = (?) and is_deleted = false;', [userId]);
  if (!row[0]) return false;
  else return true;
};

module.exports = {
  saveUserOurteam,
  getUserByKakaoUid,
  saveUser,
  getRefreshTokenByUserId,
  saveRefreshToken,
  getUserById,
  getIsMatchingByUserId,
};
