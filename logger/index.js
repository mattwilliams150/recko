// const { format, createLogger, transports } = require("winston");
// const { timestamp, combine, printf, errors } = format;
// const winston = require('winston');

// function logger() {
//     const logFormat = printf(({ level, message, timestamp, stack }) => {
//       return `${timestamp} ${level}: ${stack || message}`;
//     });
//     return createLogger({
//       level:"error",
//       format: format.combine(
//         format.colorize({ message: false }),
//         format.simple()
//        ),
//       "transports": [new winston.transports.File({ filename: 'error.log', level: 'error' })]
//     });
// }
var winston = require("winston");

var logger = winston.createLogger({
  levels: winston.config.npm.levels,
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "error.log",
    }),
  ],
});

module.exports = logger;
