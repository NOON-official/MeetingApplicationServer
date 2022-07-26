const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getWeeklyCount = async (conn) => {
  // 'mysql2/promise'는 결과값을 배열로 반환
  const [row] = await conn.query('SELECT weekly_count FROM service;');
  result = row[0]['weekly_count'];

  return convertSnakeToCamel.keysToCamel(result);
};

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

  const [row] = await conn.query('SELECT * FROM `user` WHERE id = (?)', [newUserId]);

  return convertSnakeToCamel.keysToCamel(row[0]);
};

module.exports = { getWeeklyCount, saveUserOurteam };
