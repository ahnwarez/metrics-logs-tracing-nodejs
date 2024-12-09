const express = require("express");
const pino = require("pino");

const transport = pino.transport({
  targets: [
    {
      target: "pino/file",
      options: { destination: 1 }, // stdout
      level: "info",
    },
    {
      target: "pino-loki",
      options: {
        batching: true,
        interval: 5,
        host: "http://loki:3100",
      },
      level: "info",
    },
  ],
});

const logger = pino(transport);

const app = express();

// Use pino-http for HTTP request logging
app.use(
  require("pino-http")({
    logger,
    customLogLevel: (res) => {
      if (res.statusCode >= 400) return "error";
      return "info";
    },
  })
);

app.get("/", (_, res) => {
  // Logs go directly to stdout
  logger.info("hello from info and express");
  logger.warn("hello from warn and express");
  logger.error("hello from error and express");
  res.send("Hello World!");
});

app.listen(3000, () => {
  logger.info("Server started on port 3000");
});
