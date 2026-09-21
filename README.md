# ChomePlus – Nag Prompt Blocker

Blocks the common "nag" prompts websites use to interrupt you: PWA install
prompts, notification permission requests, leave-site dialogs, sign-in
overlays, location requests, and (optionally) in-page app/cookie banners.

Each blocker can be turned on or off independently from the popup, and each
toggle has an info button linking to the matching section below.

## Load it in Chrome

1. Open `chrome://extensions`
2. Turn on **Developer mode** (top right)
3. Click **Load unpacked**
4. Select this folder (`chomeplus`)

Requires Chrome 111+ (for `MAIN`-world content scripts, used by a few of the
blockers below).

## Usage

Click the extension icon to open the popup and flip any toggle. Reload open
tabs after changing a setting so it applies cleanly everywhere.

## Features

### Block install prompts

Removes Chrome's "Install app" icon (in the address bar) and any in-page
"Install" button that appears on pages installable as a Chrome app (PWA).

**How:** strips `<link rel="manifest">` tags from every page as soon as
they're added to the DOM, so Chrome never detects the page as installable
and the omnibox install icon never appears. Also intercepts the
`beforeinstallprompt` event before page scripts can react to it, so a
site's own custom "Install" button (which relies on that event) never
activates either.

**Default:** on.

### Block push notification prompts

Stops sites from popping the native "Allow notifications?" dialog —
arguably the most abused nag pattern on the web, widely used for spam and
phishing persistence.

**How:** overrides `Notification.requestPermission()` in the page's own JS
context (a `MAIN`-world content script) so it resolves immediately as
`"denied"` without ever showing the native prompt. Sites that already have
notification permission from before you installed this extension are
unaffected — this only blocks *new* prompts.

**Default:** on.

### Block leave site dialogs

Stops sites from hijacking tab-close or back-navigation with a "Leave
site? Changes you made may not be saved" confirmation dialog.

**How:** registers a `beforeunload` listener before any page script can
run (`document_start`) and calls `stopImmediatePropagation()`, so the
page's own `beforeunload` handler — whether added via `addEventListener`
or `window.onbeforeunload` — never runs and never gets the chance to
trigger the dialog.

**Default:** on.

### Block sign in prompts

Stops native "Sign in with Google" one-tap / FedCM overlays from
appearing uninvited.

**How:** overrides `navigator.credentials.get()` in the page's own JS
context, but only for calls that include an `identity` option (the FedCM
shape). Password and WebAuthn/passkey credential requests are passed
through untouched, so your password manager and passkey sign-in keep
working normally.

**Default:** on.

### Block location prompts

Stops sites from triggering the native "Use your location?" permission
dialog.

**How:** overrides `navigator.geolocation.getCurrentPosition()` and
`watchPosition()` in the page's own JS context to immediately report a
"permission denied" error, without ever showing the native prompt.

**Default:** on.

### Hide open in app banners

Hides "Open in app" / smart-app banners that nag you to switch to a
native app (common on Reddit, Instagram, Medium-style sites).

**How:** this isn't a browser API interception like the features above —
these banners are just regular page content, so this works by hiding
elements matching common banner class/id patterns (`app-banner`,
`smart-banner`, `open-in-app`, etc.) via injected CSS. Because it's
pattern-based, it can occasionally hide unrelated page elements that
happen to share those naming conventions.

**Default: off** (experimental — enable if you don't mind the occasional
false positive).

### Hide cookie consent banners

Hides cookie-consent / GDPR nag banners.

**How:** same technique as the app-banner blocker above — CSS injected
against common class/id patterns (`cookie-consent`, `cookie-banner`,
`gdpr-banner`, etc.), not a browser API. Same false-positive caveat
applies, and note this only *hides* the banner — it doesn't interact with
any underlying consent state, so some sites may still behave as if you
haven't responded.

**Default: off** (experimental — enable if you don't mind the occasional
false positive).
