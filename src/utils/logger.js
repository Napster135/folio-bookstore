import winston from "winston";

const customLevelsOptions = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    verbose: 5,
  },
  colors: {
    fatal: "magenta",
    error: "red",
    warning: "yellow",
    info: "green",
    http: "cyan",
    verbose: "gray",
  },
};

const logger = winston.createLogger({
  levels: customLevelsOptions.levels,
  transports: [
    new winston.transports.Console({
      level: "info",
      format: winston.format.combine(
        winston.format.colorize({ colors: customLevelsOptions.colors }),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      filename: "./error.log",
      level: "warning",
      format: winston.format.simple(),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 3,
    }),
  ],
});

const addLogger = (req, res, next) => {
  req.logger = logger;
  req.logger.http(
    `${req.method} en ${req.url} - ${new Date().toLocaleString()}`
  );
  next();
};

export default addLogger;