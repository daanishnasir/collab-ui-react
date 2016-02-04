(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AARouteToExtNumCtrl', AARouteToExtNumCtrl);

  /* @ngInject */
  function AARouteToExtNumCtrl($scope, $translate, AAUiModelService, AutoAttendantCeMenuModelService, AAModelService, AACommonService) {

    var vm = this;

    vm.model = {};

    vm.model.phoneNumberInput = {
      phoneNumber: ''
    };

    vm.countryList = [{
      key: 'phoneNumberInput',
      type: 'countrylist',
      templateOptions: {
        placeholder: $translate.instant('autoAttendant.routeExtNumPlaceHolder')
      }
    }];

    vm.aaModel = {};
    vm.uiMenu = {};
    vm.menuEntry = {
      entries: []
    };
    vm.menuKeyEntry = {};

    vm.populateUiModel = populateUiModel;
    vm.saveUiModel = saveUiModel;

    // the CE action verb is 'route'
    var rtExtNum = 'route';

    /////////////////////

    function populateUiModel() {
      vm.model.phoneNumberInput.phoneNumber = vm.menuKeyEntry.actions[0].getValue();
    }

    function saveUiModel() {
      var num = vm.model.phoneNumberInput.phoneNumber;
      if (num) {
        num = num.replace(/\D/g, '');
      }
      vm.menuKeyEntry.actions[0].setValue(num);
      AACommonService.setPhoneMenuStatus(true);
    }

    // when the phone number is changed in the UI, save to model
    // the country select control doesn't offer a change element
    // we tried ng-change and it errored and didn't work
    $scope.$watch(
      "aaRouteToExtNum.model.phoneNumberInput.phoneNumber",
      function handlePhoneNumberChange(newValue, oldValue) {
        if (newValue != oldValue) {
          saveUiModel();
        }
      }
    );

    function activate() {
      vm.aaModel = AAModelService.getAAModel();
      var ui = AAUiModelService.getUiModel();

      vm.uiMenu = ui[$scope.schedule];
      vm.menuEntry = vm.uiMenu.entries[$scope.index];

      if (angular.isDefined($scope.fromRouteCall)) {

        // existing action for route to external number?
        if (!_.find(vm.menuEntry.actions, {
            name: 'route'
          })) {
          action = AutoAttendantCeMenuModelService.newCeActionEntry('route', '');
          vm.menuEntry.addAction(action);
        }

      } else {

        if ($scope.keyIndex < vm.menuEntry.entries.length) {
          vm.menuKeyEntry = vm.menuEntry.entries[$scope.keyIndex];
        } else {
          vm.menuKeyEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
          var action = AutoAttendantCeMenuModelService.newCeActionEntry(rtExtNum, '');
          vm.menuKeyEntry.addAction(action);
        }
      }

      populateUiModel();

    }

    activate();

  }
})();
