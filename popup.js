const STORAGE_KEY = 'chomeplus_enabled';
const toggle = document.getElementById('toggle');

chrome.storage.sync.get({ [STORAGE_KEY]: true }, (result) => {
  toggle.checked = result[STORAGE_KEY];
});

toggle.addEventListener('change', () => {
  chrome.storage.sync.set({ [STORAGE_KEY]: toggle.checked });
});

document.getElementById('settings').addEventListener('click', () => {
  chrome.tabs.create({ url: `chrome://extensions/?id=${chrome.runtime.id}` });
});
