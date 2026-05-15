// We no longer import from 'wrangler' as we are on a Node/Vercel infrastructure
declare module '@remix-run/node' {
  interface AppLoadContext {
    // Define any custom context you want to pass to your loaders here.
    // For now, we keep it empty or add standard Node properties.
    env: ProcessEnv;
  }
}

interface ProcessEnv {
  [key: string]: string | undefined;
}

export {};
