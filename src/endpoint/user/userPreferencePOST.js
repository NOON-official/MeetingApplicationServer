const util = require('../../lib/util');
const statusCode = require('../../constants/statusCode');
const responseMessage = require('../../constants/responseMessage');
const pool = require('../../repository/db');
const { userDB, userPreferenceDB } = require('../../repository');

// 유저 선호 정보 저장
module.exports = async (req, res) => {
  const { userId, ourteamId, sameUniversity } = req.body;
  const { job, age, vibe } = req.body; // 배열 자료형

  const arrays = [job, age, vibe];

  if (!userId || !ourteamId || !sameUniversity || !arrayChecker(arrays) || !(age.length == 2))
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  params = {
    ourteamId,
    sameUniversity,
    job,
    age,
    vibe,
  };

  let conn;

  try {
    conn = await pool.getConnection();

    // 유저가 없는 경우
    const user = await userDB.getUserById(conn, userId);
    if (!user) {
      return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_USER));
    }

    // 우리팀 정보가 없는 경우
    const ourteam = await userDB.getOurteamByOurteamId(conn, ourteamId);
    if (!ourteam) {
      return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_OURTEAM));
    }

    // 현재 매칭 진행중인 유저인 경우
    const isMatchingPreference = await userPreferenceDB.getIsMatchingByOurteamId(conn, ourteamId);
    if (isMatchingPreference === true) {
      return res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, responseMessage.IS_MATCHING_USER));
    }

    await userPreferenceDB.saveUserPreference(conn, params); // 유저 선호 정보 저장
    const isMatching = await userDB.getIsMatchingByUserId(conn, userId);

    res
      .status(statusCode.OK)
      .send(util.success(statusCode.OK, responseMessage.SAVE_USER_PREFERENCE_SUCCESS, { isMatching: isMatching }));
  } catch (error) {
    return res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    conn.release();
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
