(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AABuilderMainCtrl', AABuilderMainCtrl); /* was AutoAttendantMainCtrl */

  /* @ngInject */
  function AABuilderMainCtrl($scope, $translate, $state, $stateParams, $q, AAUiModelService, AAModelService, AutoAttendantCeInfoModelService, AutoAttendantCeMenuModelService, AutoAttendantCeService, AAValidationService, AANumberAssignmentService, Notification, Authinfo) {
    var vm = this;
    vm.overlayTitle = $translate.instant('autoAttendant.builderTitle');
    vm.aaModel = {};
    vm.ui = {};
    vm.errorMessages = [];
    vm.aaNameFocus = false;

    vm.setAANameFocus = setAANameFocus;
    vm.close = closePanel;
    vm.saveAARecords = saveAARecords;
    vm.canSaveAA = canSaveAA;
    vm.getSaveErrorMessages = getSaveErrorMessages;
    vm.selectAA = selectAA;
    vm.populateUiModel = populateUiModel;
    vm.saveUiModel = saveUiModel;
    vm.setupTemplate = setupTemplate;
    vm.templateName = $stateParams.aaTemplate;
    vm.saveAANumberAssignmentWithErrorDetail = saveAANumberAssignmentWithErrorDetail;
    vm.areAssignedResourcesDifferent = areAssignedResourcesDifferent;

    vm.templateDefinitions = [{
      tname: "template1",
      actions: [{
        lane: 'openHours',
        actionset: ['say', 'runActionsOnInput']
      }]
    }];

    $scope.saveAARecords = saveAARecords;

    /////////////////////

    function setAANameFocus() {
      vm.aaNameFocus = true;
    }

    // Returns true if the provided assigned resources are different in size or in the passed-in field
    function areAssignedResourcesDifferent(aa1, aa2, tag) {

      // if we have a different number of resources, we definitely have a difference
      if (aa1.length !== aa2.length) {
        return true;
      } else {
        // otherwise, filter on the passed-in field and compare
        var a1 = _.pluck(aa1, tag);
        var a2 = _.pluck(aa2, tag);
        return (_.difference(a1, a2).length > 0 || _.difference(a2, a1).length > 0);
      }

    }

    // Save the phone number resources originally in the CE (used on exit with no save, and on save error)
    function unAssignAssigned() {
      // check to see if the local assigned list of resources is different than in CE info
      if (areAssignedResourcesDifferent(vm.aaModel.aaRecord.assignedResources, vm.ui.ceInfo.getResources(), 'id')) {
        var ceInfo = AutoAttendantCeInfoModelService.getCeInfo(vm.aaModel.aaRecord);
        return AANumberAssignmentService.setAANumberAssignment(Authinfo.getOrgId(), vm.aaModel.aaRecordUUID, ceInfo.getResources()).then(
          function (response) {
            return response;
          },
          function (response) {
            Notification.error('autoAttendant.errorResetCMI');
            return $q.reject(response);
          }
        );
      } else {
        // no unassignment necessary - just return fulfilled promise
        var deferred = $q.defer();
        deferred.resolve([]);
        return deferred.promise;
      }
    }

    function closePanel() {
      unAssignAssigned().finally(function () {
        $state.go('huronfeatures');
      });

    }

    function removeNumberAttribute(resources) {
      for (var i = 0; i < resources.length; i++) {
        delete resources[i].number;
      }

    }

    function populateUiModel() {
      vm.ui.ceInfo = AutoAttendantCeInfoModelService.getCeInfo(vm.aaModel.aaRecord);

      vm.ui.openHours = vm.ui.openHours || AutoAttendantCeMenuModelService.getCombinedMenu(vm.aaModel.aaRecord, 'openHours');
      vm.ui.closedHours = vm.ui.closedHours || AutoAttendantCeMenuModelService.getCombinedMenu(vm.aaModel.aaRecord, 'closedHours');
      vm.ui.holidays = vm.ui.holidays || AutoAttendantCeMenuModelService.getCombinedMenu(vm.aaModel.aaRecord, 'holidays');
      vm.ui.isOpenHours = true;
      if (!angular.isDefined(vm.ui.openHours)) {
        vm.ui.openHours = AutoAttendantCeMenuModelService.newCeMenu();
        vm.ui.openHours.setType('MENU_WELCOME');
      }

      if (angular.isDefined(vm.ui.closedHours)) {
        vm.ui.isClosedHours = true;
      } else {
        vm.ui.isClosedHours = false;
        vm.ui.closedHours = AutoAttendantCeMenuModelService.newCeMenu();
        vm.ui.closedHours.setType('MENU_WELCOME');
      }
      if (angular.isDefined(vm.ui.holidays)) {
        vm.ui.isHolidays = true;
      } else {
        vm.ui.isHolidays = false;
        vm.ui.holidays = AutoAttendantCeMenuModelService.newCeMenu();
        vm.ui.holidays.setType('MENU_WELCOME');
      }
    }

    function saveUiModel() {
      if (angular.isDefined(vm.ui.ceInfo) && angular.isDefined(vm.ui.ceInfo.getName()) && vm.ui.ceInfo.getName().length > 0) {
        if (angular.isDefined(vm.ui.builder.ceInfo_name) && (vm.ui.builder.ceInfo_name.length > 0)) {
          vm.ui.ceInfo.setName(angular.copy(vm.ui.builder.ceInfo_name));
        }
        AutoAttendantCeInfoModelService.setCeInfo(vm.aaModel.aaRecord, vm.ui.ceInfo);
      }
      if (vm.ui.isOpenHours && angular.isDefined(vm.ui.openHours)) {
        AutoAttendantCeMenuModelService.updateCombinedMenu(vm.aaModel.aaRecord, 'openHours', vm.ui.openHours);
      }
      if (vm.ui.isClosedHours && angular.isDefined(vm.ui.closedHours)) {
        AutoAttendantCeMenuModelService.updateCombinedMenu(vm.aaModel.aaRecord, 'closedHours', vm.ui.closedHours);
      } else {
        AutoAttendantCeMenuModelService.deleteCombinedMenu(vm.aaModel.aaRecord, 'closedHours');
        vm.ui.closedHours = AutoAttendantCeMenuModelService.newCeMenu();
        vm.ui.closedHours.setType('MENU_WELCOME');
      }
      if (vm.ui.isHolidays && angular.isDefined(vm.ui.holidays)) {
        AutoAttendantCeMenuModelService.updateCombinedMenu(vm.aaModel.aaRecord, 'holidays', vm.ui.holidays);
      } else {
        AutoAttendantCeMenuModelService.deleteCombinedMenu(vm.aaModel.aaRecord, 'holidays');
        vm.ui.holidays = AutoAttendantCeMenuModelService.newCeMenu();
        vm.ui.holidays.setType('MENU_WELCOME');
      }
    }

    // Set the numbers in CMI with error details (involves multiple saves in the AANumberAssignmentService service)
    // Notify the user of any numbers that failed
    function saveAANumberAssignmentWithErrorDetail(resources) {

      return AANumberAssignmentService.formatAAResourcesBasedOnCMI(resources).then(function (fmtResources) {

        AANumberAssignmentService.setAANumberAssignmentWithErrorDetail(Authinfo.getOrgId(), vm.aaModel.aaRecordUUID, fmtResources).then(
          function (response) {
            if (angular.isDefined(response.failedResources) && response.failedResources.length > 0) {
              Notification.error('autoAttendant.errorFailedToAssignNumbers', {
                phoneNumbers: _.pluck(response.failedResources, 'id')
              });
            }
            return response;
          }
        );
      });
    }

    function saveAARecords() {

      var aaRecords = vm.aaModel.aaRecords;
      var aaRecord = vm.aaModel.aaRecord;

      var aaRecordUUID = vm.aaModel.aaRecordUUID;
      vm.ui.builder.ceInfo_name = vm.ui.builder.ceInfo_name.trim();
      if (!AAValidationService.isNameValidationSuccess(vm.ui.builder.ceInfo_name, aaRecordUUID)) {
        return;
      }

      vm.saveUiModel();

      var i = 0;
      var isNewRecord = true;
      if (aaRecordUUID.length > 0) {
        for (i = 0; i < aaRecords.length; i++) {
          if (AutoAttendantCeInfoModelService.extractUUID(aaRecords[i].callExperienceURL) === aaRecordUUID) {
            isNewRecord = false;
            break;
          }
        }
      }

      // Workaround: remove resource.number attribute before sending the ceDefinition to CES
      //
      var _aaRecord = angular.copy(aaRecord);
      removeNumberAttribute(_aaRecord.assignedResources);
      //

      if (isNewRecord) {
        var ceUrlPromise = AutoAttendantCeService.createCe(_aaRecord);
        ceUrlPromise.then(
          function (response) {
            // create successfully
            var newAaRecord = {};
            newAaRecord.callExperienceName = aaRecord.callExperienceName;
            newAaRecord.assignedResources = angular.copy(aaRecord.assignedResources);
            newAaRecord.callExperienceURL = response.callExperienceURL;
            aaRecords.push(newAaRecord);
            vm.aaModel.aaRecordUUID = AutoAttendantCeInfoModelService.extractUUID(response.callExperienceURL);
            vm.aaModel.ceInfos.push(AutoAttendantCeInfoModelService.getCeInfo(newAaRecord));
            Notification.success('autoAttendant.successCreateCe', {
              name: aaRecord.callExperienceName
            });

          },
          function (response) {
            Notification.error('autoAttendant.errorCreateCe', {
              name: aaRecord.callExperienceName,
              statusText: response.statusText,
              status: response.status
            });
            unAssignAssigned();
          }
        );
      } else {

        // If a possible discrepancy was found between the phone number list in CE and the one stored in CMI
        // Try a complete save here and report error details
        if (vm.aaModel.possibleNumberDiscrepancy) {
          saveAANumberAssignmentWithErrorDetail(vm.aaModel.ceInfos[i].getResources());
        }

        var updateResponsePromise = AutoAttendantCeService.updateCe(
          aaRecords[i].callExperienceURL,
          _aaRecord);

        updateResponsePromise.then(
          function (response) {
            // update successfully
            aaRecords[i].callExperienceName = aaRecord.callExperienceName;
            aaRecords[i].assignedResources = angular.copy(aaRecord.assignedResources);
            vm.aaModel.ceInfos[i] = AutoAttendantCeInfoModelService.getCeInfo(aaRecords[i]);
            Notification.success('autoAttendant.successUpdateCe', {
              name: aaRecord.callExperienceName
            });

          },
          function (response) {
            Notification.error('autoAttendant.errorUpdateCe', {
              name: aaRecord.callExperienceName,
              statusText: response.statusText,
              status: response.status
            });
            unAssignAssigned();
          }
        );
      }
    }

    function canSaveAA() {
      var canSave = true;
      return canSave;
    }

    function getSaveErrorMessages() {

      var messages = vm.errorMessages.join('<br>');

      return messages;
    }

    function setupTemplate() {

      if (!vm.templateName) {
        return;
      }

      var specifiedTemplate = _.find(vm.templateDefinitions, {
        tname: vm.templateName
      });

      if (angular.isUndefined(specifiedTemplate) || angular.isUndefined(specifiedTemplate.tname) || specifiedTemplate.tname.length === 0) {
        Notification.error('autoAttendant.errorInvalidTemplate', {
          template: vm.templateName
        });
        return;
      }

      if (angular.isUndefined(specifiedTemplate.actions) || specifiedTemplate.actions.length === 0) {
        Notification.error('autoAttendant.errorInvalidTemplateDef', {
          template: vm.templateName
        });
        return;
      }

      _.forEach(specifiedTemplate.actions, function (action) {
        var uiMenu = vm.ui[action.lane];

        if (action.lane === "holidays") {
          vm.ui.isHolidays = true;
        }

        if (action.lane === "closedHours") {
          vm.ui.isClosedHours = true;
        }

        if (angular.isUndefined(action.actionset) || action.actionset.length === 0) {
          Notification.error('autoAttendant.errorInvalidTemplateDef', {
            template: vm.templateName
          });
          return;
        }

        _.forEach(action.actionset, function (actionset) {
          var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
          var menuAction = AutoAttendantCeMenuModelService.newCeActionEntry(actionset, '');
          menuEntry.isConfigured = false;
          menuEntry.addAction(menuAction);
          uiMenu.appendEntry(menuEntry);
        });
      });
    }

    function selectAA(aaName) {
      vm.aaModel.aaName = aaName;
      if (angular.isUndefined(vm.aaModel.aaRecord)) {
        if (aaName === '') {
          vm.aaModel.aaRecord = AAModelService.getNewAARecord();
          vm.aaModel.aaRecordUUID = "";
        } else {

          var aaRecord = _.find(vm.aaModel.aaRecords, {
            callExperienceName: aaName
          });

          if (angular.isDefined(aaRecord)) {
            AutoAttendantCeService.readCe(aaRecord.callExperienceURL).then(
              function (data) {
                vm.aaModel.aaRecord = data;
                // Workaround for reading the dn number: by copying it from aaRecords[i], until
                // dn number is officialy stored in ceDefintion.
                vm.aaModel.aaRecord.assignedResources = angular.copy(aaRecord.assignedResources);
                vm.aaModel.aaRecordUUID = AutoAttendantCeInfoModelService.extractUUID(aaRecord.callExperienceURL);

                vm.populateUiModel();
              },
              function (response) {
                Notification.error('autoAttendant.errorReadCe', {
                  name: aaName,
                  statusText: response.statusText,
                  status: response.status
                });
              }
            );
            return;
          }
        }
      }
      vm.populateUiModel();
      vm.setupTemplate();
    }

    function activate() {

      var aaName = $stateParams.aaName;
      vm.aaModel = AAModelService.getAAModel();
      vm.aaModel.aaRecord = undefined;
      AAUiModelService.initUiModel();
      var aaTemplate = $stateParams.aaTemplate;
      vm.ui = AAUiModelService.getUiModel();
      vm.ui.ceInfo = {};
      vm.ui.ceInfo.name = aaName;
      vm.ui.builder = {};
      // Define vm.ui.builder.ceInfo_name for editing purpose.
      vm.ui.builder.ceInfo_name = angular.copy(vm.ui.ceInfo.name);

      AutoAttendantCeInfoModelService.getCeInfosList().then(function (data) {
        vm.selectAA(aaName);
      }, function (data) {
        vm.selectAA(aaName);
      });
    }

    activate();

  }
})();
