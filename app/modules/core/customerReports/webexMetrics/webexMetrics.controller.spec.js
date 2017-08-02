'use strict';

describe('Controller: WebEx Metrics Ctrl', function () {
  beforeEach(function () {
    this.initModules('Core', 'core.customer-reports'); // 'Core' included for Userservice
    this.injectDependencies(
      '$controller',
      '$q',
      '$sce',
      '$scope',
      '$stateParams',
      '$timeout',
      '$window',
      'Authinfo',
      'LocalStorage',
      'Notification',
      'ProPackService',
      'QlikService',
      'Userservice'
    );

    spyOn(this.Authinfo, 'setEmails');
    spyOn(this.Authinfo, 'getConferenceServicesWithoutSiteUrl').and.returnValue([]);
    spyOn(this.Authinfo, 'getConferenceServicesWithLinkedSiteUrl').and.returnValue([]);
    spyOn(this.ProPackService, 'hasProPackPurchased').and.returnValue(this.$q.resolve(false));
    spyOn(this.Userservice, 'getUser').and.callFake(function (user, callback) {
      expect(user).toBe('me');
      callback({
        success: true,
        emails: 'fakeUser@fakeEmail.com',
        siteUrl: 'siteUrl',
      });
    });

    this.initController = function () {
      this.controller = this.$controller('WebExMetricsCtrl', {
        $sce: this.$sce,
        $scope: this.$scope,
        $stateParams: this.$stateParams,
        $timeout: this.$timeout,
        $window: this.$window,
        Authinfo: this.Authinfo,
        LocalStorage: this.LocalStorage,
        Notification: this.Notification,
        ProPackService: this.ProPackService,
        QlikService: this.QlikService,
        Userservice: this.Userservice,
      });
      this.$scope.$apply();
    };
    this.initController();
  });

  it('premium settings should be controlled by ProPackService or Authinfo.isPremium', function () {
    expect(this.controller.reportView).toEqual(this.controller.webexMetrics.views[0]);

    this.ProPackService.hasProPackPurchased.and.returnValue(this.$q.resolve(true));
    this.initController();
    expect(this.controller.reportView).toEqual(this.controller.webexMetrics.views[1]);
  });

  it('should not have anything in the dropdown for webex metrics', function () {
    expect(this.controller.webexOptions.length).toBe(0);
  });

  it('initial state, isIframeLoaded should be false, currentFilter should be metrics', function () {
    expect(this.controller.isIframeLoaded).toBeFalsy();
    expect(this.controller.currentFilter.filterType).toBe('metrics');
  });
});

