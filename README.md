# AgeWallet Simple JS Integration

Protect your website with age verification in minutes using the AgeWallet Simple JS loader. This script works on any website, including Wix, Squarespace, Webflow, and static HTML.

## Installation

### Step 1: Get Your Credentials

1. Log in to the [AgeWallet Dashboard](https://app.agewallet.io).
2. Create a new Client.
3. In the **Redirect URI** field, enter your website's **Root URL** exactly (e.g., `https://mywinery.com`).
   - **IMPORTANT:** Do not include a trailing slash (use `https://site.com`, NOT `https://site.com/`).
4. Copy your **Client ID**.

### Step 2: Add the Script

Paste the following code snippet inside the `<head>` tag of **every page** you want to protect.

**Placement:** Place this as close to the top of the `<head>` as possible to prevent content flashing (FOUC) before the verification gate loads.

#### Basic Usage (Default Style)

```html
<script
    src="https://cdn.jsdelivr.net/gh/agewallet-client/agewallet-simple-js@1/aw-loader.js"
    data-client-id="YOUR_CLIENT_ID">
</script>
```

**Replace `YOUR_CLIENT_ID` with your actual Client ID from Step 1.**

That's it! The age gate will now protect your content.

---

## Customization Options

### Data Attributes

Customize the age gate by adding `data-` attributes to your script tag:

| Attribute | Description | Default Value |
|-----------|-------------|---------------|
| `data-client-id` | **Required.** Your AgeWallet Client ID. | None |
| `data-title` | Main headline text on the gate. | "Age Verification" |
| `data-description` | Message body text. | "You must verify your age to view this content." |
| `data-logo` | URL to your logo image. | AgeWallet logo |
| `data-yes-label` | Text for the verify button. | "Verify with AgeWallet" |
| `data-no-label` | Text for the deny button. | "I Disagree" |
| `data-error-msg` | Message shown when user clicks deny. | "Sorry, you do not meet the minimum requirements." |
| `data-expiry` | Session duration in minutes. | `1440` (24 hours) |
| `data-css` | URL to a custom CSS stylesheet for advanced styling. | None |

#### Advanced Example (Fully Customized)

```html
<script
    src="https://cdn.jsdelivr.net/gh/agewallet-client/agewallet-simple-js@1/aw-loader.js"
    data-client-id="YOUR_CLIENT_ID"
    data-title="Age Verification Required"
    data-description="Please confirm you are over 18 to enter."
    data-logo="https://yoursite.com/assets/logo.png"
    data-yes-label="Verify Now"
    data-no-label="I am under 18"
    data-error-msg="Access denied."
    data-expiry="60"
    data-css="https://yoursite.com/custom-gate-styles.css">
</script>
```

---

## Custom CSS Styling

Use the `data-css` attribute to link to your own stylesheet for complete design control.

### Available CSS Selectors

Target these classes to customize the appearance:

#### Gate Container

- `.aw-gate-overlay` - Full-screen overlay background
- `.aw-gate-card` - Main gate card container

#### Content Elements

- `.aw-gate-logo` - Logo image
- `.aw-gate-title` - Main headline
- `.aw-gate-desc` - Description text
- `.aw-gate-buttons` - Button container
- `.aw-disclaimer` - Footer disclaimer text

#### Buttons

- `.aw-btn` - Base button style (both buttons)
- `.aw-btn-yes` - Verify button
- `.aw-btn-no` - Deny button
- `.aw-btn:hover` - Button hover state

#### Messages

- `.aw-error` - Error message (shown when deny is clicked)

#### Error Screen

- `.aw-error-card` - Configuration error container
- `.aw-error-title` - Error headline
- `.aw-error-desc` - Error description

### Example Custom CSS

Create a file at `https://yoursite.com/custom-gate-styles.css`:

```css
/* Override card background */
.aw-gate-card {
    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    border: 2px solid gold;
}

/* Customize title */
.aw-gate-title {
    color: gold;
    font-family: 'Georgia', serif;
}

/* Style the verify button */
.aw-btn-yes {
    background: gold;
    color: #000;
}

.aw-btn-yes:hover {
    background: #ffd700;
    transform: scale(1.05);
}

/* Custom logo sizing */
.aw-gate-logo {
    max-width: 200px;
}
```

Then reference it in your script tag:

```html
<script
    src="https://cdn.jsdelivr.net/gh/agewallet-client/agewallet-simple-js@1/aw-loader.js"
    data-client-id="YOUR_CLIENT_ID"
    data-css="https://yoursite.com/custom-gate-styles.css">
</script>
```

---

## How It Works

1. **Script loads** in the `<head>` and immediately hides page content
2. **Session check** - If user has a valid session, content is unlocked immediately
3. **Age gate appears** - If no session, the verification gate is shown
4. **OAuth flow** - When user clicks verify, a popup opens to AgeWallet
5. **Verification** - User verifies their age with AgeWallet
6. **Session created** - Upon success, a session is stored (localStorage + cookie)
7. **Content unlocked** - Gate is removed and content is shown

The session persists across page navigations and browser tabs for the duration specified in `data-expiry`.

---

## Known Issues

### Safari Private Browsing Mode

**Issue:** Age verification may fail intermittently in Safari Private Browsing mode on macOS and iOS.

**Cause:** Safari's enhanced privacy features in Private mode block the cross-window communication mechanisms used by the OAuth flow.

**Symptoms:**

- Verification popup opens successfully
- User completes verification on AgeWallet
- Popup redirects back to your site but verification times out after 2 minutes
- User sees "Verification timed out" alert message

**Workarounds:**

1. **Retry verification** - Sometimes works on second attempt
2. **Use normal browsing mode** - Works reliably 100% of the time
3. **Use a different browser** - Chrome, Firefox, and Edge all work reliably in private/incognito mode

**Important:** This issue only affects Safari Private mode. The script works reliably in:

- ✅ Safari (normal mode)
- ✅ Chrome (normal & incognito)
- ✅ Firefox (normal & private)
- ✅ Edge (normal & InPrivate)

---

## Troubleshooting

### Gate appears but verification fails

- Ensure your **Redirect URI** in the AgeWallet Dashboard matches your website's address exactly (including `https://`)
- Check that you're not including a trailing slash in the Redirect URI

### Gate doesn't appear

- Open your browser console (F12) and check for errors
- Verify the script tag is placed in the `<head>` section
- Confirm your `data-client-id` is correct

### Content flashes before gate appears (FOUC)

- Move the script tag **higher** in your `<head>` section
- The script must load before any content is rendered

### Popups are blocked

- Ensure your browser allows popups for your domain
- Some aggressive ad blockers may interfere with the OAuth popup
- Add an exception for your domain in popup blocker settings

---

## Browser Support

- ✅ Chrome (normal & incognito)
- ✅ Firefox (normal & private)
- ✅ Edge (normal & InPrivate)
- ✅ Safari (normal mode)
- ⚠️ Safari Private Mode (intermittent - see Known Issues)

---

## Session Storage

The script uses a dual-storage approach for reliability:

- **localStorage** - Primary storage method
- **Cookies** - Fallback if localStorage is unavailable

Sessions are namespaced by your Client ID, so multiple AgeWallet applications can coexist on the same domain.

---

## Security Features

- **PKCE (Proof Key for Code Exchange)** - Prevents authorization code interception
- **State validation** - Protects against CSRF attacks
- **Nonce verification** - Prevents replay attacks
- **Client-side only** - No server required
- **Session expiration** - Automatic timeout after specified duration

---

## Support

For questions or issues:

- Email: [support@agewallet.com](mailto:support@agewallet.com)
- Documentation: [docs.agewallet.com](https://docs.agewallet.com)
- Dashboard: [app.agewallet.io](https://app.agewallet.io)