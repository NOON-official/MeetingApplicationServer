const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const example = async (userId, location, client) => {
  await client.query('UPDATE `user` SET photo=? WHERE id=?;', [location, userId]);
  const [row] = await client.query('SELECT * FROM `user` WHERE id=?;', [userId]);

  return convertSnakeToCamel.keysToCamel(row[0]);
};

module.exports = { example };
