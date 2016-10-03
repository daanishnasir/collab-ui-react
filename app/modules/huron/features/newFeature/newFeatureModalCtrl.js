(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('NewFeatureModalCtrl', NewFeatureModalCtrl);

  /* @ngInject */
  function NewFeatureModalCtrl($scope, $modalInstance, $state, $modal, FeatureToggleService) {
    var vm = $scope;

    vm.features = [{
      id: 'AA',
      code: 'autoAttendant.code',
      label: 'autoAttendant.title',
      description: 'autoAttendant.modalDescription',
      toggle: 'huronAutoAttendant'
    }, {
      id: 'HG',
      code: 'huronHuntGroup.code',
      label: 'huronHuntGroup.modalTitle',
      description: 'huronHuntGroup.modalDescription',
      toggle: 'huronHuntGroup'
    }];

    var callParkService = {
      id: 'CP',
      code: 'callPark.code',
      label: 'callPark.title',
      description: 'callPark.modalDescription',
      toggle: 'huronCallPark'
    };

    var pagingGroupService = {
      id: 'PG',
      code: 'pagingGroup.code',
      label: 'pagingGroup.title',
      description: 'pagingGroup.modalDescription',
      toggle: 'huronPagingGroup'
    };

    FeatureToggleService.supports(FeatureToggleService.features.callParkService).then(function (result) {
      if (result) {
        vm.features.push(callParkService);
      }
    });

    FeatureToggleService.supports(FeatureToggleService.features.huronPagingGroup).then(function (result) {
      if (result) {
        vm.features.push(pagingGroupService);
      }
      init();
    });

    vm.ok = ok;
    vm.cancel = cancel;
    vm.loading = true;

    function init() {
      vm.loading = false;
    }

    function ok(featureId) {
      if (featureId === 'HG') {
        $state.go('huronHuntGroup');
      } else if (featureId === 'CP') {
        $state.go('huronCallPark');
      } else if (featureId === 'AA') {
        $modal.open({
          templateUrl: 'modules/huron/features/newFeature/aatype-select-modal.html',
          controller: 'AATypeSelectCtrl',
          size: 'lg'
        });
      } else if (featureId === 'PG') {
        $state.go('huronPagingGroup');
      }
      $modalInstance.close(featureId);
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }
  }
})();
