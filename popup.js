const STORAGE_KEY = 'chomeplus_settings';
const DOCS_BASE = 'https://github.com/baradush/chromeplus/blob/main/README.md';

const DEFAULTS = {
  installBlock: true,
  notifications: true,
  beforeunload: true,
  fedcm: true,
  geolocation: true,
  appBanners: false,
  cookieBanners: false,
};

const FEATURES = [
  { key: 'installBlock', label: 'Block "Install app" prompts', slug: 'block-install-prompts' },
  { key: 'notifications', label: 'Block notification prompts', slug: 'block-push-notification-prompts' },
  { key: 'beforeunload', label: 'Block "leave site?" dialogs', slug: 'block-leave-site-dialogs' },
  { key: 'fedcm', label: 'Block sign-in prompts', slug: 'block-sign-in-prompts' },
  { key: 'geolocation', label: 'Block location prompts', slug: 'block-location-prompts' },
];

const EXPERIMENTAL_FEATURES = [
  { key: 'appBanners', label: 'Hide "open in app" banners', slug: 'hide-open-in-app-banners' },
  { key: 'cookieBanners', label: 'Hide cookie-consent banners', slug: 'hide-cookie-consent-banners' },
];

const INFO_ICON_SVG =
  '<svg viewBox="0 0 24 24"><path d="M11,7h2v2h-2V7z M11,11h2v6h-2V11z M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10' +
  'S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8S16.41,20,12,20z"/></svg>';

let settings = { ...DEFAULTS };

function openDocs(slug) {
  chrome.tabs.create({ url: `${DOCS_BASE}#${slug}` });
}

function buildRow(feature) {
  const inputId = `feat-${feature.key}`;

  const row = document.createElement('div');
  row.className = 'feature-row';

  const labelWrap = document.createElement('span');
  labelWrap.className = 'feature-label';

  const text = document.createElement('label');
  text.setAttribute('for', inputId);
  text.textContent = feature.label;

  const infoBtn = document.createElement('button');
  infoBtn.type = 'button';
  infoBtn.className = 'info-btn';
  infoBtn.title = 'Learn more';
  infoBtn.setAttribute('aria-label', `Learn more about: ${feature.label}`);
  infoBtn.innerHTML = INFO_ICON_SVG;
  infoBtn.addEventListener('click', () => openDocs(feature.slug));

  labelWrap.appendChild(text);
  labelWrap.appendChild(infoBtn);

  const switchLabel = document.createElement('label');
  switchLabel.className = 'switch';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = inputId;
  input.checked = settings[feature.key];
  input.addEventListener('change', () => {
    settings[feature.key] = input.checked;
    chrome.storage.sync.set({ [STORAGE_KEY]: settings });
  });

  const slider = document.createElement('span');
  slider.className = 'slider';

  switchLabel.appendChild(input);
  switchLabel.appendChild(slider);

  row.appendChild(labelWrap);
  row.appendChild(switchLabel);
  return row;
}

function render() {
  const container = document.getElementById('features');
  container.innerHTML = '';

  FEATURES.forEach((feature) => container.appendChild(buildRow(feature)));

  const caption = document.createElement('p');
  caption.className = 'section-caption';
  caption.textContent = 'Experimental — off by default';
  container.appendChild(caption);

  EXPERIMENTAL_FEATURES.forEach((feature) => container.appendChild(buildRow(feature)));
}

chrome.storage.sync.get({ [STORAGE_KEY]: DEFAULTS }, (result) => {
  settings = { ...DEFAULTS, ...result[STORAGE_KEY] };
  render();
});

document.getElementById('settings').addEventListener('click', () => {
  chrome.tabs.create({ url: `chrome://extensions/?id=${chrome.runtime.id}` });
});
