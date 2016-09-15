(function () {
  'use strict';
  angular.module('Sunlight').controller('CareReportsController', CareReportsController);
  /* @ngInject */
  function CareReportsController($timeout, $translate, CareReportsService, DummyCareReportService, Notification, SunlightReportService) {
    var vm = this;
    var REFRESH = 'refresh';
    var SET = 'set';
    var EMPTY = 'empty';

    vm.dataStatus = REFRESH;
    vm.snapshotDataStatus = REFRESH;
    vm.taskIncomingDescription = "";
    vm.taskTimeDescription = "";
    vm.averageCsatDescription = "";

    vm.allReports = 'all';
    vm.engagement = 'engagement';
    vm.quality = 'quality';
    vm.currentFilter = vm.allReports;
    vm.displayEngagement = true;
    vm.displayQuality = true;
    vm.resetCards = resetCards;

    vm.timeFilter = null;

    var options = ['today', 'yesterday', 'week', 'month', 'threeMonths'];
    vm.timeOptions = _.map(options, function (name, i) {
      return {
        value: i,
        label: $translate.instant('careReportsPage.' + name),
        description: $translate.instant('careReportsPage.' + name + '2'),
        taskStatus: $translate.instant('careReportsPage.' + name + 'TaskStatus'),
        intervalTxt: $translate.instant('careReportsPage.' + name + 'Interval'),
        categoryAxisTitle: $translate.instant('careReportsPage.' + name + 'CategoryAxis')
      };
    });

    vm.timeSelected = vm.timeOptions[0];
    vm.timeUpdate = timeUpdate;

    function timeUpdate() {
      vm.dataStatus = REFRESH;
      vm.snapshotDataStatus = REFRESH;
      setFilterBasedTextForCare(vm.timeSelected.value);

      showReportsWithDummyData();
      showReportsWithRealData();
      resizeCards();
      delayedResize();
    }

    function setFilterBasedTextForCare(timeSelected) {
      var descriptions = ['descriptionToday', 'descriptionYesterday', 'descriptionLastWeek', 'descriptionLastMonth', 'descriptionLastThreeMonths'];
      vm.descriptionOptions = _.map(descriptions, function (name) {
        return {
          taskIncomingDescription: $translate.instant('taskIncoming.' + name),
          taskTimeDescription: $translate.instant('taskTime.' + name),
          averageCsatDescription: $translate.instant('averageCsat.' + name),
        };
      });
      vm.description = vm.descriptionOptions[timeSelected];

      vm.taskIncomingDescription = $translate.instant(vm.description.taskIncomingDescription, {
        time: vm.timeSelected.description,
        interval: vm.timeSelected.intervalTxt,
        taskStatus: vm.timeSelected.taskStatus
      });

      vm.taskTimeDescription = $translate.instant(vm.description.taskTimeDescription, {
        time: vm.timeSelected.description,
        interval: vm.timeSelected.intervalTxt
      });

      vm.averageCsatDescription = $translate.instant(vm.description.averageCsatDescription, {
        time: vm.timeSelected.description,
        interval: vm.timeSelected.intervalTxt
      });
    }

    function showReportsWithRealData() {
      var isToday = (vm.timeSelected.value === 0);
      var categoryAxisTitle = vm.timeSelected.categoryAxisTitle;
      SunlightReportService.getReportingData('org_stats', vm.timeSelected.value, 'chat')
        .then(function (data) {
          if (data.length === 0) {
            vm.dataStatus = EMPTY;
          } else {
            vm.dataStatus = SET;
            CareReportsService.showTaskIncomingGraph('taskIncomingdiv', data, categoryAxisTitle, isToday);
            CareReportsService.showTaskTimeGraph('taskTimeDiv', data, categoryAxisTitle, isToday);
            CareReportsService.showAverageCsatGraph('averageCsatDiv', data, categoryAxisTitle, isToday);
            resizeCards();
          }
        }, function () {
          vm.dataStatus = EMPTY;
          Notification.error($translate.instant('careReportsPage.taskDataGetError', { dataType: 'Tasks' }));
        });
      if (isToday) {
        showSnapshotReportWithRealData();
      }
    }

    function showSnapshotReportWithRealData() {
      var isSnapshot = true;
      SunlightReportService.getReportingData('org_snapshot_stats', vm.timeSelected.value, 'chat', isSnapshot)
        .then(function (data) {
          if (data.length === 0) {
            vm.snapshotDataStatus = EMPTY;
          } else {
            vm.snapshotDataStatus = SET;
            CareReportsService.showTaskAggregateGraph('taskAggregateDiv', data, vm.timeSelected.categoryAxisTitle);
            resizeCards();
          }
        }, function () {
          vm.snapshotDataStatus = EMPTY;
          Notification.error($translate.instant('careReportsPage.taskDataGetError', { dataType: 'Task Aggregation' }));
        });
    }

    // Graph data status checks
    vm.isRefresh = function (tab) {
      return tab === REFRESH;
    };

    vm.isEmpty = function (tab) {
      return tab === EMPTY;
    };

    function showReportsWithDummyData() {
      var dummyData = DummyCareReportService.dummyOrgStatsData(vm.timeSelected.value);
      var categoryAxisTitle = vm.timeSelected.categoryAxisTitle;
      var isToday = (vm.timeSelected.value === 0);
      CareReportsService.showTaskIncomingDummy('taskIncomingdiv', dummyData, categoryAxisTitle, isToday);
      CareReportsService.showTaskTimeDummy('taskTimeDiv', dummyData, categoryAxisTitle, isToday);
      CareReportsService.showAverageCsatDummy('averageCsatDiv', dummyData, categoryAxisTitle, isToday);
      CareReportsService.showTaskAggregateDummy('taskAggregateDiv', dummyData, categoryAxisTitle, isToday);
      resizeCards();
    }

    function resizeCards() {
      $timeout(function () {
        $('.cs-card-layout').masonry('destroy');
        $('.cs-card-layout').masonry({
          itemSelector: '.cs-card',
          columnWidth: '.cs-card',
          isResizable: true,
          percentPosition: true
        });
      }, 0);
    }

    function delayedResize() {
      // delayed resize necessary to fix any overlapping cards on smaller screens
      $timeout(function () {
        $('.cs-card-layout').masonry('layout');
      }, 500);
    }

    function resetCards(filter) {
      if (vm.currentFilter !== filter) {
        vm.displayEngagement = false;
        vm.displayQuality = false;
        if (filter === vm.allReports || filter === vm.engagement) {
          vm.displayEngagement = true;
        }
        if (filter === vm.allReports || filter === vm.quality) {
          vm.displayQuality = true;
        }
        vm.currentFilter = filter;
      }
      resizeCards();
      delayedResize();
    }

    $timeout(function () {
      timeUpdate();
    }, 30);
  }
})();
