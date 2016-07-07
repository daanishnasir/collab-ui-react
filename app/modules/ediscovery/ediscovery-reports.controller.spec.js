'use strict';
describe('Controller: EdiscoveryReportsController', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var Authinfo, controller, $state, ReportUtilService, EdiscoveryService, $q, $controller, httpBackend, $translate, $scope;

  beforeEach(inject(function (_Authinfo_, _ReportUtilService_, _$state_, _$translate_, _EdiscoveryService_, _$q_, _$rootScope_, $httpBackend, _$controller_) {
    ReportUtilService = _ReportUtilService_;
    $state = _$state_;
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    httpBackend = $httpBackend;
    EdiscoveryService = _EdiscoveryService_;
    $translate = _$translate_;
    $q = _$q_;
    Authinfo = _Authinfo_;

    httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});

    sinon.stub(Authinfo, 'getOrgId');
    Authinfo.getOrgId.returns("ce8d17f8-1734-4a54-8510-fae65acc505e");

    sinon.stub(EdiscoveryService, 'getReports');
    var promise = $q.resolve({
      reports: {
        "displayName": "test",
        "url": "whatever",
        "id": "12345678"
      },
      paging: {
        count: 20,
        limit: 10,
        next: "n.a",
        offset: 0
      }
    });
    EdiscoveryService.getReports.withArgs(sinon.match.any, sinon.match.any).returns(promise);

    controller = $controller('EdiscoveryReportsController', {
      $translate: $translate,
      $scope: $scope,
      EdiscoveryService: EdiscoveryService
    });

  }));

  describe('Initially', function () {

    it('gets reports', function () {
      expect(controller.readingReports).toBeTruthy();
      httpBackend.flush();
      expect(EdiscoveryService.getReports.callCount).toBe(1);
      expect(controller.readingReports).toBeFalsy();
    });

  });

});