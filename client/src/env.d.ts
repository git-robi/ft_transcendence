interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  // add other VITE_ variables you use
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}