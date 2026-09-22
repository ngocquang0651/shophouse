/**
 * Boot-time environment validation.
 *
 * The app refuses to start on a bad configuration instead of silently falling
 * back to a development default, because a missing JWT_SECRET in production
 * would let anyone forge an admin token.
 */

export const DEV_JWT_SECRET = "luxestore_dev_secret";
export const MIN_PRODUCTION_JWT_SECRET_LENGTH = 32;
export const DEFAULT_PORT = 4000;
export const DEFAULT_JWT_EXPIRES_IN = "7d";
export const DEFAULT_FRONTEND_URL = "http://localhost:3000";

export type NodeEnv = "development" | "production" | "test";

export type EnvConfig = {
  NODE_ENV: NodeEnv;
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  FRONTEND_URL: string;
  FRONTEND_URLS: string;
};

const nodeEnvs: readonly NodeEnv[] = ["development", "production", "test"];

function readString(raw: Record<string, unknown>, key: string) {
  const value = raw[key];
  return typeof value === "string" ? value.trim() : "";
}

export function validateEnv(raw: Record<string, unknown>): EnvConfig {
  const errors: string[] = [];

  const nodeEnvValue = readString(raw, "NODE_ENV") || "development";
  if (!(nodeEnvs as readonly string[]).includes(nodeEnvValue)) {
    errors.push(`NODE_ENV must be one of ${nodeEnvs.join(", ")} (received "${nodeEnvValue}").`);
  }
  const nodeEnv = nodeEnvValue as NodeEnv;
  const isProduction = nodeEnv === "production";

  const portValue = readString(raw, "PORT");
  const port = portValue === "" ? DEFAULT_PORT : Number(portValue);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    errors.push(`PORT must be an integer between 1 and 65535 (received "${portValue}").`);
  }

  const mongoUri = readString(raw, "MONGODB_URI");
  if (mongoUri === "") {
    errors.push("MONGODB_URI is required.");
  } else if (!/^mongodb(\+srv)?:\/\//.test(mongoUri)) {
    errors.push("MONGODB_URI must start with mongodb:// or mongodb+srv://.");
  }

  const jwtSecret = readString(raw, "JWT_SECRET");
  if (jwtSecret === "") {
    errors.push("JWT_SECRET is required.");
  } else if (isProduction && jwtSecret === DEV_JWT_SECRET) {
    errors.push("JWT_SECRET must not be the development default in production.");
  } else if (isProduction && jwtSecret.length < MIN_PRODUCTION_JWT_SECRET_LENGTH) {
    errors.push(`JWT_SECRET must be at least ${MIN_PRODUCTION_JWT_SECRET_LENGTH} characters in production.`);
  }

  const jwtExpiresIn = readString(raw, "JWT_EXPIRES_IN") || DEFAULT_JWT_EXPIRES_IN;
  if (!/^\d+(ms|s|m|h|d|w|y)?$/.test(jwtExpiresIn)) {
    errors.push(`JWT_EXPIRES_IN must be a duration such as 7d, 12h or 900s (received "${jwtExpiresIn}").`);
  }

  const frontendUrl = readString(raw, "FRONTEND_URL") || DEFAULT_FRONTEND_URL;
  if (!isHttpUrl(frontendUrl)) {
    errors.push(`FRONTEND_URL must be an http(s) URL (received "${frontendUrl}").`);
  }

  const frontendUrls = readString(raw, "FRONTEND_URLS");
  for (const url of splitOrigins(frontendUrls)) {
    if (!isHttpUrl(url)) {
      errors.push(`FRONTEND_URLS contains an invalid origin: "${url}".`);
    }
  }

  if (errors.length) {
    throw new Error(`Invalid environment configuration:\n- ${errors.join("\n- ")}`);
  }

  return {
    NODE_ENV: nodeEnv,
    PORT: port,
    MONGODB_URI: mongoUri,
    JWT_SECRET: jwtSecret,
    JWT_EXPIRES_IN: jwtExpiresIn,
    FRONTEND_URL: frontendUrl,
    FRONTEND_URLS: frontendUrls
  };
}

export function splitOrigins(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function isHttpUrl(value: string) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
