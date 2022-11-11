const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getUserByKakaoUid = async (conn, kakaoUid) => {
  const [row] = await conn.query(
    'SELECT id, kakao_uid, nickname, phone, kakao_id, gender, birthday, is_admin FROM `user` WHERE kakao_uid = (?) and is_deleted = false;',
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
    'SELECT id, kakao_uid, nickname, phone, gender, birthday, is_admin, refresh_token FROM `user` WHERE id = (?) and is_deleted = false;',
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
    'SELECT id, kakao_uid, nickname, phone, kakao_id, gender, birthday, is_admin FROM `user` WHERE id = (?) and is_deleted = false;',
    [userId],
  );

  return convertSnakeToCamel.keysToCamel(row[0]);
};

const saveUserPhone = async (conn, userId, phone) => {
  await conn.query('UPDATE `user` SET phone = (?) WHERE id = (?);', [phone, userId]);
  return true;
};

const deleteUserByUserId = async (conn, userId) => {
  await conn.query('UPDATE `user` SET refresh_token=null, is_deleted = true WHERE id = (?);', [userId]);
  await conn.query('UPDATE `user_ourteam` SET is_deleted = true WHERE user_id = (?);', [userId]);

  return true;
};

const getUserInfoByUserId = async (conn, userId) => {
  const [row] = await conn.query(
    'SELECT id, nickname, phone, kakao_id, gender, is_admin FROM `user` WHERE id = (?) and is_deleted = false;',
    [userId],
  );

  return convertSnakeToCamel.keysToCamel(row[0]);
};

const signoutUserByUserId = async (conn, userId) => {
  await conn.query('UPDATE `user` SET refresh_token=null WHERE id = (?);', [userId]);

  return true;
};

const saveUserPrivacy = async (
  conn,
  userId,
  phone,
  kakaoId,
  serviceConfirm,
  privateInfConfirm,
  ageInfo,
  marketingConfirm,
) => {
  await conn.query('UPDATE `user` SET phone = (?), kakao_id = (?) WHERE id = (?);', [phone, kakaoId, userId]);

  const [row] = await conn.query('SELECT * FROM `user_confirm` WHERE user_id = (?);', [userId]);

  // 약관 동의 정보 없는 경우
  if (!row[0]) {
    await conn.query(
      'INSERT INTO `user_confirm` (user_id, service_confirm, private_inf_confirm, age_inf, marketing_confirm) VALUES (?, ?, ?, ?, ?);',
      [userId, serviceConfirm, privateInfConfirm, ageInfo, marketingConfirm],
    );
  }
  // 약관 동의 정보 있는 경우
  else {
    await conn.query(
      'UPDATE `user_confirm` SET service_confirm  = (?), private_inf_confirm = (?), age_inf = (?), marketing_confirm = (?) WHERE user_id = (?);',
      [serviceConfirm, privateInfConfirm, ageInfo, marketingConfirm, userId],
    );
  }
  return true;
};

module.exports = {
  getUserByKakaoUid,
  saveUser,
  getRefreshTokenByUserId,
  saveRefreshToken,
  getUserById,
  saveUserPhone,
  deleteUserByUserId,
  getUserInfoByUserId,
  signoutUserByUserId,
  saveUserPrivacy,
};
