(() => {
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

  // Defaults apply immediately so the very first call a page makes is still
  // blocked; content.js (isolated world) relays the real stored settings a
  // moment later since this MAIN-world script can't read chrome.storage itself.
  let settings = { ...DEFAULTS };

  window.addEventListener(SETTINGS_EVENT, (event) => {
    if (event && event.detail) {
      settings = { ...DEFAULTS, ...event.detail };
    }
  });

  // ---- Notification permission prompts ----

  if (window.Notification && Notification.requestPermission) {
    const originalRequestPermission = Notification.requestPermission.bind(Notification);
    Notification.requestPermission = function (callback) {
      if (settings.notifications) {
        if (typeof callback === 'function') callback('denied');
        return Promise.resolve('denied');
      }
      return originalRequestPermission(callback);
    };
  }

  // ---- Geolocation prompts ----

  if (window.navigator && navigator.geolocation) {
    const geo = navigator.geolocation;
    const originalGetCurrentPosition = geo.getCurrentPosition.bind(geo);
    const originalWatchPosition = geo.watchPosition.bind(geo);

    function deniedError() {
      return {
        code: 1,
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
        message: 'User denied Geolocation',
      };
    }

    geo.getCurrentPosition = function (success, error, options) {
      if (settings.geolocation) {
        if (typeof error === 'function') error(deniedError());
        return;
      }
      return originalGetCurrentPosition(success, error, options);
    };

    geo.watchPosition = function (success, error, options) {
      if (settings.geolocation) {
        if (typeof error === 'function') error(deniedError());
        return -1;
      }
      return originalWatchPosition(success, error, options);
    };
  }

  // ---- FedCM / "Sign in with Google" one-tap prompts ----
  // Only intercepts identity (FedCM) requests, never password or WebAuthn/
  // passkey credential requests, so the password manager keeps working.

  if (window.navigator && navigator.credentials && navigator.credentials.get) {
    const originalGet = navigator.credentials.get.bind(navigator.credentials);
    navigator.credentials.get = function (options) {
      if (settings.fedcm && options && options.identity) {
        return Promise.reject(new DOMException('The user aborted the sign-in request.', 'AbortError'));
      }
      return originalGet(options);
    };
  }
})();
