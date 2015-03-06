'use strict';

/* global describe */
/* global it */
/* global browser */
/* global by */
/* global expect */
/* global element */
/* global protractor */

// Notes:
// - State is conserved between each describe and it blocks.
// - When a page is being loaded, use wait() to check if elements are there before asserting.

var getTestBody = function() {
  return {
    'email': utils.randomTestGmail(),
    'pushId': utils.randomId(),
    'deviceName': utils.randomId(),
    'deviceId': utils.randomId()
  }
};

function getToken(obj) {
  // console.log('getting token');
  var options = {
    method: 'post',
    url: config.oauth2Url + 'access_token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    auth: {
      'user': config.oauthClientRegistration.id,
      'pass': config.oauthClientRegistration.secret,
      'sendImmediately': true
    },
    body: 'grant_type=client_credentials&scope=' + config.oauthClientRegistration.scope
  };

  return utils.sendRequest(options).then(function(data) {
    var resp = JSON.parse(data);
    // console.log('access token', resp.access_token);
    obj.token = resp.access_token;
  });
}

function verifyEmail(obj) {
  var options = {
    method: 'post',
    url: config.adminServiceUrl.integration + 'users/email/verify',
    headers: {
      'User-Agent': obj.deviceUA,
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + obj.token
    },
    body: JSON.stringify(obj.body)
  };

  return utils.sendRequest(options).then(function(data) {
    var resp = JSON.parse(data);
    // console.log('encrypted param', resp.eqp);
    obj.encryptedQueryParam = resp.eqp;
  });
}

function setup(obj) {
  var flow = protractor.promise.controlFlow();
  flow.execute(getToken.bind(null, obj));
  flow.execute(verifyEmail.bind(null, obj));
}

describe('Self Registration Activation Page', function() {

  describe('iOS', function() {
    var obj = {
      body: getTestBody(),
      deviceUA: config.deviceUserAgent.iPhone
    };
    setup(obj);

    describe('Desktop activation for iOS device', function() {
      it('should display without admin controls on navigation bar', function() {
        expect(obj.encryptedQueryParam).not.toBe(null);
        browser.get('#/activate?eqp=' + encodeURIComponent(obj.encryptedQueryParam));
        navigation.expectAdminSettingsNotDisplayed();
      });

      it('should activate user and display success info', function() {
        utils.expectIsDisplayed(activate.provisionSuccess);
        utils.expectIsNotDisplayed(activate.codeExpired);
        utils.expectIsNotDisplayed(activate.resendSuccess);
      });

      it('should delete added user', function() {
        deleteUtils.deleteUser(obj.body.email);
      });
    });
  });

  describe('android', function() {
    var obj = {
      body: getTestBody(),
      deviceUA: config.deviceUserAgent.android
    };
    setup(obj);

    describe('Desktop activation for android device', function() {
      it('should display without admin controls on navigation bar', function() {
        browser.get('#/activate?eqp=' + encodeURIComponent(obj.encryptedQueryParam));
        navigation.expectAdminSettingsNotDisplayed();
      });

      it('should activate user and display success info', function() {
        utils.expectIsDisplayed(activate.provisionSuccess);
        utils.expectIsNotDisplayed(activate.codeExpired);
        utils.expectIsNotDisplayed(activate.resendSuccess);
      });
    });

    describe('Desktop activation after code is invalidated', function() {

      it('should display without admin controls on navigation bar', function() {
        browser.get('#/activate?eqp=' + encodeURIComponent(obj.encryptedQueryParam));
        navigation.expectAdminSettingsNotDisplayed();
      });

      it('should display code expired with user email', function() {
        utils.expectIsNotDisplayed(activate.provisionSuccess);
        utils.expectIsDisplayed(activate.codeExpired);
        utils.expectIsNotDisplayed(activate.resendSuccess);
        expect(activate.userEmail.getText()).toContain(obj.body.email);
      });

      it('should request new code when link is clicked', function() {
        utils.click(activate.sendCodeLink);
        utils.expectIsNotDisplayed(activate.provisionSuccess);
        utils.expectIsNotDisplayed(activate.codeExpired);
        utils.expectIsDisplayed(activate.resendSuccess);

        activate.testData.getAttribute('eqp').then(function(eqp) {
          expect(eqp).not.toBe(null);
        });
      });

      it('should delete added user', function() {
        deleteUtils.deleteUser(obj.body.email);
      });
    });
  });
});
