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
