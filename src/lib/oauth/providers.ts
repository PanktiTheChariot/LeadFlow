export interface OAuthProviderConfig {
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope: string;
  clientId: string | undefined;
  clientSecret: string | undefined;
}

/**
 * Each provider is just a config object consumed by one shared start/callback
 * implementation - adding a second provider (e.g. GitHub) means adding an
 * entry here, not duplicating the PKCE dance.
 */
const PROVIDER_FACTORIES: Record<string, () => OAuthProviderConfig> = {
  google: () => ({
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://openidconnect.googleapis.com/v1/userinfo",
    scope: "openid email profile",
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }),
};

export function isOAuthProviderId(id: string): boolean {
  return id in PROVIDER_FACTORIES;
}

export function getOAuthProvider(id: string): OAuthProviderConfig | null {
  const factory = PROVIDER_FACTORIES[id];
  return factory ? factory() : null;
}
