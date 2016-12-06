import { ICardButton, ICardStatus, CardType } from './ServicesOverviewCard';
import { IServiceStatus, filterAndGetCssStatus, filterAndGetTxtStatus, filterAndGetEnabledService } from './ServicesOverviewHybridCard';
import { ServicesOverviewCard } from './ServicesOverviewCard';

export class ServicesOverviewHybridAndGoogleCalendarCard extends ServicesOverviewCard {
  private canDisplay: ng.IDeferred<boolean> = this.$q.defer();
  private googleStatus: ICardStatus;

  public googleActive: boolean = false;
  public noneActive = !this.active && !this.googleActive;

  // Don't care but because of ServicesOverviewCard we have to do something
  public getShowMoreButton() {
    return undefined;
  }

  public openChoiceModal() {
    this.$modal.open({
      controller: 'SelectCalendarServiceController',
      controllerAs: 'vm',
      templateUrl: 'modules/hercules/service-settings/calendar-service-setup/select-calendar-service-modal.html',
    })
    .result
    .then((result) => {
      if (result === 'exchange') {
        this.firstTimeExchangeSetup();
      } else if (result === 'google') {
        this.firstTimeGoogleSetup();
      }
    });
  }

  private firstTimeExchangeSetup() {
    this.$modal.open({
      resolve: {
        connectorType: () => 'c_cal',
        servicesId: () => ['squared-fusion-cal'],
        firstTimeSetup: true,
      },
      controller: 'AddResourceController',
      controllerAs: 'vm',
      templateUrl: 'modules/hercules/add-resource/add-resource-modal.html',
      type: 'small',
    });
  }

  private firstTimeGoogleSetup() {
    this.$modal.open({
      controller: 'FirstTimeGoogleSetupController',
      controllerAs: 'vm',
      templateUrl: 'modules/hercules/service-settings/calendar-service-setup/first-time-google-setup.html',
    });
  }

  // Hybrid Calendar
  private setupHybridCalendarButton: ICardButton = {
    name: 'servicesOverview.genericButtons.setup',
    routerState: 'calendar-service.list',
    buttonClass: 'btn btn--primary',
  };

  private hybridCalendarButtons: Array<ICardButton> = [{
    name: 'servicesOverview.cards.hybridCalendar.buttons.resources',
    routerState: 'calendar-service.list',
    buttonClass: 'btn-link',
  },
  {
    name: 'servicesOverview.cards.hybridCalendar.buttons.settings',
    routerState: 'calendar-service.settings',
    buttonClass: 'btn-link',
  }];

  public getButtons(): Array<ICardButton> {
    if (this.active) {
      return this.hybridCalendarButtons;
    }
    return [this.setupHybridCalendarButton];
  }

  // Google Calendar
  private setupGoogleCalendarButton: ICardButton = {
    name: 'servicesOverview.genericButtons.setup',
    routerState: '404',
    buttonClass: 'btn btn--primary',
  };

  private googleCalendarButton: ICardButton = {
    name: 'servicesOverview.cards.hybridCalendar.buttons.settings',
    routerState: 'google-calendar-service.settings',
    buttonClass: 'btn-link',
  };

  public getGoogleButtons(): Array<ICardButton> {
    if (this.googleActive) {
      return [this.googleCalendarButton];
    }
    return [this.setupGoogleCalendarButton];
  }

  public googleCalendarFeatureToggleEventHandler(hasFeature: boolean) {
    this.display = this.Authinfo.isFusionCal() && this.Authinfo.isFusionGoogleCal() && hasFeature;
    if (this.display) {
      // We only get the status for Hybrid Calendar that way
      this.CloudConnectorService.isServiceSetup('squared-fusion-gcal')
        .then((isSetup) => {
          // conveys the same as .active for Hybrid Calendar
          this.googleActive = isSetup;
          this.canDisplay.resolve(true);
          // Fake data for now
          this.googleStatus = {
            status: 'default',
            text: 'servicesOverview.cardStatus.setupNotComplete',
            routerState: 'calendar-service.list', // will trigger the right modal
          };
        });
    }
  }

  // Contains data for Hybrid Services, not Google Calendar
  public hybridStatusEventHandler(servicesStatuses: Array<IServiceStatus>) {
    const service = 'squared-fusion-cal';
    // No need to do any work if we can't display the card
    this.canDisplay.promise.then(() => {
      this.status = {
        status: filterAndGetCssStatus(this.FusionClusterStatesService, servicesStatuses, service),
        text: filterAndGetTxtStatus(servicesStatuses, service),
        routerState: 'calendar-service.list',
      };
      this.active = filterAndGetEnabledService(servicesStatuses, service);
      // We can stop loading now because we know we have the results for both services
      this.loading = false;
    });
  }

  public showGoogleStatus() {
    return !this.loading && this.googleActive;
  }

  /* @ngInject */
  public constructor(
    private $q: ng.IQService,
    private $modal,
    private Authinfo,
    private CloudConnectorService,
    private FusionClusterStatesService,
  ) {
    super({
      active: false,
      cardClass: 'calendar',
      cardType: CardType.hybrid,
      description: 'servicesOverview.cards.hybridCalendar.description',
      name: 'servicesOverview.cards.hybridCalendar.title',
      template: 'modules/services-overview/hybridAndGoogleCalendarCard.tpl.html',
    });
  }
}
