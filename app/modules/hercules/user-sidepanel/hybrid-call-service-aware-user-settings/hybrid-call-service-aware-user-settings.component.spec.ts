import hybridCallServiceAwareUserSettingsModuleName from './index';

describe('hybridCallServiceAwareUserSettings', () => {

  let $componentController, $q, $scope, ctrl, DomainManagementService, HybridServiceUserSidepanelHelperService, ModalService, UCCService, UriVerificationService;

  beforeEach(function () {
    this.initModules(hybridCallServiceAwareUserSettingsModuleName);
  });

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies (_$componentController_, _$q_, $rootScope, _DomainManagementService_, _HybridServiceUserSidepanelHelperService_, _ModalService_, _UCCService_, _UriVerificationService_) {
    $componentController = _$componentController_;
    $q = _$q_;
    $scope = $rootScope;
    DomainManagementService = _DomainManagementService_;
    HybridServiceUserSidepanelHelperService = _HybridServiceUserSidepanelHelperService_;
    ModalService = _ModalService_;
    UCCService = _UCCService_;
    UriVerificationService = _UriVerificationService_;
  }

  function cleanup() {
    $componentController = ctrl = $scope = DomainManagementService = HybridServiceUserSidepanelHelperService = UCCService = UriVerificationService = undefined;
  }

  function initSpies() {
    spyOn(HybridServiceUserSidepanelHelperService, 'getDataFromUSS');
    spyOn(HybridServiceUserSidepanelHelperService, 'saveUserEntitlements').and.returnValue($q.resolve({}));
    spyOn(UCCService, 'getUserDiscovery');
    spyOn(DomainManagementService, 'getVerifiedDomains').and.returnValue($q.resolve({}));
    spyOn(UriVerificationService, 'isDomainVerified').and.returnValue(false);
    spyOn(ModalService, 'open').and.returnValue({
      result: $q.resolve(),
    });
  }

  function initController(callback: Function = _.noop, allUserEntitlements: string[] = ['squared-fusion-uc']) {
    ctrl = $componentController('hybridCallServiceAwareUserSettings', {}, {
      userId: '1234',
      userEmailAddress: 'test@example.org',
      entitlementUpdatedCallback: callback,
    });
    ctrl.$onInit();
    ctrl.$onChanges({
      allUserEntitlements: {
        currentValue: allUserEntitlements,
      },
    });
    $scope.$apply();
  }

  it('should read the Aware status and update internal entitlement data when user is *not* entitled', () => {
    HybridServiceUserSidepanelHelperService.getDataFromUSS.and.returnValue($q.resolve({}));
    initController(_.noop, ['']);

    expect(HybridServiceUserSidepanelHelperService.getDataFromUSS.calls.count()).toBe(1);
    expect(ctrl.userIsCurrentlyEntitled).toBe(false);
  });

  it('should read the Aware status and update internal entitlement data when user is entitled', () => {
    HybridServiceUserSidepanelHelperService.getDataFromUSS.and.returnValue($q.resolve([{}, {}]));
    UCCService.getUserDiscovery.and.returnValue($q.resolve({}));
    initController(_.noop, ['squared-fusion-uc']);
    ctrl.$onInit();
    $scope.$apply();
    expect(ctrl.userIsCurrentlyEntitled).toBe(true);
  });

  it('should get and store the directory URI from UCCService, and then do a check for verified domains', () => {
    const expectedDirectoryURI = 'manchester@example.org';
    const callServiceAwareExpectedStatus = {
      serviceId: 'squared-fusion-uc',
      entitled: true,
      lastStateChange: 1234,
      lastStateChangeText: 'something',
    };
    HybridServiceUserSidepanelHelperService.getDataFromUSS.and.returnValue($q.resolve([callServiceAwareExpectedStatus, {}]));
    UCCService.getUserDiscovery.and.returnValue($q.resolve({
      directoryURI: expectedDirectoryURI,
    }));
    initController();

    expect(UCCService.getUserDiscovery.calls.count()).toBe(1);
    expect(DomainManagementService.getVerifiedDomains.calls.count()).toBe(1);
    expect(UriVerificationService.isDomainVerified.calls.count()).toBe(1);

    expect(ctrl.directoryUri).toBe(expectedDirectoryURI);
    expect(ctrl.domainVerificationError).toBe(true);
  });

  it('should display a popup confirmation on save if Call Service Connect is enabled for the user, and you try to disable Aware', () => {

    HybridServiceUserSidepanelHelperService.getDataFromUSS.and.returnValue($q.resolve([{}, {}]));
    UCCService.getUserDiscovery.and.returnValue($q.resolve({}));

    initController(_.noop, ['squared-fusion-uc', 'squared-fusion-ec']);

    ctrl.entitledToggle = false;
    ctrl.save();
    expect(ModalService.open.calls.count()).toBe(1);
  });

  it('should automatically remove Connect as well when Aware is being removed, if Connect is enabled', () => {

    const expectedEntitlements = [{
      entitlementName: 'squaredFusionUC',
      entitlementState: 'INACTIVE',
    }, {
      entitlementName: 'squaredFusionEC',
      entitlementState: 'INACTIVE',
    }];
    HybridServiceUserSidepanelHelperService.getDataFromUSS.and.returnValue($q.resolve([{}, {}]));
    UCCService.getUserDiscovery.and.returnValue($q.resolve({}));

    initController(_.noop, ['squared-fusion-uc', 'squared-fusion-ec']);

    ctrl.newEntitlementValue = false;
    ctrl.saveData();

    expect(HybridServiceUserSidepanelHelperService.saveUserEntitlements).toHaveBeenCalledWith('1234', 'test@example.org', expectedEntitlements);
  });

  it('should not touch Connect when enabling Aware', () => {

    const expectedEntitlements = [{
      entitlementName: 'squaredFusionUC',
      entitlementState: 'ACTIVE',
    }];
    HybridServiceUserSidepanelHelperService.getDataFromUSS.and.returnValue($q.resolve([{}, {}]));
    UCCService.getUserDiscovery.and.returnValue($q.resolve({}));

    initController(_.noop, ['squared-fusion-uc', 'squared-fusion-ec']);

    ctrl.newEntitlementValue = true;
    ctrl.saveData();

    expect(HybridServiceUserSidepanelHelperService.saveUserEntitlements).toHaveBeenCalledWith('1234', 'test@example.org', expectedEntitlements);
  });

  it('should on save call the callback, after waiting a bit and probing USS for fresh data', () => {

    const callbackSpy = jasmine.createSpy('callback');
    HybridServiceUserSidepanelHelperService.getDataFromUSS.and.returnValue($q.resolve([{}, {}]));
    UCCService.getUserDiscovery.and.returnValue($q.resolve({}));

    initController(callbackSpy, ['squared-fusion-uc']);

    ctrl.newEntitlementValue = true;
    ctrl.saveData();
    $scope.$apply();

    expect(HybridServiceUserSidepanelHelperService.getDataFromUSS.calls.count()).toBe(2);
    expect(callbackSpy.calls.count()).toBe(1);
    expect(callbackSpy).toHaveBeenCalledWith({
      options: {
        entitledToAware: true,
      },
    });

  });

});
