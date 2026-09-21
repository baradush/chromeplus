# ChomePlus – Block App Install Prompt

Removes Chrome's "Install app" icon (in the address bar) and any in-page
"Install" button that appears on pages installable as a Chrome app (PWA).

## How it works

- Strips `<link rel="manifest">` tags from every page as soon as they're
  added to the DOM, so Chrome never detects the page as installable and the
  omnibox install icon never appears.
- Intercepts the `beforeinstallprompt` event before page scripts can react
  to it, so a site's own custom "Install" button (which relies on that
  event) never activates either.

## Load it in Chrome

1. Open `chrome://extensions`
2. Turn on **Developer mode** (top right)
3. Click **Load unpacked**
4. Select this folder (`chomeplus`)

## Usage

Click the extension icon to toggle blocking on/off. Reload any open tabs
after changing the toggle for it to take effect on them.
