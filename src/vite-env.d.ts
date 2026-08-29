/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_GROQ_MODEL_FAST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
