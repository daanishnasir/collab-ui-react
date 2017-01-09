import { ExpresswayContainerController } from '../common-expressway-based/expressway-common-container.controller';

export class CalendarServiceContainerController extends ExpresswayContainerController {

    public tabs: any = [{
        title: this.$translate.instant('common.resources'),
        state: 'calendar-service.list',
    }, {
        title: this.$translate.instant('common.settings'),
        state: 'calendar-service.settings',
    }];

    public addResourceModal: any = {
        resolve: {
            connectorType: () => 'c_cal',
            serviceId: () => 'squared-fusion-cal',
            firstTimeSetup: false,
        },
        controller: 'AddResourceController',
        controllerAs: 'vm',
        templateUrl: 'modules/hercules/service-specific-pages/common-expressway-based/add-resource-modal.html',
        type: 'small',
    };

    /* @ngInject */
    constructor(
        $modal,
        $state,
        Notification,
        private $translate: ng.translate.ITranslateService,
        ServiceDescriptor: any,
        USSService: any
    ) {
        super($modal, $state, Notification, ServiceDescriptor, USSService, ['squared-fusion-cal'], 'c_cal');
    }

}

angular
    .module('Hercules')
    .controller('CalendarServiceContainerController', CalendarServiceContainerController);
