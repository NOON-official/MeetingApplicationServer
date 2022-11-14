const pool = require('../../repository/db');
const { teamDB } = require('../../repository');
const { toString } = require('../../lib/convertArrayToString');
const util = require('../../lib/util');
const statusCode = require('../../constants/statusCode');
const responseMessage = require('../../constants/responseMessage');

// 매칭 한 번 더 진행하기
module.exports = async (req, res) => {
  const { ourteamId } = req.body;

  if (!ourteamId) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let conn;
  try {
    conn = await pool.getConnection();
    let currentTeam = await teamDB.getCurrentTeamForReapply(conn, ourteamId);

    if (!currentTeam) {
      return res.status(statusCode.BAD_REQUEST).send(util.success(statusCode.BAD_REQUEST, responseMessage.NO_APPLY));
    }

    // 기존팀 가삭제 처리 (state = -1)
    await teamDB.updateTeamState(conn, ourteamId, -1);

    let params = {
      userId: currentTeam.ourteam.userId,
      gender: currentTeam.ourteam.gender,
      num: currentTeam.ourteam.num,
      age: currentTeam.ourteam.age,
      drink: currentTeam.ourteam.drink,
      intro: currentTeam.ourteam.intro,
      job: toString(currentTeam.ourteam.job),
      university: toString(currentTeam.ourteam.university),
      area: toString(currentTeam.ourteam.area),
      day: toString(currentTeam.ourteam.day),
      appearance: toString(currentTeam.ourteam.appearance),
      mbti: toString(currentTeam.ourteam.mbti),
      role: toString(currentTeam.ourteam.role),
      sameUniversity: currentTeam.ourteamPreference.sameUniversity,
      preferenceJob: toString(currentTeam.ourteamPreference.job),
      preferenceAge: toString(currentTeam.ourteamPreference.age),
      vibe: toString(currentTeam.ourteamPreference.vibe),
    };

    const newOurteamId = await teamDB.saveUserOurteam(conn, params);
    const ourteam = await teamDB.getOurteamByOurteamId(conn, newOurteamId);

    if (!ourteam) {
      return res.status(statusCode.BAD_REQUEST).send(util.success(statusCode.BAD_REQUEST, responseMessage.NO_APPLY));
    } else {
      return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.REAPPLY_SUCCESS, ourteam));
    }
  } catch (error) {
    return res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    conn.release();
  }
};
