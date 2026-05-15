import { RemixBrowser } from '@remix-run/react';
import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';

function hydrate() {
  startTransition(() => {
    hydrateRoot(
      document.getElementById('root')!,
      <StrictMode>
        <RemixBrowser />
      </StrictMode>,
    );
  });
}

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate);
} else {
  // Safari and older browsers
  window.setTimeout(hydrate, 1);
}
