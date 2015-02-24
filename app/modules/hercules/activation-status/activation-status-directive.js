(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('ActivationStatusController', ['$scope', 'USSService', 'Authinfo', 'XhrNotificationService', function ($scope, ussService, Authinfo, xhrNotificationService) {
      $scope.isEnabled = Authinfo.isFusion();
      if (!$scope.isEnabled) return;

      var updateStatusForUser = function (id) {
        $scope.inflight = true;
        ussService.getStatusesForUser(id, function (err, data) {
          $scope.lastRequestFailed = !err ? null : xhrNotificationService.getMessages(err);
          $scope.activationStatus = data;
          $scope.inflight = false;
        });
      };

      $scope.$watch('currentUser', function (newUser, oldUser) {
        if (!newUser || !newUser.id) return $scope.activationStatus = null;
        updateStatusForUser(newUser.id);
      });

      $scope.reload = function () {
        $scope.inflight = true;
        ussService.pollCIForUser($scope.currentUser.id, function (err, data) {
          updateStatusForUser($scope.currentUser.id);
        });
      };

      $scope.getStatus = function (status) {
        return ussService.decorateWithStatus(status);
      };

    }])
    .directive('herculesActivationStatus', [
      function () {
        return {
          restrict: 'E',
          scope: false,
          controller: 'ActivationStatusController',
          templateUrl: 'modules/hercules/activation-status/activation-status.html'
        };
      }
    ]);
})();
