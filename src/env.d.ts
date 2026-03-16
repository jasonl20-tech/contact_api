/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly CONTENTFUL_SPACE_ID: string;
  readonly CONTENTFUL_ACCESS_TOKEN: string;
  readonly CONTENTFUL_PREVIEW_TOKEN: string;
  readonly POLAR_ACCESS_TOKEN: string;
  readonly POLAR_ORGANIZATION_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
