(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .controller('RedirectAddResourceControllerV2', RedirectAddResourceControllerV2);

  /* @ngInject */
  function RedirectAddResourceControllerV2(XhrNotificationService, $modalInstance, $translate, firstTimeSetup, yesProceed, $modal, $state, AddResourceCommonServiceV2, $window) {
    var vm = this;
    vm.clusterList = [];
    vm.selectPlaceholder = $translate.instant('mediaFusion.add-resource-dialog.cluster-placeholder');
    vm.addRedirectTargetClicked = addRedirectTargetClicked;
    vm.redirectToTargetAndCloseWindowClicked = redirectToTargetAndCloseWindowClicked;
    vm.back = back;
    vm.next = next;
    vm.enableRedirectToTarget = false;
    vm.selectedCluster = '';
    vm.selectedClusterId = '';
    vm.firstTimeSetup = firstTimeSetup;
    vm.closeSetupModal = closeSetupModal;
    vm.radio = 1;
    vm.noProceed = false;
    vm.yesProceed = yesProceed;
    vm.canGoNext = canGoNext;

    AddResourceCommonServiceV2.updateClusterLists().then(function (clusterList) {
      vm.clusterList = clusterList;
    });

    function addRedirectTargetClicked(hostName, enteredCluster) {
      AddResourceCommonServiceV2.addRedirectTargetClicked(hostName, enteredCluster).then(function () {
        vm.enableRedirectToTarget = true;
      }, XhrNotificationService.notify);
    }

    function redirectToTargetAndCloseWindowClicked(hostName, enteredCluster) {
      $modalInstance.close();
      AddResourceCommonServiceV2.redirectPopUpAndClose(hostName, enteredCluster, vm.selectedClusterId, vm.firstTimeSetup);
    }

    function closeSetupModal(isCloseOk) {
      if (!firstTimeSetup) {
        $modalInstance.close();
        return;
      }
      if (isCloseOk) {
        $modalInstance.close();
        $state.go('services-overview');
        return;
      }
      $modal.open({
        templateUrl: 'modules/hercules/add-resource/confirm-setup-cancel-dialog.html',
        type: 'dialog'
      })
        .result.then(function (isAborting) {
          if (isAborting) {
            $modalInstance.close();
            $state.go('services-overview');
          }
        });
    }

    function back() {
      vm.enableRedirectToTarget = false;
    }

    function next() {
      if (vm.radio == 0) {
        vm.noProceed = true;
        $window.open('https://7f3b835a2983943a12b7-f3ec652549fc8fa11516a139bfb29b79.ssl.cf5.rackcdn.com/Media-Fusion-Management-Connector/mfusion.ova');
      } else if (vm.yesProceed) {
        if (angular.isDefined(vm.selectedCluster) && vm.selectedCluster != '' && angular.isDefined(vm.hostName)) {
          vm.addRedirectTargetClicked(vm.hostName, vm.selectedCluster);
        }
      } else {
        vm.yesProceed = true;
      }
    }

    function canGoNext() {
      if (vm.firstTimeSetup && !vm.yesProceed) {
        return true;
      } else if (vm.yesProceed && angular.isDefined(vm.hostName) && vm.hostName != '' && angular.isDefined(vm.selectedCluster) && vm.selectedCluster != '') {
        return true;
      } else {
        return false;
      }
    }
  }
}());
