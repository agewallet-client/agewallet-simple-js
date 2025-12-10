(function() {
    // --- 1. Configuration ---
    var scriptTag = document.currentScript;
    if (!scriptTag) {
        console.error("[AgeWallet] Critical Error: document.currentScript is null");
        return;
    }

    var clientId = scriptTag.getAttribute("data-client-id");
    if (!clientId) {
        console.error("[AgeWallet] Missing data-client-id attribute.");
        return;
    }

    // --- CONSTANTS ---
    var STORAGE_KEY_SESSION = "aw_session_" + clientId; // The permanent session (verified: true)
    var STORAGE_KEY_SIGNAL  = "aw_signal_" + clientId;  // The handoff signal (code: '...')
    var STORAGE_KEY_OIDC    = "aw_oidc_" + clientId;    // PKCE secrets (verifier, state)

    // --- ASSETS & TEXT ---
    var defaultLogo = "https://www.agewallet.com/wp-content/uploads/2025/07/age-wallet-logo-light-tmb2-cleaned-300x225.png";
    var logoUrl = scriptTag.getAttribute("data-logo") || defaultLogo;
    var customCss = scriptTag.getAttribute("data-css");
    var textTitle = scriptTag.getAttribute("data-title") || "Age Verification";
    var textDesc = scriptTag.getAttribute("data-description") || "You must verify your age to view this content.";
    var textYes = scriptTag.getAttribute("data-yes-label") || "Verify with AgeWallet";
    var textNo = scriptTag.getAttribute("data-no-label") || "I Disagree";
    var textError = scriptTag.getAttribute("data-error-msg") || "Sorry, you do not meet the minimum requirements.";
    var expiryMinutes = parseInt(scriptTag.getAttribute("data-expiry") || "1440", 10);

    // --- 2. LOGIC ROUTER ---
    // Detect if we are running inside the Popup (Callback Mode) or the Parent (Gatekeeper Mode)
    var params = new URLSearchParams(window.location.search);
    if (params.has("code") && params.has("state")) {
        runCallbackMode(params);
    } else {
        runGatekeeperMode();
    }

    // =========================================================
    // MODE A: CALLBACK HANDLER (The Popup)
    // =========================================================
    function runCallbackMode(urlParams) {
        // 1. Hide everything immediately to prevent content flash
        document.documentElement.innerHTML = "<head><style>body{background:#000;color:#fff;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;}</style></head><body>Verifying...</body>";

        // 2. Extract Data
        var code = urlParams.get("code");
        var state = urlParams.get("state");

        // 3. Signal the Parent
        // We write to LocalStorage, which the Parent is watching.
        // We do NOT process the token here because the Popup doesn't have the PKCE verifier.
        try {
            var signalData = JSON.stringify({
                code: code,
                state: state,
                timestamp: new Date().getTime()
            });
            localStorage.setItem(STORAGE_KEY_SIGNAL, signalData);
            console.log("[AgeWallet Popup] Signal sent. Closing...");
        } catch (e) {
            console.error("[AgeWallet Popup] Storage Error:", e);
            document.body.innerText = "Error: Could not save verification signal.";
            return;
        }

        // 4. Close the Window
        setTimeout(function() {
            window.close();
            // Fallback if close is blocked
            document.body.innerText = "Verification Complete. You may close this window.";
        }, 300);
    }

    // =========================================================
    // MODE B: GATEKEEPER (The Parent Page)
    // =========================================================
    function runGatekeeperMode() {

        // --- 1. Persistence Check ---
        try {
            var session = JSON.parse(localStorage.getItem(STORAGE_KEY_SESSION));
            if (session && session.verified) {
                var now = new Date().getTime();
                if (now < session.expiry) {
                    return; // Valid session, allow load
                } else {
                    localStorage.removeItem(STORAGE_KEY_SESSION);
                }
            }
        } catch (e) {
            localStorage.removeItem(STORAGE_KEY_SESSION);
        }

        // --- 2. Inject Hider CSS ---
        var style = document.createElement('style');
        style.id = "aw-content-hider";
        style.innerHTML = "body > *:not(.aw-gate-overlay) { display: none !important; } body { overflow: hidden !important; background-color: #000 !important; }";
        document.head.appendChild(style);

        // --- 3. Inject Custom CSS ---
        if (customCss) {
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = customCss;
            document.head.appendChild(link);
        }

        // --- 4. Render UI ---
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", renderGate);
        } else {
            renderGate();
        }

        function renderGate() {
            console.log("[AgeWallet] Rendering Gate UI.");
            var gateStyle = document.createElement('style');
            gateStyle.innerHTML = `
                .aw-gate-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: #000; z-index: 2147483647; display: flex; justify-content: center; align-items: center; padding: 24px; box-sizing: border-box; }
                .aw-gate-card { background: #0d0d10; border: 1px solid #1e1e24; box-shadow: 0 10px 30px rgba(0,0,0,.45); color: #f5f7fb; border-radius: 16px; padding: 28px; max-width: 500px; width: 100%; text-align: center; font-family: -apple-system, system-ui, sans-serif; }
                .aw-gate-logo { max-width: 150px; height: auto; margin-bottom: 20px; }
                .aw-gate-title { margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #fff; }
                .aw-gate-desc { margin: 0 0 24px 0; color: #c8cbd4; line-height: 1.6; font-size: 16px; }
                .aw-gate-buttons { display: flex; justify-content: center; gap: 12px; margin-top: 16px; flex-wrap: wrap; }
                .aw-btn { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 10px 24px; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all .2s ease; border: 1px solid transparent; }
                .aw-btn-no { background: #2a2a32; color: #cdd0d7; }
                .aw-btn-no:hover { background: #3a3a44; }
                .aw-btn-yes { background: #6a1b9a; color: #fff; box-shadow: 0 6px 15px rgba(106, 27, 154, 0.25); }
                .aw-btn-yes:hover { background: #5a1784; transform: translateY(-1px); }
                .aw-error { margin-top: 16px; color: #ff4d4f; font-size: 14px; display: none; }
                .aw-disclaimer { margin-top: 20px; font-size: 12px; color: #666; }
                .aw-disclaimer a { color: #666; text-decoration: underline; }
            `;
            document.head.appendChild(gateStyle);

            var overlay = document.createElement('div');
            overlay.className = 'aw-gate-overlay';
            overlay.innerHTML = `
                <div class="aw-gate-card">
                    <img src="${logoUrl}" class="aw-gate-logo" alt="Logo">
                    <h1 class="aw-gate-title">${textTitle}</h1>
                    <div class="aw-gate-desc"><p>${textDesc}</p></div>
                    <div class="aw-gate-buttons">
                        <button class="aw-btn aw-btn-no" id="aw-deny">${textNo}</button>
                        <button class="aw-btn aw-btn-yes" id="aw-verify">${textYes}</button>
                    </div>
                    <div class="aw-error" id="aw-error-msg">${textError}</div>
                    <p class="aw-disclaimer">By proceeding you agree to allow <a href="https://agewallet.com" target="_blank">AgeWallet™</a> to verify your age.</p>
                </div>
            `;
            document.body.appendChild(overlay);

            // Handlers
            document.getElementById('aw-deny').onclick = function() {
                document.getElementById('aw-error-msg').style.display = 'block';
            };

            var verifyBtn = document.getElementById('aw-verify');
            verifyBtn.onclick = function() {
                startVerificationFlow(verifyBtn);
            };
        }

        // --- 5. Verification Logic ---
        async function startVerificationFlow(btnElement) {
            btnElement.innerText = "Verifying...";

            // A. Prepare Crypto
            var state = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
            var nonce = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
            var verifier = Array.from(crypto.getRandomValues(new Uint8Array(64)), b => b.toString(16).padStart(2, '0')).join('');

            var encoder = new TextEncoder();
            var data = encoder.encode(verifier);
            var hash = await crypto.subtle.digest('SHA-256', data);
            var challenge = btoa(String.fromCharCode(...new Uint8Array(hash)))
                .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

            // B. Persist Secrets (Parent Context Only)
            sessionStorage.setItem(STORAGE_KEY_OIDC, JSON.stringify({
                state: state,
                verifier: verifier,
                nonce: nonce
            }));

            // C. Build Dynamic Redirect URI
            // Force the callback to always be the Site Root (which matches your Dashboard)
            var currentUrl = window.location.origin;

            // D. Open Popup
            var authUrl = `https://app.agewallet.io/user/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(currentUrl)}&scope=openid&state=${state}&nonce=${nonce}&code_challenge=${challenge}&code_challenge_method=S256`;

            var popup = window.open(authUrl, "agewallet_verify", "width=1024,height=800");

            // E. Start Listening for "Signal" from Popup
            setupSignalListener(state, currentUrl, btnElement);
        }

        function setupSignalListener(expectedState, redirectUri, btnElement) {
            var checkInterval;

            // Handler: Processes the code when found
            async function processSignal(signalData) {
                if (signalData.state !== expectedState) {
                    console.warn("[AgeWallet] Signal state mismatch. Ignoring.");
                    return;
                }

                console.log("[AgeWallet] Signal received!", signalData);

                // Stop polling
                if (checkInterval) clearInterval(checkInterval);
                window.removeEventListener('storage', storageHandler);
                localStorage.removeItem(STORAGE_KEY_SIGNAL); // Clean up

                btnElement.innerText = "Finalizing...";

                // Exchange Token
                try {
                    var oidcData = JSON.parse(sessionStorage.getItem(STORAGE_KEY_OIDC));
                    if (!oidcData) throw new Error("Missing OIDC session data");

                    var tokenResp = await fetch("https://app.agewallet.io/embed/token", {
                        method: "POST",
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: new URLSearchParams({
                            client_id: clientId,
                            code: signalData.code,
                            code_verifier: oidcData.verifier,
                            redirect_uri: redirectUri
                        })
                    });

                    var tokenData = await tokenResp.json();
                    if (tokenData.error) throw new Error(tokenData.error_description || tokenData.error);

                    var userResp = await fetch("https://app.agewallet.io/user/userinfo", {
                        headers: { "Authorization": "Bearer " + tokenData.access_token }
                    });
                    var userData = await userResp.json();

                    if (userData.age_verified === true) {
                        unlockSite();
                    } else {
                        alert("Verification failed: Age requirement not met.");
                        btnElement.innerText = textYes;
                    }

                } catch (e) {
                    console.error("[AgeWallet] Exchange Error:", e);
                    alert("Verification error. Please try again.");
                    btnElement.innerText = textYes;
                }
            }

            // 1. Event Listener (Best for separate windows)
            function storageHandler(e) {
                if (e.key === STORAGE_KEY_SIGNAL && e.newValue) {
                    try { processSignal(JSON.parse(e.newValue)); } catch(err) {}
                }
            }
            window.addEventListener('storage', storageHandler);

            // 2. Polling Fallback (For same-tab or stubborn browsers)
            checkInterval = setInterval(function() {
                var raw = localStorage.getItem(STORAGE_KEY_SIGNAL);
                if (raw) {
                    try { processSignal(JSON.parse(raw)); } catch(err) {}
                }
            }, 1000);
        }

        function unlockSite() {
            var expiresAt = new Date().getTime() + (expiryMinutes * 60 * 1000);
            localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify({ verified: true, expiry: expiresAt }));

            // Cleanup UI
            var hider = document.getElementById("aw-content-hider");
            if (hider) hider.remove();

            var overlay = document.querySelector(".aw-gate-overlay");
            if (overlay) overlay.remove();

            document.body.style.overflow = '';
            document.body.style.backgroundColor = '';
        }
    }
})();


/*
====================================================================
   AGEWALLET LOADER - CONFIGURATION
====================================================================

   1. GETTING YOUR CREDENTIALS
      - Go to the AgeWallet Dashboard.
      - Create a new App.
      - In "Redirect URI", enter your website's ROOT URL exactly (e.g. https://mywinery.com).
      - IMPORTANT: Do not include a trailing slash (e.g., use https://site.com, NOT https://site.com/).
      - Copy your Client ID.

   2. BASIC USAGE
      - Uses default AgeWallet styling and English text.
      - Place this script before the closing </body> tag on every page you want to protect.
   -----------------------------------------------------------------
   <script
       src="https://cdn.jsdelivr.net/gh/agewallet-client/agewallet-simple-js@1/aw-loader.js"
       data-client-id="YOUR_CLIENT_ID">
   </script>


   3. ADVANCED USAGE (Fully Customized)
      - Overrides the logo, message, and button text.
      - Sets verification to expire after 60 minutes.
   -----------------------------------------------------------------
   <script
       src="https://cdn.jsdelivr.net/gh/agewallet-client/agewallet-simple-js@1/aw-loader.js"
       data-client-id="YOUR_CLIENT_ID"
       data-title="Age Verification Required"
       data-description="Please confirm you are over 18 to enter."
       data-logo="https://yoursite.com/assets/logo.png"
       data-yes-label="Verify Now"
       data-no-label="I am under 18"
       data-error-msg="Access denied."
       data-expiry="60">
   </script>

====================================================================
*/