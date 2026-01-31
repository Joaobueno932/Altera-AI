// Centralized environment resolution with safe dev defaults
// In development, we provide non-empty defaults for JWT_SECRET and VITE_APP_ID
// so that local features like /api/dev/login can operate without extra setup.
// In production, we do NOT provide defaults to avoid masking misconfiguration.

const isProduction = process.env.NODE_ENV === "production";

const rawAppId = process.env.VITE_APP_ID ?? "";
const rawCookieSecret = process.env.JWT_SECRET ?? "";

let resolvedAppId = rawAppId;
let resolvedCookieSecret = rawCookieSecret;

if (!isProduction) {
  if (!resolvedCookieSecret) {
    resolvedCookieSecret = "dev-secret-change-me";
    console.warn(
      "[ENV] JWT_SECRET is not set. Using a built-in DEV secret. Set JWT_SECRET to silence this warning."
    );
  }
  if (!resolvedAppId) {
    resolvedAppId = "dev-app";
    console.warn(
      "[ENV] VITE_APP_ID is not set. Using 'dev-app' for DEV. Set VITE_APP_ID to silence this warning."
    );
  }
}

export const ENV = {
  appId: resolvedAppId,
  cookieSecret: resolvedCookieSecret,
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction,
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
