(function () {
  'use strict';

  angular
    .module('Core')
    .service('DeviceUsageMockService', DeviceUsageMockService);

  /* @ngInject */
  function DeviceUsageMockService(DeviceUsageMockData, $timeout, $http, $log) {

    var deviceReportsUrlBase = "http://localhost:8080/atlas-server-1.0-SNAPSHOT/admin/api/v1/";

    var service = {
      getData: getData
    };
    return service;

    function useMock() {
      return true;
    }

    // Main api supposed to simulate backend
    // Should be adjusted according to latest (preliminary) backend API
    function getData(startDate, endDate, all) {
      if (useMock()) {
        $log.warn("USING MOCK !!!!!");
        var result;
        if (all === true) {
          result = getRawData(startDate, endDate);
          //return $q.when(getRawData(startDate, endDate));
        } else {
          result = getDailySumPrType(startDate, endDate);
          //return $q.when(getDailySumPrType(startDate, endDate));
        }
        return $timeout(function () {
          return result;
        }, 2000);
      } else {
        var deviceReportsUrl;
        if (all === true) {
          deviceReportsUrl = deviceReportsUrlBase + "organization/1eb65fdf-9643-417f-9974-ad72cae0e10f/reports/device/call?deviceCategory=ce,sparkboard&intervalType=day&rangeStart=" + startDate + "&rangeEnd=" + endDate + "&accounts=__&sendMockData=false";
        } else {
          deviceReportsUrl = deviceReportsUrlBase + "organization/1eb65fdf-9643-417f-9974-ad72cae0e10f/reports/device/call?deviceCategory=ce,sparkboard&intervalType=day&rangeStart=" + startDate + "&rangeEnd=" + endDate + "&sendMockData=false";
        }
        return $http.get(deviceReportsUrl)
          .then(function (samples) {
            return samples.data.items;
          });
      }
    }

    function getRawData(startDate, endDate) {
      return DeviceUsageMockData.getRawData(startDate, endDate);
    }

    function getDailySumPrType(startDate, endDate) {
      var rawData = getRawData(startDate, endDate);
      var calculatedList = [];
      _.each(rawData, function (d) {
        var existingRegistration = _.find(calculatedList, { date: d.date, deviceCategory: d.deviceCategory });
        if (existingRegistration) {
          existingRegistration.totalDuration += d.totalDuration;
        } else {
          calculatedList.push(d);
        }
      });
      return calculatedList;
    }

  }
}());
