'use strict';

describe('Controller: HostDeregisterController', function () {

  beforeEach(module('wx2AdminWebClientApp'));

  var vm, controller, cluster, orgName, MediaClusterService, XhrNotificationService, $q, $translate, modalInstanceMock, windowMock, log;

  beforeEach(inject(function ($controller, _XhrNotificationService_, _$q_, _$translate_, $log) {
    cluster = {
      id: 'a',
      name: 'b'
    };
    orgName = '123';

    MediaClusterService = {

      deleteCluster: sinon.stub()
    };
    XhrNotificationService = _XhrNotificationService_;
    $q = _$q_;
    $translate = _$translate_;

    modalInstanceMock = {
      close: sinon.stub()
    };
    windowMock = {
      open: sinon.stub()
    };
    log = $log;
    log.reset();

    controller = $controller('HostDeregisterController', {
      cluster: cluster,
      orgName: orgName,
      MediaClusterService: MediaClusterService,
      XhrNotificationService: XhrNotificationService,
      $q: $q,
      $translate: $translate,
      $modalInstance: modalInstanceMock,
      $window: windowMock,
      log: log
    });

  }));

  it('check if HostDeregisterController is Defined', function () {
    expect(controller).toBeDefined();
  });

  it('check if Deregister is called', function () {
    spyOn(MediaClusterService, 'deleteCluster').and.returnValue($q.when());
    controller.deregister();
    expect(MediaClusterService.deleteCluster).toHaveBeenCalled();
    expect(controller.saving).toBe(true);

  });

  it('check if Deregister is called with  clusterId', function () {

    spyOn(MediaClusterService, 'deleteCluster').and.returnValue($q.when());
    controller.deregister();
    expect(MediaClusterService.deleteCluster).toHaveBeenCalledWith(cluster.id);
  });

});