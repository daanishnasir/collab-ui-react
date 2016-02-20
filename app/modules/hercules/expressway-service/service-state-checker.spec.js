'use strict';

describe('ServiceStateChecker', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var ClusterService, NotificationService, ServiceStateChecker, AuthInfo, USSService2;

  var notConfiguredClusterMockData = {
    id: 0,
    connectors: [{
      connectorType: 'c_mgmt',
      runningState: 'not_configured'
    }, {
      connectorType: 'c_cal',
      runningState: 'not_configured'
    }, {
      connectorType: 'c_cal',
      runningState: 'not_configured'
    }]
  };

  var okClusterMockData = {
    id: 0,
    connectors: [{
      connectorType: 'c_mgmt',
      runningState: 'running'
    }, {
      connectorType: 'c_cal',
      runningState: 'running'
    }, {
      connectorType: 'c_cal',
      runningState: 'running'
    }]
  };

  beforeEach(module(function ($provide) {
    ClusterService = {
      getClustersByConnectorType: sinon.stub()
    };
    AuthInfo = {
      getOrgId: sinon.stub()
    };
    USSService2 = {
      getStatusesSummary: sinon.stub(),
      getOrg: sinon.stub()
    };
    AuthInfo.getOrgId.returns('orgId');
    $provide.value('ClusterService', ClusterService);
    $provide.value('Authinfo', AuthInfo);
    $provide.value('USSService2', USSService2);
  }));

  beforeEach(inject(function ($injector, _ServiceStateChecker_, _NotificationService_) {
    ServiceStateChecker = _ServiceStateChecker_;
    NotificationService = _NotificationService_;
  }));

  it('should raise the "fuseNotPerformed" message if there are no connectors', function () {
    ClusterService.getClustersByConnectorType.returns([]);
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('fuseNotPerformed');
  });

  it('should raise the "fuseNotPerformed" message if all connectors are not configured ', function () {
    ClusterService.getClustersByConnectorType.returns([notConfiguredClusterMockData]);
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('configureConnectors');
  });

  it('should clear the "fuseNotPerformed" message when fusing a cluster ', function () {
    ClusterService.getClustersByConnectorType.returns([]);
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('fuseNotPerformed');
    ClusterService.getClustersByConnectorType.returns([notConfiguredClusterMockData]);
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('configureConnectors');
  });

  it('should raise the "noUsersActivated" message and clear appropriately when there are no users activated ', function () {
    USSService2.getStatusesSummary.returns([{
      serviceId: 'squared-fusion-cal',
      activated: 0,
      error: 0,
      notActivated: 0
    }]);
    ClusterService.getClustersByConnectorType.returns([okClusterMockData]);
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('squared-fusion-cal:noUsersActivated');
    USSService2.getStatusesSummary.returns([{
      serviceId: 'squared-fusion-cal',
      activated: 1
    }]);
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    expect(NotificationService.getNotificationLength()).toEqual(0);
  });

  it('should raise the "userErrors" message and clear appropriately when there are users with errors ', function () {
    USSService2.getStatusesSummary.returns([{
      serviceId: 'squared-fusion-cal',
      activated: 0,
      error: 5,
      notActivated: 0
    }]);
    ClusterService.getClustersByConnectorType.returns([okClusterMockData]);
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('squared-fusion-cal:userErrors');
    USSService2.getStatusesSummary.returns([{
      serviceId: 'squared-fusion-cal',
      activated: 1
    }]);
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    expect(NotificationService.getNotificationLength()).toEqual(0);
  });
});
