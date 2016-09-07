import digitalRiverModule from './index';

describe('Service: DigitalRiverService', () => {
  beforeEach(function () {
    this.initModules(digitalRiverModule);
    this.injectDependencies(
      '$httpBackend',
      'DigitalRiverService',
      'UrlConfig'
    );
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should get digital river order history url', function () {
    this.$httpBackend.expectGET(this.UrlConfig.getAdminServiceUrl() + 'commerce/online/users/authtoken').respond(200, 'abc+123');
    this.DigitalRiverService.getOrderHistoryUrl().then(response => {
      expect(response).toEqual('https://drhadmin-cte.digitalriver.com/store/ciscoctg/en_US/DisplayAccountOrderListPage?DRL=abc%2B123');
    });
    this.$httpBackend.flush();
  });

  it('should get digital river subscriptions url', function () {
    this.$httpBackend.expectGET(this.UrlConfig.getAdminServiceUrl() + 'commerce/online/users/authtoken').respond(200, 'abc+123');
    this.DigitalRiverService.getSubscriptionsUrl().then(response => {
      expect(response).toEqual('https://drhadmin-cte.digitalriver.com/store/ciscoctg/en_US/DisplaySelfServiceSubscriptionHistoryListPage?DRL=abc%2B123');
    });
    this.$httpBackend.flush();
  });

  it('should have a logout url', function () {
    expect(this.DigitalRiverService.getLogoutUrl()).toEqual('https://drhadmin-cte.digitalriver.com/store/ciscoctg/en_US/Logout');
  });
});
