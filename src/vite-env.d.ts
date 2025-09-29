/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEBSITE_PASSWORD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}