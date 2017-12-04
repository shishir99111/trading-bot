const pino = require('pino');

if (process.env.LOGGER_LEVEL == null) {
  throw new Error('LOGGER_LEVEL is missing in .env');
}
const levelMapper = {
  60: 'FATAL',
  50: 'ERROR',
  40: 'WARN',
  30: 'INFO',
  20: 'DEBUG',
  10: 'TRACE',
};

const pretty = pino.pretty({
  formatter: (data) => {
    delete data.hostname;
    delete data.name;
    data.level = levelMapper[data.level] || data.level;
    delete data.v;
    if (process.env.NODE_ENV === 'PRODUCTION') {
      return JSON.stringify(data);
    }
    return `${data.level}-${data.msg}`;
  },
});
pretty.pipe(process.stdout);

const log = pino({
  name: process.env.NODE_ENV,
  safe: true,
  level: process.env.LOGGER_LEVEL,
}, pretty);

module.exports = log;