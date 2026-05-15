export {};

declare module '@remix-run/node' {
  interface AppLoadContext {
    cloudflare?: {
      env: Env;
    };
  }
}
