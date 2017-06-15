(function () {
  'use strict';

  angular
    .module('Sunlight')
    .controller('CareLocalSettingsCtrl', CareLocalSettingsCtrl);

  /* @ngInject */
  function CareLocalSettingsCtrl($location, $interval, $q, $scope, $translate, Authinfo, Log, Notification, SunlightConfigService, ModalService, FeatureToggleService, UrlConfig) {
    var vm = this;

    vm.ONBOARDED = 'onboarded';
    vm.NOT_ONBOARDED = 'notOnboarded';
    vm.IN_PROGRESS = 'inProgress';

    vm.status = {
      UNKNOWN: 'Unknown',
      PENDING: 'Pending',
      SUCCESS: 'Success',
      FAILURE: 'Failure',
    };

    vm.csOnboardingStatus = vm.status.UNKNOWN;
    vm.aaOnboardingStatus = vm.status.UNKNOWN;
    vm.appOnboardingStatus = vm.status.UNKNOWN;

    vm.state = vm.ONBOARDED;
    vm.errorCount = 0;

    vm.RoutingType = {
      PICK: "pick",
      PUSH: "push",
    };

    vm.routingTypes = [
      {
        Header: $translate.instant('sunlightDetails.settings.routing.pick.Header'),
        Label: $translate.instant('sunlightDetails.settings.routing.pick.Label'),
        Value: vm.RoutingType.PICK,
      },
      {
        Header: $translate.instant('sunlightDetails.settings.routing.automated.Header'),
        Label: $translate.instant('sunlightDetails.settings.routing.automated.Label'),
        Value: vm.RoutingType.PUSH,
      },
    ];

    vm.showRouterToggle = false;
    vm.savedRoutingType = vm.RoutingType.PICK;

    vm.enableRoutingMechanism = function () {
      return !vm.selectedRouting;
    };

    $scope.$on('$locationChangeStart', function (event, next) {
      if ($scope.routingSelector.$dirty) {
        event.preventDefault();
        var message = "sunlightDetails.settings.saveModal.BodyMsg2";
        vm.openSaveModal(message).result.then(function () {
          vm.updateRoutingType();
          gotoSelectedPage(next);
        }, function () {
          gotoSelectedPage(next);
        });
      }
    });

    function gotoSelectedPage(next) {
      $scope.$$listeners.$locationChangeStart = [];
      var destination = next.substr(next.indexOf('#') + 1, next.length).trim();
      $location.path(destination);
    }

    vm.openModal = function () {
      var message = "sunlightDetails.settings.saveModal.BodyMsg1";
      vm.openSaveModal(message).result.then(vm.updateRoutingType);
    };

    vm.openSaveModal = function (message) {
      return ModalService.open({
        title: $translate.instant('sunlightDetails.settings.saveModal.Header'),
        message: $translate.instant(message),
        close: $translate.instant('common.yes'),
        dismiss: $translate.instant('common.no'),
      });
    };
    vm.updateRoutingType = function () {
      vm.isProcessing = true;
      SunlightConfigService.updateChatConfig(getSelectedRoutingToUpdate()).then(function (results) {
        Log.debug('Care setting: Routing mechanism update is success', results);
        Notification.success($translate.instant('sunlightDetails.settings.setUpCareSuccess'));
        vm.isProcessing = false;
        vm.savedRoutingType = vm.selectedRouting;
        resetFrom();
      }, function (error) {
        vm.cancelEdit();
        Log.error('Care setting: Routing mechanism update is failure', error);
        Notification.errorWithTrackingId(error, $translate.instant('firstTimeWizard.careSettingsUpdateFailed'));
      });
    };

    vm.cancelEdit = function () {
      vm.selectedRouting = vm.savedRoutingType;
      resetFrom();
    };

    function resetFrom() {
      if ($scope.routingSelector) {
        $scope.routingSelector.$setPristine();
        $scope.routingSelector.$setUntouched();
      }
    }

    function getSelectedRoutingToUpdate() {
      var routingData = {};
      routingData.routingType = vm.selectedRouting;
      if (vm.selectedRouting === vm.RoutingType.PUSH) {
        routingData.notificationUrls = [UrlConfig.getSunlightPushNotificationUrl()];
      } else {
        routingData.notificationUrls = [UrlConfig.getSunlightPickNotificationUrl()];
      }
      return routingData;
    }

    vm.onboardToCare = function () {
      vm.state = vm.IN_PROGRESS;

      var promises = {};
      if (vm.csOnboardingStatus !== vm.status.SUCCESS) {
        promises.onBoardCS = SunlightConfigService.onBoardCare();
      }
      if (Authinfo.isCareVoice() && vm.aaOnboardingStatus !== vm.status.SUCCESS) {
        promises.onBoardAA = SunlightConfigService.aaOnboard();
      }
      if (vm.appOnboardingStatus !== vm.status.SUCCESS) {
        promises.onBoardBotApp = SunlightConfigService.onboardCareBot();
      }

      $q.all(promises).then(function (results) {
        Log.debug('Care onboarding is success', results);
        startPolling();
      }, function (error) {
        vm.state = vm.NOT_ONBOARDED;
        Log.error('Care onboarding failed with error', error);
        Notification.errorWithTrackingId(error, $translate.instant('firstTimeWizard.setUpCareFailure'));
      });
    };

    var poller;
    var pollInterval = 10000;
    var pollRetryCount = 30;
    var pollErrorCount = 3;
    $scope.$on('$destroy', function () {
      $interval.cancel(poller);
      poller = undefined;
    });

    function startPolling() {
      if (!_.isUndefined(poller)) return;

      vm.errorCount = 0;
      poller = $interval(processOnboardStatus, pollInterval, pollRetryCount);
      poller.then(processTimeout);
    }

    function stopPolling() {
      if (!_.isUndefined(poller)) {
        $interval.cancel(poller);
        poller = undefined;
      }
    }

    function processOnboardStatus() {
      SunlightConfigService.getChatConfig().then(function (result) {
        var onboardingStatus = getOnboardingStatus(result);
        switch (onboardingStatus) {
          case vm.status.SUCCESS:
            Notification.success($translate.instant('sunlightDetails.settings.setUpCareSuccess'));
            vm.state = vm.ONBOARDED;
            stopPolling();
            break;
          case vm.status.FAILURE:
            Notification.errorWithTrackingId(result, $translate.instant('sunlightDetails.settings.setUpCareFailure'));
            vm.state = vm.NOT_ONBOARDED;
            stopPolling();
            break;
          default:
            Log.debug('Care setup status is not Success: ', result);
        }
      })
        .catch(function (result) {
          if (result.status !== 404) {
            Log.debug('Fetching Care setup status failed: ', result);
            if (vm.errorCount++ >= pollErrorCount) {
              vm.state = vm.NOT_ONBOARDED;
              Notification.errorWithTrackingId(result, $translate.instant('sunlightDetails.settings.setUpCareFailure'));
              stopPolling();
            }
          }
        });
    }

    function processTimeout(pollerResult) {
      Log.debug('Poll timed out after ' + pollerResult + ' attempts.');
      vm.state = vm.NOT_ONBOARDED;
      Notification.error($translate.instant('sunlightDetails.settings.setUpCareFailure'));
    }

    function getOnboardingStatus(result) {
      vm.csOnboardingStatus = _.get(result, 'data.csOnboardingStatus');
      vm.aaOnboardingStatus = _.get(result, 'data.aaOnboardingStatus');
      vm.appOnboardingStatus = _.get(result, 'data.appOnboardStatus');
      vm.selectedRouting = _.get(result, 'data.routingType', vm.RoutingType.PICK);
      vm.savedRoutingType = vm.selectedRouting;

      var onboardingStatus = vm.status.UNKNOWN;
      if (vm.csOnboardingStatus === vm.status.SUCCESS && vm.appOnboardingStatus === vm.status.SUCCESS) {
        if (Authinfo.isCareVoice()) {
          onboardingStatus = vm.aaOnboardingStatus;
        } else {
          onboardingStatus = vm.status.SUCCESS;
        }
      } else if (vm.csOnboardingStatus !== vm.status.SUCCESS) {
        onboardingStatus = vm.csOnboardingStatus;
      } else if (vm.appOnboardingStatus !== vm.status.SUCCESS) {
        onboardingStatus = vm.appOnboardingStatus;
      } else {
        onboardingStatus = vm.status.UNKNOWN;
      }
      return onboardingStatus;
    }

    function init() {
      FeatureToggleService.atlasCareAutomatedRouteTrialsGetStatus().then(function (result) {
        vm.showRouterToggle = result;
      });
      SunlightConfigService.getChatConfig().then(function (result) {
        var onboardingStatus = getOnboardingStatus(result);
        switch (onboardingStatus) {
          case vm.status.PENDING:
            vm.state = vm.IN_PROGRESS;
            startPolling();
            break;
          case vm.status.SUCCESS:
            vm.state = vm.ONBOARDED;
            break;
          default:
            vm.state = vm.NOT_ONBOARDED;
        }
        if (result.data.orgName === "" || !(_.get(result, 'data.orgName'))) {
          result.data.orgName = Authinfo.getOrgName();
          SunlightConfigService.updateChatConfig(result.data).then(function (result) {
            Log.debug('Successfully updated org config with org name', result);
          });
        }
      })
        .catch(function (result) {
          if (result.status === 404) {
            vm.state = vm.NOT_ONBOARDED;
          } else {
            Log.debug('Fetching Care setup status, on load, failed: ', result);
          }
        });
    }
    init();
  }

})();
