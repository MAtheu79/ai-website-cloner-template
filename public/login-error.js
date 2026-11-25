/**
 * OAuth callback recovery params.
 *
 * When a sign-in bounce fails at the provider callback, the backend records the
 * real cause in error_events and redirects back to the sanitized return target
 * with `login_error` (a stable code) and `login_request_id` (for support).
 * The sign-in modal reads them through this module so the user sees an
 * actionable retry instead of a silent bounce.
 */

export const LOGIN_ERROR_PARAM = "login_error";
export const LOGIN_ERROR_REQUEST_ID_PARAM = "login_request_id";

const LOGIN_ERROR_MESSAGES = {
  oauth_exchange_failed: "Sign-in didn't complete — the provider handshake failed. Please try again.",
  oauth_profile_failed: "Sign-in didn't complete — we couldn't read your account from the provider. Please try again.",
  oauth_email_missing: "Your provider account didn't share an email address. Add one there, or sign in another way.",
  oauth_account_failed: "Sign-in didn't complete — we couldn't set up your account. Please try again.",
  oauth_session_failed: "We couldn't finish signing you in. Please try again.",
  oauth_provider_not_configured: "That sign-in provider isn't available here. Please pick another one.",
  oauth_existing_provider_required: "This email already has a Linen account. Sign in using the provider you used originally.",
  openai_account_link_required: "This email already has a Linen account. Sign in with your existing method, then connect ChatGPT from your profile settings.",
  promotion_unavailable: "That promotion is unavailable, expired, or fully claimed. Try signing up again without it, or use another promotion link.",
};

/** Human-readable message for a stable login_error code. */
export function loginErrorMessage(code) {
  const key = String(code ?? "").trim();
  return LOGIN_ERROR_MESSAGES[key] || "Sign-in failed. Please try again.";
}

/**
 * Extracts {code, requestId} from a query string (or URLSearchParams), or null
 * when no login error is present.
 */
export function extractLoginError(search) {
  const params = search instanceof URLSearchParams ? search : new URLSearchParams(String(search ?? ""));
  const code = String(params.get(LOGIN_ERROR_PARAM) ?? "").trim();
  if (!code) return null;
  return {
    code,
    requestId: String(params.get(LOGIN_ERROR_REQUEST_ID_PARAM) ?? "").trim(),
  };
}

/**
 * Returns `search` (a query string with or without the leading "?") with the
 * login-error params removed, so a refresh or a copied URL does not re-show a
 * stale failure. Returns the "?..."-prefixed remainder, or "" when empty.
 */
export function stripLoginErrorParams(search) {
  const params = new URLSearchParams(String(search ?? "").replace(/^\?/, ""));
  params.delete(LOGIN_ERROR_PARAM);
  params.delete(LOGIN_ERROR_REQUEST_ID_PARAM);
  const rest = params.toString();
  return rest ? `?${rest}` : "";
}
