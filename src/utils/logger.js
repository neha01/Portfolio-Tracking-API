const { createLogger, format, transports } = require("winston");

// { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
const level = process.env.LOG_LEVEL || "debug";

function formatParams(info) {
    const { timestamp, level, message, ...args } = info;
    const ts = timestamp.slice(0, 19).replace("T", " ");

    return `${ts} ${level}: ${message} ${Object.keys(args).length
        ? JSON.stringify(args, "", "")
        : ""}`;
}

const developmentFormat = format.combine(
    format.colorize(),
    format.timestamp(),
    format.align(),
    format.printf(formatParams)
);

const productionFormat = format.combine(
    format.timestamp(),
    format.align(),
    format.printf(formatParams)
);

let logger;

if (process.env.NODE_ENV !== "production") {
    logger = createLogger({
        level: level,
        format: developmentFormat,
        transports: [new transports.Console()]
    });


} else {
    logger = createLogger({
        level: level,
        format: productionFormat,
        transports: [
            new transports.File({ filename: "error.log", level: "error" }),
            new transports.File({ filename: "combined.log" })
        ]
    });
};
logger.stream = {
    write: function (message, encoding) {
        // use the 'info' log level so the output will be picked up by both transports (file and console)
        logger.info(message);
    },
};

module.exports = logger;