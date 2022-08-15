const util = require('../../lib/util');
const statusCode = require('../../constants/statusCode');
const responseMessage = require('../../constants/responseMessage');
const pool = require('../../repository/db');
const { userPreferenceDB } = require('../../repository');

module.exports = async (req, res) => {
  const { id, age, gamePercent, sweetPercent, funPercent } = req.body;
  const { job, exceptedUniv, includedUniv, appearance, mbti, fashion } = req.body; // 배열 자료형

  const arrays = [job, exceptedUniv, includedUniv, appearance, mbti, fashion];

  if (!id || !age || !gamePercent || !sweetPercent || !funPercent || !arrayChecker(arrays))
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  params = {
    id,
    age,
    gamePercent,
    sweetPercent,
    funPercent,
    job,
    exceptedUniv,
    includedUniv,
    appearance,
    mbti,
    fashion,
  };

  let conn;

  try {
    conn = await pool.getConnection(); // pool에서 connction 빌려오기

    const result = await userPreferenceDB.saveUserPreference(conn, params); // query 결과값 저장

    // 유저가 존재하지 않는 경우
    if (!result) {
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_USER));
    }

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SAVE_USER_PREFERENCE_SUCCESS, result));
  } catch (error) {
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    conn.release(); // 빌려온 connection 반환
  }
};

// 배열이 아니거나, 길이가 0인 경우 false, 그렇지 않은 경우 true 반환
const arrayChecker = (arrOfArr) => {
  for (const arr of arrOfArr) {
    if (!Array.isArray(arr) || arr.length == 0) {
      return false;
    } else {
      continue;
    }
  }
  return true;
};
