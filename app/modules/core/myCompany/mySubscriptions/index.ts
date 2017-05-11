import './_mySubscription.scss';
import digitalRiverModule from 'modules/online/digitalRiver/index';
import featureToggle from 'modules/core/featureToggle/index';
import notificationModule from 'modules/core/notifications/index';
import onlineUpgradeModule from 'modules/online/upgrade/index';
import webexUtilsModule from 'modules/webex/utils/index';
import sharedMeetingModule from './sharedMeetings/index';
import { MySubscriptionCtrl } from './mySubscription.controller';
import { SubscriptionHeaderCtrl } from './subscriptionHeader.controller';

export default angular
  .module('myCompany.subscriptions', [
    digitalRiverModule,
    featureToggle,
    notificationModule,
    onlineUpgradeModule,
    sharedMeetingModule,
    webexUtilsModule,
    require('angular-translate'),
    require('scripts/app.templates'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/hercules/services/service-descriptor'),
    require('collab-ui-ng').default,
  ])
  .controller('MySubscriptionCtrl', MySubscriptionCtrl)
  .controller('SubscriptionHeaderCtrl', SubscriptionHeaderCtrl)
  .name;