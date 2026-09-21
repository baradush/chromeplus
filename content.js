(() => {
  const STORAGE_KEY = 'chomeplus_enabled';

  let enabled = true;

  function removeManifestLinks(root) {
    const links = root.querySelectorAll('link[rel~="manifest"]');
    links.forEach((link) => link.remove());
  }

  function blockInstallPrompt(event) {
    if (!enabled) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  // Capture phase + registered before any page script can run (document_start),
  // so this swallows the event before a site's own "Install" button logic sees it.
  window.addEventListener('beforeinstallprompt', blockInstallPrompt, true);

  function startManifestBlocking() {
    removeManifestLinks(document);

    const observer = new MutationObserver((mutations) => {
      if (!enabled) return;
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches('link[rel~="manifest"]')) {
            node.remove();
          } else {
            removeManifestLinks(node);
          }
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  startManifestBlocking();

  chrome.storage.sync.get({ [STORAGE_KEY]: true }, (result) => {
    enabled = result[STORAGE_KEY];
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && STORAGE_KEY in changes) {
      enabled = changes[STORAGE_KEY].newValue;
    }
  });
})();
