# Minerva Schools at KGI Screen Sharing

Enables screen sharing on the Minerva Schools at KGI admissions platform.

This works by modifying the following two `about:config` preferences on behalf of the user:

* `media.getusermedia.screensharing.enabled` - boolean; whether screensharing is enabled.
* `media.getusermedia.screensharing.allowed_domains` - string; comma-separated whitelist of domains.

Heavily derivative of https://github.com/muaz-khan/Firefox-Extensions

We distribute our own addon to avoid the other addon's
`https://www.webrtc-experiment.com`-specific language and the additional JavaScript
`confirm` UI it uses to add our own domains.

## Example usage

An example usage that checks to see if the extension is installed:

```javascript

var extensionIsInstalled = false;
window.addEventListener("message", function(event) {
  if (event && event.data && event.data.isMinervaScreenCapturingEnabled === true) {
    extensionIsInstalled = true;
  }
}, false);

// Ask if screensharing is enabled.  This will only call back if the extension is installed.
window.postMessage({ checkIfMinervaScreenCapturingEnabled: true }, "*");

// Wait for a few seconds to see if the extension calls us back so we know it's installed.
var intervalMsec = 250,
    timeoutMsec = 2000,
    elapsedMsec = 0;

var interval = setInterval(function() {
  elapsedMsec += intervalMsec;

  if (elapsedMsec > timeoutMsec) {
    // Timed out waiting for the extension.
    clearInterval(interval);

    // Navigate to signed XPI to prompt installation:
    window.location.href = "https://location/addon.xpi";
  }

  if (extensionIsInstalled) {
    clearInterval(interval);
    // Success!
  }

}, intervalMsec);
```


## Distribution (listed vs unlisted)

The Firefox addon system allows us to distribute via addons.mozilla.org (AMO)
as a "listed" addon (which is thereby subject to review) or as an "unlisted"
addon distributed over HTTP(S) download from our own domains.  Both
distribution methods require cryptographically signing the addon using a
key/secret that is tied to our mozilla developer account (see LastPass for
credentials at addons.mozilla.org).

Unlisted distribution is recommended because it allows us to release and distribute
without waiting for AMO review which can take days.

The addon manifest in `package.json` is intended for unlisted distribution.

If, for some reason, we want to use listed distribution, use `package.json.listed`
instead.  See following sections for more detail.


## Build unlisted addon

This is the recommended method.

```bash
npm install -g jpm
jpm sign --api-key user:12373270:553 --api-secret <secret>
```

This will produce a file like `minerva_schools_at_kgi_screen_sharing-0.0.5-fx.xpi`
that can be installed into Firefox as an addon.  You can self-host this file
and point clients to it.


## Build listed

This is currently **not** the recommended distribution method.

Build an unsigned version of the XPI:

```bash
npm install -g jpm
mv package.json.listed package.json # note that the 'name' key differs
jpm xpi
```

Get addons.mozilla.org (AMO) credentials from LastPass.
Visit the AMO site for the listed addon and submit a new version:
https://addons.mozilla.org/en-US/developers/addon/minerva-schools-screen-sharing/edit

After some time, Mozilla should approve the addon.  After that you can
point clients to the AMO site to prompt them to install.
