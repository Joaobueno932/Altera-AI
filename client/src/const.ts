export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "App";

export const APP_LOGO = "https://placehold.co/128x128/E1E7EF/1F2937?text=App";

type OAuthFlowType = "signIn" | "signUp";

function buildOAuthUrl(type: OAuthFlowType) {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL as
    | string
    | undefined;
  const appId = import.meta.env.VITE_APP_ID as string | undefined;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  try {
    if (!oauthPortalUrl) throw new Error("Missing VITE_OAUTH_PORTAL_URL");
    // Ensure a valid absolute URL and append the app-auth path safely
    const base = new URL(oauthPortalUrl);
    const trimmedPath = base.pathname.replace(/\/+$/, "");
    base.pathname = `${trimmedPath}/app-auth`;

    if (appId) base.searchParams.set("appId", appId);
    base.searchParams.set("redirectUri", redirectUri);
    base.searchParams.set("state", state);
    base.searchParams.set("type", type);

    return base.toString();
  } catch (err) {
    // Be resilient if envs are not configured in dev/test to avoid hard crashes
    console.warn(
      "[Auth] VITE_OAUTH_PORTAL_URL is not configured or invalid. Using /api/dev/login fallback in dev.",
    );
    // In development, use local dev-login endpoint that sets a session cookie.
    return "/api/dev/login";
  }
}

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => buildOAuthUrl("signIn");

// Generate signup URL to explicitly start a registration flow (if supported by the portal)
export const getSignupUrl = () => buildOAuthUrl("signUp");
