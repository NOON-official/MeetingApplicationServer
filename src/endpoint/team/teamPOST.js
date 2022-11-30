const util = require('../../lib/util');
const statusCode = require('../../constants/statusCode');
const responseMessage = require('../../constants/responseMessage');
const { toString } = require('../../lib/convertArrayToString');
const pool = require('../../repository/db');
const { userDB, teamDB } = require('../../repository');

// 팀 매칭 신청 정보 저장
module.exports = async (req, res) => {
  const { userId } = req.body;
  const { gender, num, age, drink, intro } = req.body.ourteam;
  const { job, university, area, day, appearance, mbti, role } = req.body.ourteam; // 배열 자료형
  const { sameUniversity } = req.body.ourteamPreference;
  const { job: preferenceJob, age: preferenceAge, vibe } = req.body.ourteamPreference; // 배열 자료형
  const arrays = [job, university, area, day, appearance, mbti, role, preferenceJob, preferenceAge, vibe];

  // 잘못된 유저 id인 경우
  if (userId != req.user.id) {
    return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.INVALID_USER));
  }

  if (
    !userId ||
    !gender ||
    !num ||
    !age ||
    !drink ||
    !intro ||
    !sameUniversity ||
    !arrayChecker(arrays) ||
    !(preferenceAge.length == 2) ||
    !(day.length >= 2)
  )
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  const params = {
    userId,
    gender,
    num,
    age,
    drink,
    intro,
    job: toString(job),
    university: toString(university),
    area: toString(area),
    day: toString(day),
    appearance: toString(appearance),
    mbti: toString(mbti),
    role: toString(role),
    sameUniversity,
    preferenceJob: toString(preferenceJob),
    preferenceAge: toString(preferenceAge),
    vibe: toString(vibe),
  };

  let conn;

  try {
    conn = await pool.getConnection();

    // 유저가 없는 경우
    const user = await userDB.getUserById(conn, userId);
    if (!user) {
      return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_USER));
    }

    // 현재 매칭 진행중인 유저인 경우
    const isMatching = await teamDB.getOurteamIdByUserId(conn, userId);
    if (isMatching !== -1) {
      return res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, responseMessage.IS_MATCHING_USER));
    }

    const ourteamId = await teamDB.saveUserOurteam(conn, params);
    const ourteam = await teamDB.getOurteamByOurteamId(conn, ourteamId);

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SAVE_USER_APPLY_SUCCESS, ourteam));
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
