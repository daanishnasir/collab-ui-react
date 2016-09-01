class SubscriptionHeaderCtrl {
  public isTrial = false;
  public isOnline = false;
  public subId: string;
  public upgradeTrialUrl: string;

  /* @ngInject */
  constructor($scope, $timeout, $translate, Authinfo, UrlConfig) {
    this.isOnline = Authinfo.isOnline();

    $scope.$on('SUBSCRIPTION::upgradeData', (event, response) => {
      this.isTrial = response.isTrial;
      this.subId = response.subId;
      this.upgradeTrialUrl = response.upgradeTrialUrl;

      if (this.isOnline) {
        // display a BMMP Change Plan button
        $timeout(() => {
          bmmp.init(null, null, Authinfo.getOrgId(), 'atlas', $translate.use(), null, UrlConfig.getBmmpUrl());
        }, 300);
      }
    });
  }
}

angular
  .module('Core')
  .controller('SubscriptionHeaderCtrl', SubscriptionHeaderCtrl);