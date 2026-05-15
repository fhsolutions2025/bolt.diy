import type { AppLoadContext, EntryContext } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { isbot } from 'isbot';
import { renderToReadableStream } from 'react-dom/server';
import { renderHeadToString } from 'remix-island';
import { Head } from './root';
import { themeStore } from '~/lib/stores/theme';

const ABORT_DELAY = 5000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  _loadContext: AppLoadContext,
) {
  const userAgent = request.headers.get('user-agent');
  const isBot = isbot(userAgent || '');
  const head = renderHeadToString({ request, remixContext, Head });
  const encoder = new TextEncoder();

  const reactStream = await renderToReadableStream(
    <RemixServer context={remixContext} url={request.url} />,
    {
      signal: AbortSignal.timeout(ABORT_DELAY),
      onError(error: unknown) {
        responseStatusCode = 500;
        console.error(error);
      },
    },
  );

  if (isBot) {
    await reactStream.allReady;
  }

  const prefix = `<!DOCTYPE html><html lang="en" data-theme="${themeStore.value}"><head>${head}</head><body><div id="root" class="w-full h-full">`;
  const suffix = '</div></body></html>';

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(prefix));

      const reader = reactStream.getReader();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        controller.enqueue(value);
      }

      controller.enqueue(encoder.encode(suffix));
      controller.close();
    },
  });

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Cross-Origin-Embedder-Policy', 'credentialless');
  responseHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');

  return new Response(stream, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
