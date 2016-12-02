import { ServicesOverviewHybridAndGoogleCalendarCard } from './hybridAndGoogleCalendarCard';

describe('ServicesOverviewHybridCallCard', () => {

  let $q, $rootScope, Authinfo, CloudConnectorService, FusionClusterStatesService;
  let card: ServicesOverviewHybridAndGoogleCalendarCard;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies(_$q_, _$rootScope_, _Authinfo_, _CloudConnectorService_, _FusionClusterStatesService_) {
    $q = _$q_;
    $rootScope = _$rootScope_;
    Authinfo = _Authinfo_;
    CloudConnectorService = _CloudConnectorService_;
    FusionClusterStatesService = _FusionClusterStatesService_;
  }

  function initSpies() {
    spyOn(Authinfo, 'isFusionCal');
    spyOn(Authinfo, 'isFusionGoogleCal');
    spyOn(CloudConnectorService, 'isServiceSetup').and.returnValue($q.resolve(true));
  }

  it('should have sane defaults', () => {
    card = new ServicesOverviewHybridAndGoogleCalendarCard($q, Authinfo, CloudConnectorService, FusionClusterStatesService);
    expect(card.active).toBe(false);
    expect(card.googleActive).toBe(false);
    expect(card.loading).toBe(true);
  });

  // Note: currently we have no cards if the user has only the google calendar entitlement
  it('should not be displayed if the user does not have the hybrid cal entitlement but has the hybrid google cal entitlement and the feature toggle', () => {
    Authinfo.isFusionCal.and.returnValue(false);
    Authinfo.isFusionGoogleCal.and.returnValue(true);
    card = new ServicesOverviewHybridAndGoogleCalendarCard($q, Authinfo, CloudConnectorService, FusionClusterStatesService);
    card.googleCalendarFeatureToggleEventHandler(true);
    $rootScope.$apply();
    expect(card.display).toBe(false);
  });

  it('should be displayed if the user has the hybrid cal entitlement, the hybrid google cal entitlement and the feature toggle', () => {
    Authinfo.isFusionCal.and.returnValue(true);
    Authinfo.isFusionGoogleCal.and.returnValue(true);
    card = new ServicesOverviewHybridAndGoogleCalendarCard($q, Authinfo, CloudConnectorService, FusionClusterStatesService);
    card.googleCalendarFeatureToggleEventHandler(true);
    $rootScope.$apply();
    expect(card.display).toBe(true);
  });

  // scenario that should never happen but could technically happen though
  it('should not be displayed if the user does not have the hybrid cal entitlement but has the hybrid google cal entitlement and not the feature toggle', () => {
    Authinfo.isFusionCal.and.returnValue(false);
    Authinfo.isFusionGoogleCal.and.returnValue(true);
    card = new ServicesOverviewHybridAndGoogleCalendarCard($q, Authinfo, CloudConnectorService, FusionClusterStatesService);
    card.googleCalendarFeatureToggleEventHandler(false);
    $rootScope.$apply();
    expect(card.display).toBe(false);
  });

  it('should not be displayed if the user has the hybrid cal entitlement but not the hybrid google cal entitlement and not the feature toggle', () => {
    Authinfo.isFusionCal.and.returnValue(true);
    Authinfo.isFusionGoogleCal.and.returnValue(false);
    card = new ServicesOverviewHybridAndGoogleCalendarCard($q, Authinfo, CloudConnectorService, FusionClusterStatesService);
    card.googleCalendarFeatureToggleEventHandler(false);
    $rootScope.$apply();
    expect(card.display).toBe(false);
  });

  it('should stay not active if services statuses do not say hybrid calendar is setup', () => {
    Authinfo.isFusionCal.and.returnValue(true);
    Authinfo.isFusionGoogleCal.and.returnValue(true);
    card = new ServicesOverviewHybridAndGoogleCalendarCard($q, Authinfo, CloudConnectorService, FusionClusterStatesService);
    card.hybridStatusEventHandler([{ serviceId: 'squared-fusion-cal', setup: false, status: 'yolo' }]);
    card.googleCalendarFeatureToggleEventHandler(true);
    $rootScope.$apply();
    expect(card.active).toBe(false);
  });

  it('should be active if services statuses say hybrid calendar is setup', () => {
    Authinfo.isFusionCal.and.returnValue(true);
    Authinfo.isFusionGoogleCal.and.returnValue(true);
    card = new ServicesOverviewHybridAndGoogleCalendarCard($q, Authinfo, CloudConnectorService, FusionClusterStatesService);
    card.hybridStatusEventHandler([{ serviceId: 'squared-fusion-cal', setup: true, status: 'yolo' }]);
    card.googleCalendarFeatureToggleEventHandler(true);
    $rootScope.$apply();
    expect(card.active).toBe(true);
  });

  it('should stay not googleActive if CloudConnectorService says service not setup', () => {
    Authinfo.isFusionCal.and.returnValue(true);
    Authinfo.isFusionGoogleCal.and.returnValue(true);
    CloudConnectorService.isServiceSetup.and.returnValue($q.resolve(false));
    card = new ServicesOverviewHybridAndGoogleCalendarCard($q, Authinfo, CloudConnectorService, FusionClusterStatesService);
    card.hybridStatusEventHandler([]);
    card.googleCalendarFeatureToggleEventHandler(true);
    $rootScope.$apply();
    expect(card.googleActive).toBe(false);
  });

  it('should be googleActive if CloudConnectorService says service setup', () => {
    Authinfo.isFusionCal.and.returnValue(true);
    Authinfo.isFusionGoogleCal.and.returnValue(true);
    CloudConnectorService.isServiceSetup.and.returnValue($q.resolve(true));
    card = new ServicesOverviewHybridAndGoogleCalendarCard($q, Authinfo, CloudConnectorService, FusionClusterStatesService);
    card.hybridStatusEventHandler([]);
    card.googleCalendarFeatureToggleEventHandler(true);
    $rootScope.$apply();
    expect(card.googleActive).toBe(true);
  });

  it('should stop loading once it received the hybrid statuses event AND the feature toggle event', () => {
    Authinfo.isFusionCal.and.returnValue(true);
    Authinfo.isFusionGoogleCal.and.returnValue(true);
    card = new ServicesOverviewHybridAndGoogleCalendarCard($q, Authinfo, CloudConnectorService, FusionClusterStatesService);
    card.hybridStatusEventHandler([]);
    card.googleCalendarFeatureToggleEventHandler(true);
    $rootScope.$apply();
    expect(card.loading).toBe(false);
  });
});