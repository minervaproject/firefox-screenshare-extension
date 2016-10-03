// Jason Morrison for Minerva Project
// Derived from https://github.com/muaz-khan/Firefox-Extensions
// MIT License

var self = require("sdk/self");
var prefService = require('sdk/preferences/service');

var configToReferListOfAllowedDomains = 'media.getusermedia.screensharing.allowed_domains';
var configToEnableScreenCapturing = 'media.getusermedia.screensharing.enabled';

// replace your own domains with below array
var arrayOfMyOwnDomains = [
  'local.av.minervaproject.com',
  'development.av.minervaproject.com',
  'staging.av.minervaproject.com',
  'proctor.av.minervaproject.com',
  'schools-local.minerva.kgi.edu',
  'schools-local.minervaproject.com',
  'schools-development.minervaproject.com',
  'schools-staging.minervaproject.com',
  'www.minerva.kgi.edu',
  'localhost',
  '127.0.0.1'
];

// e.g. if 127.0.0.1 or localhost is already allowed by anyone else
var listOfSimilarAlreadyAllowedDomains = [];

// this flag is enabled by default since Firefox version 37 or 38.
// it maybe get removed in version 47-48. (As far as I can assume)
// i.e. screen capturing will always be allowed to list of allowed_domains.
if(prefService.has(configToEnableScreenCapturing)) {
  prefService.set(configToEnableScreenCapturing, true);
}

function addMyOwnDomains() {
    var existingDomains = prefService.get(configToReferListOfAllowedDomains).split(',');
    arrayOfMyOwnDomains.forEach(function(domain) {
        if (existingDomains.indexOf(domain) === -1) {
            existingDomains.push(domain);
        }

        else if (existingDomains.indexOf(domain) !== -1) {
            // Seems domain is already in the list.
            // Keep it when this addon is uninstalled.
            listOfSimilarAlreadyAllowedDomains.push(domain);
        }
    });
    prefService.set(configToReferListOfAllowedDomains, existingDomains.join(','));
}
addMyOwnDomains();

// below code handles addon-uninstall
function removeMyDomainOnUnInstall() {
    var externalDomains = [];

    prefService.get(configToReferListOfAllowedDomains).split(',').forEach(function(domain) {
        // Skip Others Domains
        if (arrayOfMyOwnDomains.indexOf(domain) === -1) {
            // if its NOT mine, keep it.
            externalDomains.push(domain);
        } else if (listOfSimilarAlreadyAllowedDomains.indexOf(domain) !== -1) {
            // seems that localhost/127.0.0.1 are already added by external users
            externalDomains.push(domain);
        }
    });

    prefService.set(configToReferListOfAllowedDomains, externalDomains.join(','));
}

var {
    when: unload
} = require("sdk/system/unload");

// By AMO policy global preferences must be changed back to their original value
unload(function() {
    // remove only my own domains
    removeMyDomainOnUnInstall();
});

/*
 * Run content-script.js on pages so they can ask if the extension is installed.
 */
var mod = require("sdk/page-mod");

var pageMod = mod.PageMod({
    include: ["*"],
    contentScriptFile: "./../content-script.js",
    contentScriptWhen: "ready"
});

// Upon installation, notify existing tabs of installation
exports.main = function (options, callbacks) {
    var tabs = require('sdk/tabs');
    for (let tab of tabs) {
        tab.attach({
            contentScript: 'window.postMessage({isMinervaScreenCapturingEnabled: true }, "*");'
        });
    };
};
