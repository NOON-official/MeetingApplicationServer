const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const example = async (conn, email) => {
  await conn.query('INSERT INTO `user` VALUES (?);', [email]);

  // 'mysql2/promise'는 결과값을 배열로 반환
  const [row] = await conn.query('SELECT * FROM `user`');

  return convertSnakeToCamel.keysToCamel(row[0]);
};

module.exports = { example };
