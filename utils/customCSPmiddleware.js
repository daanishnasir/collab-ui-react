'use strict';

var csp = require('helmet-csp');

// During development we only have 2 inline scripts: the one preloading the background image
// and the one injected by Browser Sync. We could whitelist the SHA1 of those 2 scripts
// but the one for Browser Sync changes too often (it contains the version number).
// We use 'unsafe-inline' instead, but it should never make it to production! Production should only
// use 'sha256-x+aZvuBn2wT79r4ro+BTMYyQJwOC/JIXRDq4dE+tp9k=', the SHA1 for the image preload script
var inlineScriptOnlyForDev = '\'unsafe-inline\'';
// Localytics will load a pixel image using http when developing locally
var localyticsOnlyForDev = 'http://*.localytics.com';
module.exports = csp({
  reportOnly: false,
  browserSniff: false,
  directives: {
    defaultSrc: [
      '\'self\'',
      'https://*.localytics.com',
      'https://*.statuspage.io',
      'https://*.wbx2.com',
      'https://*.webex.com',
      'https://*.webexconnect.com',
      'https://wbxdmz.admin.ciscospark.com',
      'https://wbxbts.admin.ciscospark.com',
      'blob:',
    ],
    frameSrc: [
      'https://buy.ciscospark.com', // Digital River
      'https://ds2-qlikdemo.cisco.com',
      'https://10.140.50.27',
      'http://127.0.0.1:8000',
      'https://ds2-qlikdemo',
      'https://ds2-win2012-01',
      'https://qlik-loader',
      'https://10.29.42.18:4244',
      'https://10.29.42.18',
      'https://qlik-engine2',
      'https://10.29.42.19:4244',
      'https://10.29.42.19',
      'https://*.webex.com', //Qlik sense sites used for Spark/WebEx Metrics
      'https://*.webex.com:4244',
      'https://*.webex.com:4248',
      'https://*.cisco.com:4244',
      'https://*.cisco.com',
      'https://*.cisco.com:4248',
    ],
    objectSrc: [
      'http://www.cisco.com', // Terms of Service
    ],
    connectSrc: [
      '\'self\'',
      'wss://mercury-connection-a.wbx2.com',
      'https://*.cisco.com',
      'https://*.ciscoccservice.com',
      'https://*.ciscospark.com',
      'https://*.huron-dev.com',
      'https://*.huron-int.com',
      'https://*.sparkc-eu.com',
      'https://*.huron.uno',
      'https://*.statuspage.io',
      'https://*.wbx2.com',
      'https://*.webex.com',
      'https://*.webexconnect.com',
      'http://api.mixpanel.com',
      'https://api.mixpanel.com',
      'https://cdn.mxpnl.com',
      'http://54.183.25.170:8001',
      'https://clio-manager-a.wbx2.com',
      'https://clio-manager-intb.ciscospark.com',
      // manual DNS entry for local dev:
      'http://dev-admin.ciscospark.com:8000',
      'ws://dev-admin.ciscospark.com:8000',
      // Browser Sync:
      'ws://127.0.0.1:8000',
      'ws://localhost:8000',
      'ws://127.0.0.1:8443',
      'ws://localhost:8443',
      // Local Atlas Backend:
      'http://127.0.0.1:8080',
      'http://localhost:8080',
      'http://dev-admin.ciscospark.com:8080',
      'http://dpm.demdex.net', // Adobe DTM Omniture
      'http://ciscowebex.d1.sc.omtrdc.net', // Adobe DTM Omniture
      'https://*.clouddrive.com', // CSV download
      'https://*.amazonaws.com', // MOH Media
      'https://bam.nr-data.net', // New Relic Browser
      'https://10.224.166.46:8443',
      'http://rpbtqlkhsn002.webex.com:8080',
      'https://rpbtqlkhsn006.webex.com',
    ],
    fontSrc: [
      '\'self\'',
      'http://dev-admin.ciscospark.com:8000', // manual DNS entry for local dev
    ],
    imgSrc: [
      '\'self\'',
      'data:',
      localyticsOnlyForDev,
      'https://*.clouddrive.com',
      'https://*.localytics.com',
      'https://*.rackcdn.com',
      'http://webexglobal.112.2o7.net', // Adobe DTM Omniture
      'http://*.d1.sc.omtrdc.net', // Adobe DTM Omniture
      'http://dev-admin.ciscospark.com:8000', // manual DNS entry for local dev
      'https://bam.nr-data.net', // New Relic Browser
      // Webpack Dev
      'blob:',
    ],
    scriptSrc: [
      '\'self\'',
      inlineScriptOnlyForDev,
      '\'unsafe-eval\'',
      'https://*.localytics.com',
      'https://*.webex.com',
      'https://api.mixpanel.com', // Mixpanel
      'https://cdn.mxpnl.com', // Mixpanel
      'http://assets.adobedtm.com', // Adobe DTM Omniture
      'http://dpm.demdex.net', // Adobe DTM Omniture
      'http://ciscowebex.d1.sc.omtrdc.net', // Adobe DTM Omniture
      'https://buy.ciscospark.com', // Digital River
      'http://dev-admin.ciscospark.com:8000', // manual DNS entry for local dev
      '127.0.0.1',
      'https://js-agent.newrelic.com', // New Relic Browser
      'https://bam.nr-data.net', // New Relic Browser
    ],
    styleSrc: [
      '\'self\'',
      '\'unsafe-inline\'',
      'http://dev-admin.ciscospark.com:8000', // manual DNS entry for local dev
      // Webpack Dev
      'blob:',
    ],
  },
});
