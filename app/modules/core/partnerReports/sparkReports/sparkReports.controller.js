(function () {
  'use strict';

  angular
    .module('core.partner-reports')
    .controller('SparkReportsCtrl', SparkReportsCtrl);

  /* @ngInject */
  function SparkReportsCtrl(
    $sce,
    $scope,
    $state,
    $q,
    $window,
    Analytics,
    Authinfo,
    Notification,
    QlikService,
    $log,
    FeatureToggleService,
    Userservice
  ) {
    var vm = this;
    //var orgIds = [];

    vm.sparkReports = {};
    vm.viewType = 'Partner';

    init();

    function init() {
      Userservice.getUser(
        'me',
        function (data) {
          if (data.success) {
            if (data.emails) {
              Authinfo.setEmails(data.emails);
              var promises = {
                isFeatureToggleOn: FeatureToggleService.atlasPartnerSparkReportsGetStatus(),
              };
              $q.all(promises).then(function (features) {
                $log.log('FeatureToggleService.atlasPartnerSparkReportsGetStatus() is ' + features.isFeatureToggleOn);
                if (!features.isFeatureToggleOn) {
                  $state.go('partnerreports.tab.base');
                }
              });
              setViewHeight();
              loadSparkReports();
            }
          }
        }
      );
      Analytics.trackReportsEvent(Analytics.sections.REPORTS.eventNames.PARTNER_SPARK_REPORT);
    }

    function setViewHeight() {
      if (Authinfo.isReadOnlyAdmin()) {
        vm.iframeContainerClass = 'sparkMetricsContentWithReadOnly';
      } else {
        vm.iframeContainerClass = 'sparkMetricsContent';
      }
    }

    function loadSparkReports() {
      var userInfo = {
        org_id: Authinfo.getOrgId(),
        email: Authinfo.getPrimaryEmail(),
      };

      var getSparkPartnerReportData = _.get(QlikService, 'getQBSInfo');

      if (!_.isFunction(getSparkPartnerReportData)) {
        return;
      }

      getSparkPartnerReportData('spark', vm.viewType, userInfo).then(function (data) {
        vm.sparkReports.appData = {
          QlikTicket: data.ticket,
          appId: data.appName,
          node: data.host,
          qrp: data.qlik_reverse_proxy,
          persistent: true,
          vID: Authinfo.getOrgId(),
        };
        var QlikMashupChartsUrl = _.get(QlikService, 'getQlikMashupUrl')(vm.sparkReports.appData.qrp, 'spark', vm.viewType);
        vm.sparkReports.appData.url = QlikMashupChartsUrl;
        $log.log('Spark partner report: got Mashup Url');
        updateIframe();
      })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'common.error');
        });
    }

    function updateIframe() {
      var iframeUrl = vm.sparkReports.appData.url;
      var data = {
        trustIframeUrl: $sce.trustAsResourceUrl(iframeUrl),
        appId: vm.sparkReports.appData.appId,
        QlikTicket: vm.sparkReports.appData.QlikTicket,
        node: vm.sparkReports.appData.node,
        persistent: vm.sparkReports.appData.persistent,
        vID: vm.sparkReports.appData.vID,
      };
      $scope.$broadcast('updateIframe', iframeUrl, data);
    }

    $scope.iframeLoaded = function (elem) {
      elem.ready(function () {
        var token = $window.sessionStorage.getItem('accessToken');
        var orgID = Authinfo.getOrgId();
        elem[0].contentWindow.postMessage(token + ',' + orgID, '*');
      });
    };
  }
})();
