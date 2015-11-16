(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AABuilderNumbersCtrl', AABuilderNumbersCtrl); /* was AutoAttendantGeneralCtrl */

  /* @ngInject */
  function AABuilderNumbersCtrl($scope, $q, $stateParams, AAUiModelService, AutoAttendantCeInfoModelService, AANumberAssignmentService,
    AAModelService, ExternalNumberPoolService, InternalNumberPoolService, Authinfo, Notification, $translate, telephoneNumberFilter) {
    var vm = this;

    vm.addNumber = addNumber;
    vm.removeNumber = removeNumber;
    vm.addAAResource = addAAResource;
    vm.deleteAAResource = deleteAAResource;
    vm.getExternalNumbers = getExternalNumbers;
    vm.getInternalNumbers = getInternalNumbers;
    vm.getDupeNumberAnyAA = getDupeNumberAnyAA;
    vm.addToAvailableNumberList = addToAvailableNumberList;
    vm.compareNumbersExternalThenInternal = compareNumbersExternalThenInternal;

    vm.numberTypeList = {};

    vm.availablePhoneNums = [];

    vm.selectPlaceHolder = $translate.instant('autoAttendant.selectPlaceHolder');

    vm.inputPlaceHolder = $translate.instant('autoAttendant.inputPlaceHolder');

    // needed for cs-select's model, aaBuilderNumbers.tpl.html
    // but right now at least, we don't want to pre-select any number, so it's blank
    vm.selected = {
      "label": "",
      "value": ""
    };

    /////////////////////

    // Add Number, top-level method called by UI
    function addNumber(number) {

      if (angular.isUndefined(number) || number === '') {
        return;
      }

      // check to see if it's in the available list
      var numobj = vm.availablePhoneNums.filter(function (obj) {
        return obj.value == number;
      });

      // if it's in the available list, take it out, and add to CE resources
      if (!angular.isUndefined(numobj) && numobj.length > 0) {

        vm.availablePhoneNums = vm.availablePhoneNums.filter(function (obj) {
          return obj.value != number;
        });

        // add to the CE resources
        addAAResource(number);

        // clear selection
        vm.selected = {
          "label": "",
          "value": ""
        };

      }

    }

    // Remove number, top-level method called by UI
    function removeNumber(number) {

      if (angular.isUndefined(number) || number === '') {
        return;
      }

      addToAvailableNumberList(telephoneNumberFilter(number), number);

      vm.availablePhoneNums.sort(function (a, b) {
        return compareNumbersExternalThenInternal(a.value, b.value);
      });

      deleteAAResource(number);

      // clear selection
      vm.selected = {
        "label": "",
        "value": ""
      };

    }

    // Add the number to the CE Info resource list
    function addAAResource(number) {

      var resource = AutoAttendantCeInfoModelService.newResource();
      // both internal and external triggers are incomingCall
      resource.setTrigger('incomingCall');

      // the server POST schema specifies an id and number field but the number is actually not used; the id is used as the number
      // So just set them both to the number
      resource.setNumber(number);
      resource.setId(number);

      resource.setType(vm.numberTypeList[number]);

      // add to the resource list
      var resources = vm.ui.ceInfo.getResources();
      resources.push(resource);

      // if it's longer than 2, we sort it
      if (resources.length > 2) {

        // but we don't change the first top-line number, which is also shown in the header, so
        // get a temp list without that first number

        var tmp = _.rest(resources);

        // and sort it
        tmp.sort(function (a, b) {
          return compareNumbersExternalThenInternal(a.number, b.number);
        });

        // we have a sorted list, take out the old unsorted ones, put in the sorted ones
        resources.length = 1;

        _.forEach(tmp, function (n) {
          resources.push(n);
        });
      }

      var obj = AANumberAssignmentService.setAANumberAssignment(Authinfo.getOrgId(), vm.aaModel.aaRecordUUID, resources);
      //      var obj = AANumberAssignmentService.getListOfAANumberAssignments(Authinfo.getOrgId(), vm.aaModel.aaRecordUUID);
    }

    // Delete the number to the CE Info resource list
    function deleteAAResource(number) {
      var i = 0;

      var resources = vm.ui.ceInfo.getResources();
      for (i = 0; i < resources.length; i++) {
        if (resources[i].getNumber() === number) {
          resources.splice(i, 1);
        }
      }

      var obj = AANumberAssignmentService.setAANumberAssignment(Authinfo.getOrgId(), vm.aaModel.aaRecordUUID, resources);

    }

    function getDupeNumberAnyAA(testNum) {

      var isNumberInUseOtherAA = vm.aaModel.aaRecords.some(function (record) {
        return record.assignedResources.some(function (resource) {
          return resource.number === testNum;
        });
      });
      return isNumberInUseOtherAA;

    }

    // A comparison method used in sorting to make external numbers first, internal numbers last
    function compareNumbersExternalThenInternal(a, b) {

      // if they are of the same type, ie both external or internal, just compare directly
      if (vm.numberTypeList[a] === vm.numberTypeList[b]) {
        return a.localeCompare(b);
      }
      // else if a is an internal extension, it comes after
      else if (vm.numberTypeList[a] === "directoryNumber") {
        return 1;
        // else a must be an externalNumber, which comes first
      } else {
        return -1;
      }

    }

    function addToAvailableNumberList(label, number) {
      var opt = {
        label: label,
        value: number
      };
      vm.availablePhoneNums.push(opt);
    }

    function loadNums() {
      getExternalNumbers().then(function () {
        getInternalNumbers();
      });

    }

    function getInternalNumbers() {
      return InternalNumberPoolService.query({
        customerId: Authinfo.getOrgId(),
        directorynumber: '',
        order: 'pattern'
      }).$promise.then(function (intPool) {
        for (var i = 0; i < intPool.length; i++) {

          var number = intPool[i].pattern.replace(/\D/g, '');

          vm.numberTypeList[number] = "directoryNumber";

          // Add to the available phone number list if not already used
          if (!getDupeNumberAnyAA(number)) {
            // Internal extensions don't need formatting
            addToAvailableNumberList(number, number);

          }
        }
      });
    }

    function getExternalNumbers() {

      return ExternalNumberPoolService.query({
          customerId: Authinfo.getOrgId(),
          order: 'pattern'
        }).$promise
        .then(function (extPool) {
          for (var i = 0; i < extPool.length; i++) {

            var number = extPool[i].pattern.replace(/\D/g, '');

            vm.numberTypeList[number] = "externalNumber";

            // Add to the available phone number list if not already used
            if (!getDupeNumberAnyAA(number)) {
              // For the option list, format the number for the label,
              // and return the value as just the number
              addToAvailableNumberList(telephoneNumberFilter(number), number);

            }

          }
        });
    }

    function activate() {

      vm.aaModel = AAModelService.getAAModel();

      vm.ui = AAUiModelService.getUiModel();

      loadNums();

    }

    activate();

  }
})();
