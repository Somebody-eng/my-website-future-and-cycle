/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_ADSENSE_ENABLED?: string;
  readonly PUBLIC_ADSENSE_CLIENT?: string;
  readonly PUBLIC_GA_ID?: string;
  readonly PUBLIC_COMMENTS_ENABLED?: string;
  readonly PUBLIC_COMMENTS_API_URL?: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
