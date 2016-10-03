'use strict';

describe('Controller: customerSubscriptionsDetailCtrl', function () {
  beforeEach(angular.mock.module('Core'));
  var controller, $controller, $scope, $q;
  var customerResponseTest = getJSONFixture('core/json/customerSubscriptions/customerResponseTest.json');

  beforeEach(inject(function (_$controller_, $rootScope, _$q_, Auth) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    spyOn(Auth, 'getCustomerAccount').and.returnValue($q.when({ data: customerResponseTest }));
  }));
  function initController() {
    controller = $controller('CustomerSubscriptionsDetailCtrl', {
      $scope: $scope,
      $stateParams: {
        currentCustomer: {}
      }
    });
    $scope.$apply();
  }
  describe('getSubscriptions', function () {
    beforeEach(initController);
    it('must push customerSubscriptions into View-Model subscriptions array', function () {
      expect(controller).toBeDefined();
      expect(controller.getSubscriptions).toBeDefined();
      expect(controller.subscriptions).toBeDefined();
      expect(controller.subscriptions[0].siteUrl).toEqual('AtlasTestRitwchau05.webex.com');
      expect(controller.subscriptions[0].subscriptionId).toEqual('Test-Sub-08072016a');
    });
    it('must only put unique siteUrl/subscriptionID combinations array', function () {
      expect(controller.subscriptions.length).toEqual(2);
      expect(controller.subscriptions[1].subscriptionId).toEqual('Test-Sub-08072016b');
    });
  });
});
