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
<script>(function(w,d,i,c){
    w.__awParams=location.search;
    var s=d.createElement('script');
    s.src='https://cdn.jsdelivr.net/gh/agewallet-client/agewallet-simple-js@1/aw-loader.min.js';
    s.setAttribute('data-client-id',i);
    if(c)Object.keys(c).forEach(function(k){s.setAttribute('data-'+k,c[k]);});
    d.head.appendChild(s);
})(window,document,'YOUR_CLIENT_ID',{
    // Uncomment and edit options below to customize:
    // logo: 'https://example.com/your-logo.png',
    // title: 'Age Verification Required',
    // description: 'You must be 18 or older to view this content.',
    // 'yes-label': 'Verify Now',
    // 'no-label': 'I am under 18',
    // 'error-msg': 'Access denied.',
    // expiry: '1440',
    // css: 'https://example.com/custom-gate-styles.css'
});</script>
```

**Replace `YOUR_CLIENT_ID` with your actual Client ID from Step 1.**

That's it! The age gate will now protect your content.

---

## Customization Options

Customize the age gate by uncommenting and editing the options in the config object:

| Option | Description | Default Value |
|--------|-------------|---------------|
| `logo` | URL to your logo image. | AgeWallet logo |
| `title` | Main headline text on the gate. | "Age Verification" |
| `description` | Message body text. | "You must verify your age to view this content." |
| `yes-label` | Text for the verify button. | "Verify with AgeWallet" |
| `no-label` | Text for the deny button. | "I Disagree" |
| `error-msg` | Message shown when user clicks deny. | "Sorry, you do not meet the minimum requirements." |
| `expiry` | Session duration in minutes. | `1440` (24 hours) |
| `css` | URL to a custom CSS stylesheet for advanced styling. | None |

#### Fully Customized Example

```html
<script>(function(w,d,i,c){
    w.__awParams=location.search;
    var s=d.createElement('script');
    s.src='https://cdn.jsdelivr.net/gh/agewallet-client/agewallet-simple-js@1/aw-loader.min.js';
    s.setAttribute('data-client-id',i);
    if(c)Object.keys(c).forEach(function(k){s.setAttribute('data-'+k,c[k]);});
    d.head.appendChild(s);
})(window,document,'YOUR_CLIENT_ID',{
    logo: 'https://yoursite.com/assets/logo.png',
    title: 'Age Verification Required',
    description: 'Please confirm you are over 18 to enter.',
    'yes-label': 'Verify Now',
    'no-label': 'I am under 18',
    'error-msg': 'Access denied.',
    expiry: '60',
    css: 'https://yoursite.com/custom-gate-styles.css'
});</script>
```

---

## Custom CSS Styling

Use the `css` option to link to your own stylesheet for complete design control.

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

---

## How It Works

1. **Script loads** in the `<head>` and immediately hides page content
2. **Session check** - If user has a valid session, content is unlocked immediately
3. **Age gate appears** - If no session, the verification gate is shown
4. **Redirect to AgeWallet** - When user clicks verify, they are redirected to AgeWallet
5. **Verification** - User verifies their age with AgeWallet
6. **Callback** - AgeWallet redirects back to your site with an authorization code
7. **Token exchange** - Script exchanges the code for a verified session
8. **Deep link restoration** - User is returned to the original page they were viewing
9. **Content unlocked** - Gate is removed and content is shown

The session persists across page navigations and browser tabs for the duration specified in the `expiry` option.

### Deep Link Support

If a user lands on a protected deep link (e.g., `/shop/product-123`) without a session:

1. The script saves their intended destination
2. User verifies through AgeWallet
3. After verification, user is automatically returned to `/shop/product-123`

---

## Troubleshooting

### Gate appears but verification fails

- Ensure your **Redirect URI** in the AgeWallet Dashboard matches your website's root URL exactly (including `https://`)
- Check that you're not including a trailing slash in the Redirect URI
- The Redirect URI should be your site root (e.g., `https://mysite.com`), not a specific page

### Gate doesn't appear

- Open your browser console (F12) and check for errors
- Verify the script is placed in the `<head>` section
- Confirm your Client ID is correct

### Content flashes before gate appears (FOUC)

- Move the script **higher** in your `<head>` section
- The script must load before any content is rendered

### "Invalid redirect URI" error

- Your Redirect URI in the AgeWallet Dashboard must exactly match your site's origin
- Use `https://mysite.com` (no trailing slash, no path)

---

## Browser Support

- ✅ Chrome (normal & incognito)
- ✅ Firefox (normal & private)
- ✅ Edge (normal & InPrivate)
- ✅ Safari (normal & private)

---

## Session Storage

The script uses a dual-storage approach for maximum compatibility:

- **localStorage** - Primary storage method
- **Cookies** - Fallback for browsers with restricted localStorage

Both storage methods contain the same session data with matching expiration times. Sessions are namespaced by your Client ID, so multiple AgeWallet applications can coexist on the same domain.

---

## Security Features

- **PKCE (Proof Key for Code Exchange)** - Prevents authorization code interception
- **State validation** - Protects against CSRF attacks
- **Nonce verification** - Prevents replay attacks
- **Stateless architecture** - PKCE verifier is encoded in state, no server-side session required
- **Session expiration** - Automatic timeout after specified duration

---

## Support

For questions or issues:

- Email: [support@agewallet.com](mailto:support@agewallet.com)
- Documentation: [agewallet.com/developers](https://agewallet.com/developers/)
- Dashboard: [app.agewallet.io](https://app.agewallet.io)