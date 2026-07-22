/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_VIETQR_BANK_ID?: string;
  readonly VITE_VIETQR_ACCOUNT_NO?: string;
  readonly VITE_VIETQR_ACCOUNT_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}