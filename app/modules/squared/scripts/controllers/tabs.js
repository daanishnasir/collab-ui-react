'use strict';

angular.module('Squared')
  .controller('TabsCtrl', ['Config', '$rootScope', '$scope', '$location', 'Log', 'Utils', '$filter', 'Auth', 'Authinfo',
    function(Config, $rootScope, $scope, $location, Log, Utils, $filter, Auth, Authinfo) {

      // TODO refactor isActive logic

      $scope.tabs = Authinfo.getTabs();

      $scope.$on('AuthinfoUpdated', function() {
        $scope.tabs = Authinfo.getTabs();
      });

      $rootScope.$on('$stateChangeSuccess', function() {
        setNavigationTab();
      });

      var setNavigationTab = function() {
        resetActiveTabState();

        for (var idx in $scope.tabs) {
          if ($scope.tabs[idx].subPages) {
            for (var i = 0; i < $scope.tabs[idx].subPages.length; i++) {
              if (Utils.comparePaths($scope.tabs[idx].subPages[i].link, $location.path())) {
                $scope.tabs[idx].isActive = true;
                break;
              }
            }
          } else {
            if (Utils.comparePaths($scope.tabs[idx].link, $location.path())) {
              $scope.tabs[idx].isActive = true;
              break;
            }
          }
        }
      };

      var resetActiveTabState = function() {
        for(var idx in $scope.tabs) {
          $scope.tabs[idx].isActive = false;
        }
      };

    }
  ]);
