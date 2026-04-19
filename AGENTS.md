# Get-Cookies Firefox Plugin

## Project Overview

Chrome extension for capturing cookies, designed to work with the QD framework (https://github.com/qd-today/qd).

**User Goal:** Build a Firefox-compatible version of this extension.

## Architecture

- **Manifest V3** extension (version 2.2.3)
- **Service Worker:** `service_worker.js` - background script handling cookie retrieval
- **Content Script:** `js/cookie.js` - injected into matching pages
- **Options Page:** `options/options.html` + `options.js` - configure target URLs
- **Locales:** `_locales/zh_CN/` and `_locales/en/` for i18n

## Key Components

### Service Worker (`service_worker.js`)
- Listens for tab updates on configured URLs
- Injects content script into matching pages
- Handles `get_cookie` port connections
- Retrieves cookies via `chrome.cookies.getAll()`
- Returns cookies as JSON or error message if empty

### Content Script (`js/cookie.js`)
- Marks pages with `get-cookie` attribute
- Listens for clicks on elements with `data-toggle="get-cookie"`
- Communicates with service worker via `chrome.runtime.connect()`
- Posts cookie data back to page via `window.postMessage()`

### Options (`options/options.html`)
- Stores target URLs in `chrome.storage.sync`
- Default: `192.168.0.111`
- Multiple URLs supported (newline-separated)

## Firefox Compatibility Notes

Since Firefox supports Manifest V3:
- Keep `manifest_version: 3`
- Replace `chrome.*` APIs with `browser.*` or use webextension-polyfill
- Key APIs needed: `cookies`, `storage`, `scripting`, `activeTab`, `tabs`, `runtime`
- Service worker may need adjustment (Firefox uses persistent background scripts)

## Permissions

```json
{
  "permissions": ["cookies", "storage", "scripting", "activeTab"],
  "host_permissions": ["<all_urls>"]
}
```

## Development Workflow

1. **Load unpacked extension:**
   - Chrome: `chrome://extensions/` → "Load unpacked"
   - Firefox: `about:debugging` → "Load Temporary Add-on"

2. **Test:** Visit QD platform URL, click cookie export button

3. **Package:** Zip extension folder or use browser-specific build tools

## Testing Checklist

- [ ] Options page saves/loads target URLs
- [ ] Content script injects on matching URLs only
- [ ] Cookie retrieval works (non-empty)
- [ ] Empty cookies shows error message
- [ ] Confirm dialog appears before sending cookies
- [ ] postMessage communication with QD framework works

## Related Projects

- QD Framework: https://github.com/qd-today/qd
- Original GetCookies: https://github.com/acgotaku/GetCookies
