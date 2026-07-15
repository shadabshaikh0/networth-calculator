// The OAuth Client ID is PUBLIC by design (it identifies the app, it is not a secret).
// It is protected by the "Authorized JavaScript origins" allowlist in Google Cloud.
// Provide it via .env.local as VITE_GOOGLE_CLIENT_ID — see .env.example.
export const CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) || "";

// drive.file  → app can only touch files it creates (narrow, avoids the restricted-scope
//               security assessment). openid/email/profile are non-sensitive identity scopes
//               so we can show which account is connected.
export const SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "openid",
  "email",
  "profile",
].join(" ");

// Marker we stamp on the Drive file so we can find "our" spreadsheet later
// (works within drive.file because we created the file).
export const APP_PROPERTY_KEY = "networthApp";
export const APP_PROPERTY_VALUE = "1";

export const SHEET_TITLE = "Net worth data";
export const SCHEMA_VERSION = "1";

/** Whether Google integration is configured at all. */
export const googleEnabled = () => CLIENT_ID.length > 0;
