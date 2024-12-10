import express from "express";
import pino from "pino";
import { pinoHttp } from "pino-http";
import "./tracing.js";
import { trace } from "@opentelemetry/api";

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
  pinoHttp({
    logger,
    customLogLevel: (res) => {
      if (res.statusCode >= 400) return "error";
      return "info";
    },
  })
);

app.get("/", async (_, res) => {
  logger.info("hello from info and express");
  logger.warn("hello from warn and express");
  logger.error("hello from error and express");

  // Use startActiveSpan to properly handle context
  const span = trace.getTracer("hello-tracer").startSpan("get_all_users");
  span.setAttribute("endpoint", "/");
  try {
    res.send("Hello World!");
  } catch (error) {
    span.recordException(error);
    res.status(500).json({ error: error.message });
  } finally {
    span.end();
  }
});

app.listen(3000, () => {
  logger.info("Server started on port 3000");
});
