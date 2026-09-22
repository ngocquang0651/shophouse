import type { Params } from "nestjs-pino";
import { randomUUID } from "node:crypto";

/**
 * Only the fields worth reading. The default serializers dump every request and
 * response header on every line, which buries the signal and would log the
 * session cookie.
 */
const serializers = {
  req: (request: { id: unknown; method: string; url: string }) => ({
    id: request.id,
    method: request.method,
    url: request.url
  }),
  res: (response: { statusCode: number }) => ({ statusCode: response.statusCode })
};

/**
 * Structured JSON logs in production with a request id on every line, and the
 * familiar human-readable output while developing.
 */
export function buildLoggerOptions(isProduction: boolean): Params {
  return {
    pinoHttp: {
      level: isProduction ? "info" : "debug",
      genReqId: (request, response) => {
        const existing = request.headers["x-request-id"];
        const id = (Array.isArray(existing) ? existing[0] : existing) ?? randomUUID();
        response.setHeader("x-request-id", id);
        return id;
      },
      serializers,
      autoLogging: {
        ignore: (request) => request.url === "/health"
      },
      customLogLevel: (_request, response, error) => {
        if (error || response.statusCode >= 500) return "error";
        if (response.statusCode >= 400) return "warn";
        return "info";
      },
      transport: isProduction ? undefined : { target: "pino-pretty", options: { singleLine: true } }
    }
  };
}
