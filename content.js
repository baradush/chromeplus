(() => {
  const STORAGE_KEY = 'chomeplus_settings';
  const LEGACY_KEY = 'chomeplus_enabled';
  const SETTINGS_EVENT = 'chomeplus:settings';

  const DEFAULTS = {
    installBlock: true,
    notifications: true,
    beforeunload: true,
    fedcm: true,
    geolocation: true,
    appBanners: false,
    cookieBanners: false,
  };

  let settings = { ...DEFAULTS };

  function broadcastSettings() {
    // Relays settings to page-guard.js, which runs in the page's own JS
    // context (MAIN world) and can't read chrome.storage directly.
    window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: settings }));
  }

  // ---- Install prompt blocking ----

  function removeManifestLinks(root) {
    root.querySelectorAll('link[rel~="manifest"]').forEach((link) => link.remove());
  }

  function blockInstallPrompt(event) {
    if (!settings.installBlock) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }
  window.addEventListener('beforeinstallprompt', blockInstallPrompt, true);

  function startManifestBlocking() {
    removeManifestLinks(document);
    const observer = new MutationObserver((mutations) => {
      if (!settings.installBlock) return;
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
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
  startManifestBlocking();

  // ---- "Leave site?" dialog blocking ----
  // The dialog only appears if a page's own beforeunload listener runs and
  // calls preventDefault()/sets returnValue. Registering first (document_start)
  // and stopping propagation keeps the page's listeners from ever running.

  function blockBeforeUnload(event) {
    if (!settings.beforeunload) return;
    event.stopImmediatePropagation();
  }
  window.addEventListener('beforeunload', blockBeforeUnload, true);

  // ---- Cosmetic banner hiding (heuristic, off by default) ----

  const APP_BANNER_SELECTORS = [
    '[class*="app-banner" i]',
    '[id*="app-banner" i]',
    '[class*="smart-banner" i]',
    '[id*="smart-banner" i]',
    '[class*="open-in-app" i]',
    '[id*="open-in-app" i]',
    '[class*="get-the-app" i]',
    '[id*="get-the-app" i]',
    'meta[name="apple-itunes-app"]',
  ];

  const COOKIE_BANNER_SELECTORS = [
    '[class*="cookie-consent" i]',
    '[id*="cookie-consent" i]',
    '[class*="cookie-banner" i]',
    '[id*="cookie-banner" i]',
    '[class*="cookie-notice" i]',
    '[id*="cookie-notice" i]',
    '[class*="consent-banner" i]',
    '[id*="consent-banner" i]',
    '[class*="gdpr-banner" i]',
    '[id*="gdpr-banner" i]',
  ];

  let styleEl = null;

  function updateCosmeticStyle() {
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'chomeplus-cosmetic-style';
      document.documentElement.appendChild(styleEl);
    }
    const rules = [];
    if (settings.appBanners) {
      rules.push(`${APP_BANNER_SELECTORS.join(',\n')} { display: none !important; }`);
    }
    if (settings.cookieBanners) {
      rules.push(`${COOKIE_BANNER_SELECTORS.join(',\n')} { display: none !important; }`);
    }
    styleEl.textContent = rules.join('\n');
  }
  updateCosmeticStyle();

  // ---- Settings sync ----

  chrome.storage.sync.get({ [STORAGE_KEY]: DEFAULTS }, (result) => {
    settings = { ...DEFAULTS, ...result[STORAGE_KEY] };
    updateCosmeticStyle();
    broadcastSettings();
  });

  // Drop the old single-flag setting from earlier versions of the extension.
  chrome.storage.sync.remove(LEGACY_KEY);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && STORAGE_KEY in changes) {
      settings = { ...DEFAULTS, ...changes[STORAGE_KEY].newValue };
      updateCosmeticStyle();
      broadcastSettings();
    }
  });
})();
