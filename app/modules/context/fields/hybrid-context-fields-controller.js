require('./_fields-list.scss');

(function () {
  'use strict';

  angular
    .module('Context')
    .controller('HybridContextFieldsCtrl', HybridContextFieldsCtrl);

  /* @ngInject */
  function HybridContextFieldsCtrl($scope, $rootScope, $filter, $state, $translate, Log, LogMetricsService, $q, ContextFieldsService, Notification, hasContextDictionaryEditFeatureToggle) {
    var vm = this;
    var eventListeners = [];

    vm.hasContextDictionaryEditFeatureToggle = hasContextDictionaryEditFeatureToggle;
    vm.load = true;
    vm.fetchFailed = false;
    vm.currentDataPosition = 0;
    vm.gridRefresh = false;
    vm.noSearchesYet = true;
    vm.noSearchResults = false;
    vm.fieldsList = {
      allFields: [],
    };

    vm.filterBySearchStr = filterBySearchStr;
    vm.filterList = filterList;

    vm.placeholder = {
      name: $translate.instant('common.search'),
      filterValue: '',
      count: 0,
    };

    vm.searchStr = '';

    vm.createField = function () {
      LogMetricsService.logMetrics('Opened create field modal', LogMetricsService.getEventType('contextNewField'), LogMetricsService.getEventAction('buttonClick'), 200, moment(), 1);
      $state.go('context-new-field', {
        existingFieldIds: _.map(vm.fieldsList.allFields, function (field) {
          return field.id;
        }),
        createCallback: function (newField) {
          var fieldCopy = _.cloneDeep(newField);
          vm.fieldsList.allFields.unshift(processField(fieldCopy));
          filterList(vm.searchStr);
        },
      });
    };

    $scope.$on('$destroy', onDestroy);

    init();

    function init() {
      var promises = {
        initializeGrid: initializeGrid(),
      };

      $q.all(promises)
        .then(function () {
          initializeListeners();
          return getFieldList();
        });
    }

    function initializeListeners() {
      // if the side panel is closing unselect the entry
      eventListeners.push($rootScope.$on('$stateChangeSuccess', function () {
        if ($state.includes('fields')) {
          if (vm.gridApi && vm.gridApi.selection) {
            vm.gridApi.selection.clearSelectedRows();
          }
        }
      }));
    }

    function onDestroy() {
      while (!_.isEmpty(eventListeners)) {
        _.attempt(eventListeners.pop());
      }
    }

    function processField(field) {
      var searchableMap = {
        true: $translate.instant('common.yes'),
        false: $translate.instant('common.no'),
      };

      var classificationMap = {
        ENCRYPTED: $translate.instant('context.dictionary.fieldPage.encrypted'),
        UNENCRYPTED: $translate.instant('context.dictionary.fieldPage.unencrypted'),
        PII: $translate.instant('context.dictionary.fieldPage.piiEncrypted'),
      };

      field.searchable = searchableMap[field.searchable] || $translate.instant('common.yes');

      if (field.dataType) {
        field.dataType = _.upperFirst(field.dataType.trim());
      }

      field.classification = classificationMap[field.classification] || $translate.instant('context.dictionary.fieldPage.unencrypted');

      if (field.lastUpdated) {
        field.lastUpdated = $filter('date')(field.lastUpdated, $translate.instant('context.dictionary.fieldPage.dateFormat'));
      }

      return field;
    }

    function processFieldList(fieldList) {
      return _.map(fieldList, processField);
    }

    function getFieldList() {
      if (!vm.load) {
        return $q.resolve();
      }
      vm.gridRefresh = true;
      vm.noSearchesYet = false;
      vm.fieldsList.allFields = [];
      var getAndProcessFieldsPromise = ContextFieldsService.getFields()
        .then(processFieldList)
        .then(function (processedFields) {
          vm.gridOptions.data = processedFields;
          vm.fieldsList.allFields = processedFields;
          vm.noSearchResults = processedFields.length === 0;
        })
        .catch(function (err) {
          Log.debug('CS fields search failed. Status: ' + err);
          Notification.error('context.dictionary.fieldPage.fieldReadFailed');
          vm.fetchFailed = true;
          return $q.reject(err);
        });

      var promises = {
        getAndProcessFieldsPromise: getAndProcessFieldsPromise,
      };

      return $q.all(promises)
        .then(function () {
          vm.gridApi.infiniteScroll.dataLoaded();
        })
        .finally(function () {
          vm.gridRefresh = false;
          vm.load = false;
        });
    }

    function initializeGrid() {
      var deferred = $q.defer();

      function onRegisterApi(gridApi) {
        vm.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          $state.go('context-fields-sidepanel', {
            field: row.entity,
          });
        });
        gridApi.infiniteScroll.on.needLoadMoreData($scope, function () {
          if (vm.load) {
            vm.currentDataPosition++;
            //Server side pagination is to be implemented
            getFieldList();
          }
        });
        deferred.resolve();
      }

      vm.gridOptions = {
       // data: [], // is populated directly by the functions supplying the data.
        multiSelect: false,
        rowHeight: 44,
        enableColumnResize: true,
        enableRowHeaderSelection: false,
        enableColumnMenus: false,
        onRegisterApi: onRegisterApi,
        columnDefs: [{
          field: 'id',
          displayName: $translate.instant('context.dictionary.fieldPage.fieldId'),
          maxWidth: 300,
        }, {
          field: 'description',
          displayName: $translate.instant('common.description'),
        }, {
          field: 'dataType',
          displayName: $translate.instant('context.dictionary.fieldPage.dataType'),
          maxWidth: 200,
        }, {
          field: 'classification',
          displayName: $translate.instant('context.dictionary.fieldPage.classification'),
          maxWidth: 200,
        }, {
          field: 'searchable',
          displayName: $translate.instant('context.dictionary.fieldPage.searchable'),
          maxWidth: 200,
        }, {
          field: 'lastUpdated',
          displayName: $translate.instant('context.dictionary.fieldPage.lastUpdated'),
          maxWidth: 300,
        }],
      };
      return deferred.promise;
    }

    // On click, wait for typing to stop and run search
    function filterList(str) {
      vm.searchStr = str;
      return filterBySearchStr(vm.fieldsList.allFields, str)
        .then(function (processedFields) {
          vm.gridOptions.data = processedFields;
          vm.noSearchResults = processedFields.length === 0;
          vm.placeholder.count = processedFields.length;
        });
    }

    //filter out the list by the searchStr
    function filterBySearchStr(fieldList, str) {
      if (!str) {
        return $q.resolve(fieldList);
      }

      var lowerStr = str.toLowerCase();
      return $q.resolve(fieldList.filter(function (field) {
        return (_.has(field, 'id') ? (field.id.toLowerCase().indexOf(lowerStr) !== -1) : false) ||
          (_.has(field, 'description') ? (field.description.toLowerCase().indexOf(lowerStr) !== -1) : false) ||
          (_.has(field, 'dataType') ? (field.dataType.toLowerCase().indexOf(lowerStr) !== -1) : false) ||
          (_.has(field, 'searchable') ? (field.searchable.toLowerCase().indexOf(lowerStr) !== -1) : false) ||
          (_.has(field, 'classification') ? (field.classification.toLowerCase().indexOf(lowerStr) !== -1) : false) ||
          (_.has(field, 'lastUpdated') ? (field.lastUpdated.toLowerCase().indexOf(lowerStr) !== -1) : false);
      }));
    }
  }
}());
