import { QosSectionComponent } from './qos-section.component';
import { QosSectionService } from './qos-section.service';
import hybridServicesClusterServiceModuleName from 'modules/hercules/services/hybrid-services-cluster.service';
import notificationsModuleName from 'modules/core/notifications';

export default angular
  .module('mediafusion.media-service-v2.components.qos-section', [
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/scripts/services/org.service'),
    require('modules/mediafusion/media-service-v2/resources').default,
    hybridServicesClusterServiceModuleName,
    notificationsModuleName,
  ])
  .component('qosSection', new QosSectionComponent())
  .service('QosSectionService', QosSectionService)
  .name;