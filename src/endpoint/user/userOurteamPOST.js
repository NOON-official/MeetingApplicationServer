const util = require('../../lib/util');
const statusCode = require('../../constants/statusCode');
const responseMessage = require('../../constants/responseMessage');
const pool = require('../../repository/db');
const { userDB } = require('../../repository');

// 유저 정보 저장
module.exports = async (req, res) => {
  const { userId, gender, num, age, intro } = req.body;
  const { job, university, area, day, appearance, mbti, fashion, role } = req.body; // 배열 자료형

  const arrays = [job, university, area, day, appearance, mbti, fashion, role];

  if (!userId || !gender || !num || !age || !intro || !arrayChecker(arrays))
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  params = {
    userId,
    gender,
    num,
    age,
    intro,
    job,
    university,
    area,
    day,
    appearance,
    mbti,
    fashion,
    role,
  };

  let conn;

  try {
    conn = await pool.getConnection(); // pool에서 connction 빌려오기

    // 유저가 없는 경우
    const user = await userDB.getUserById(conn, userId);
    if (!user) {
      return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_USER));
    }

    // 현재 매칭 진행중인 유저인 경우
    const isMatching = await userDB.getIsMatchingByUserId(conn, userId);
    if (isMatching === true) {
      return res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, responseMessage.IS_MATCHING_USER));
    }

    const ourteamId = await userDB.saveUserOurteam(conn, params); // query 결과값 저장

    res
      .status(statusCode.OK)
      .send(util.success(statusCode.OK, responseMessage.SAVE_USER_SUCCESS, { ourteamId: ourteamId }));
  } catch (error) {
    return res
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
