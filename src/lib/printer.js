function info(message) {
  console.log(`[INFO]: ${message}`);
}

function warn(message) {
  console.log(`[WARN]: ${message}`);
}

function error(message) {
  console.error(`[ERROR]: ${message}`);
}

module.exports = {
  info,
  warn,
  error,
};
