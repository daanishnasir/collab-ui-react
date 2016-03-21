(function () {
  'use strict';

  angular.module('WebExApp').factory('WebExRestApiFact', [
    '$http',
    '$log',
    '$interpolate',
    '$q',
    '$timeout',
    '$rootScope',
    'Authinfo',
    'Storage',
    'WebExUtilsFact',

    function (
      $http,
      $log,
      $interpolate,
      $q,
      $timeout,
      $rootScope,
      Authinfo,
      Storage,
      WebExUtilsFact
    ) {

      var _this = this;

      this.sendRestApiReq = function (
        mockIt,
        httpReq,
        resolve,
        reject
      ) {

        var funcName = "sendRestApiReq()";
        var logMsg = "";

        logMsg = funcName + "\n" +
          "httpReq.url=" + JSON.stringify(httpReq.url);
        $log.log(logMsg);

        if (mockIt) {
          var fakeResult = httpReq;
          resolve(fakeResult);
          return;
        }

        $http(
          httpReq
        ).success(
          function (data) {
            resolve(data);
          }
        ).error(
          function (data) {
            reject(data);
          }
        );
      }; //sendRestApiReq()

      return {
        csvStatusReq: function (
          mockIt,
          siteUrl
        ) {
          var funcName = "csvStatusReq()";
          var logMsg = "";

          logMsg = funcName + "\n" +
            "siteUrl=" + siteUrl;
          // $log.log(logMsg);

          var httpReqObj = {
            'url': 'https://' + siteUrl + '/meeting/v1/users/importexportstatus',
            'method': 'GET',
            'headers': {
              'Content-Type': 'application/json;charset=utf-8',
              'Authorization': 'Bearer ' + Storage.get('accessToken')
            }
          };

          return $q(
            function (resolve, reject) {
              _this.sendRestApiReq(
                mockIt,
                httpReqObj,
                resolve,
                reject
              );
            }
          );
        }, // csvStatusReq()

        csvExportReq: function (
          siteUrl
        ) {
          var funcName = "csvExportReq()";
          var logMsg = "";

          logMsg = funcName + "\n" +
            "siteUrl=" + siteUrl;
          // $log.log(logMsg);

          var httpReqObj = {
            'url': 'https://' + siteUrl + '/meeting/v1//users/export',
            'method': 'POST',
            'headers': {
              'Content-Type': 'application/json;charset=utf-8',
              'Authorization': 'Bearer ' + Storage.get('accessToken')
            },
            'data': {
              'siteName': WebExUtilsFact.getSiteName(siteUrl),
              'type': 'csv'
            }
          };

          return $q(
            function (resolve, reject) {
              _this.sendRestApiReq(
                true,
                httpReqObj,
                resolve,
                reject
              );
            }
          );
        }, // csvExportReq()

        csvImportReq: function (
          siteUrl,
          csvFile
        ) {
          var funcName = "csvExportReq()";
          var logMsg = "";

          logMsg = funcName + "\n" +
            "siteUrl=" + siteUrl + "\n" +
            "csvFile=" + csvFile;
          // $log.log(logMsg);

          var httpReqObj = {
            'url': 'https://' + siteUrl + '/meeting/v1//users/export',
            'method': 'POST',
            'headers': {
              'Content-Type': 'multipart/form-data;charset=utf-8"',
              'Authorization': 'Bearer ' + Storage.get('accessToken')
            },
            'data': {
              'siteName': WebExUtilsFact.getSiteName(siteUrl),
              'type': 'csv'
            }
          };

          return $q(
            function (resolve, reject) {
              _this.sendRestApiReq(
                true,
                httpReqObj,
                resolve,
                reject
              );
            }
          );
        }, // csvImportReq()

        csvFileDownloadReq: function (
          siteUrl,
          fileID) {
          var funcName = "csvFileDownloadReq()";
          var logMsg = "";

          var httpReqObj = {
            'url': 'https://' + siteUrl + '/meeting/v1/files/fileID',
            'method': 'POST',
            'headers': {
              'Content-Type': 'application/json;charset=utf-8',
              'Authorization': 'Bearer ' + Storage.get('accessToken')
            }
          };
        }, // csvFileDownload()
      }; // return
    } // top level function()
  ]);
})();
