const pool = require('../../repository/db');
const { teamDB } = require('../../repository');
const util = require('../../lib/util');
const statusCode = require('../../constants/statusCode');
const responseMessage = require('../../constants/responseMessage');

// 매칭 거절하기
module.exports = async (req, res) => {
  const { ourteamId, partnerTeamId } = req.body;

  if (!ourteamId || !partnerTeamId) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let conn;
  try {
    conn = await pool.getConnection();

    const currentMatchingStatus = await teamDB.getCurrentMatchingStatus(conn, ourteamId, partnerTeamId);

    if (currentMatchingStatus === -1) {
      return res.status(statusCode.BAD_REQUEST).send(util.success(statusCode.BAD_REQUEST, responseMessage.NO_APPLY));
    }

    if (currentMatchingStatus.ourteamIsAccepted !== null) {
      return res
        .status(statusCode.BAD_REQUEST)
        .send(util.success(statusCode.BAD_REQUEST, responseMessage.ALREADY_RESPONEDED_TEAM));
    }

    let ourteamNewState, ourteamNewPage;
    let partnerTeamNewState, partnerTeamNewPage;

    // 거절을 눌렀는데, 상대팀이
    switch (currentMatchingStatus.partnerTeamIsAccepted) {
      case 1: // 이미 수락한 경우
        ourteamNewState = 4;
        ourteamNewPage = 8;
        partnerTeamNewState = 4;
        partnerTeamNewPage = 9;
        break;
      case 0: // 이미 거절한 경우 (상대팀 재매칭 신청했을 수 있으므로 상대팀 정보 변하면 안됨)
        ourteamNewPage = 8;
        break;
      case null: // 아직 응답하지 않은 경우
        ourteamNewState = 4;
        ourteamNewPage = 8;
        partnerTeamNewState = 4;
        break;
      default:
        break;
    }

    // 거절 처리
    await teamDB.updateMatchingResponseFalse(conn, ourteamId, partnerTeamId);

    // 관련 state, pageNum 업데이트
    if (!!ourteamNewState) {
      await teamDB.updateTeamState(conn, ourteamId, ourteamNewState);
    }
    if (!!ourteamNewPage) {
      await teamDB.updateTeamPageNum(conn, ourteamId, ourteamNewPage);
    }
    if (!!partnerTeamNewState) {
      await teamDB.updateTeamState(conn, partnerTeamId, partnerTeamNewState);
    }
    if (!!partnerTeamNewPage) {
      await teamDB.updateTeamPageNum(conn, partnerTeamId, partnerTeamNewPage);
    }

    return res
      .status(statusCode.OK)
      .send(util.success(statusCode.OK, responseMessage.MATCHING_REFUSE_SUCCESS, { success: true }));
  } catch (error) {
    return res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    conn.release();
  }
};
