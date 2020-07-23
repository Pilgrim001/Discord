const moment = require('moment');

function formatMessage(username, text,role) {
  return {
    username,
    text,
    role,
    time: moment().format('MMMM Do YYYY, h:mm:ss a')
  };
}

module.exports = formatMessage;
