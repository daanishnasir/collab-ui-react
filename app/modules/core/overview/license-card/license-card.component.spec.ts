import testModule from './index';
import { OverviewEvent } from 'modules/core/overview/overview.keys';
import { HealthStatusID } from 'modules/core/health-monitor';

describe('Component: licenseCard', () => {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies(
      '$q',
      '$rootScope',
      '$scope',
      'LicenseCardHelperService',
      'UrlConfig',
    );

    const data = _.cloneDeep(getJSONFixture('core/json/myCompany/subscriptionData.json'));
    this.subscriptions = data.subscriptionsResponse;

    this.$scope.l10nTitle = 'translate.title';
    this.$scope.l10nDefaultMessage = 'translate.noLicenses';
    this.$scope.l10nLicenseDescription = 'translate.userLicenses';
    this.$scope.headerClass = 'license-type-icon';
    this.$scope.licenseTypes = ['CONFERENCING'];
    this.$scope.loading = false;
    this.$scope.settingsUrlObject = {
      requireSites: true,
      url: '/site-list',
    };
    this.$scope.statusId = HealthStatusID.SparkCall;
  });

  function initComponent(): void {
    this.compileComponent('licenseCard', {
      l10nTitle: this.$scope.l10nTitle,
      l10nDefaultMessage: this.$scope.l10nDefaultMessage,
      l10nLicenseDescription: this.$scope.l10nLicenseDescription,
      headerClass: this.$scope.headerClass,
      licenseTypes: 'licenseTypes',
      loading: 'loading',
      settingsUrlObject: 'settingsUrlObject',
      statusId: this.$scope.statusId,
    });
  }

  describe('View:', function () {
    // HTML locators
    const DEFAULT_MESSAGE = '.disabled-section span';
    const FOOTER_MESSAGE = '.disabled-footer p';
    const OVERVIEW_INFO = '.overview-info div';
    const SETTINGS_LINK = '.footer-icons a';
    const SPINNER = '.disabled-section.spinner-section';
    const STATUS_INDICATOR = 'cs-statusindicator';

    it('should show spinner when loading', function () {
      this.$scope.loading = true;
      initComponent.call(this);
      expect(this.view).toContainElement(SPINNER);
      expect(this.view).not.toContainElement(STATUS_INDICATOR);
      expect(this.view).not.toContainElement(SETTINGS_LINK);
    });

    it('should display the default message when there are no licenses', function () {
      initComponent.call(this);
      expect(this.view).not.toContainElement(SPINNER);
      expect(this.view.find(DEFAULT_MESSAGE).html()).toEqual(this.$scope.l10nDefaultMessage);
      expect(this.view.find(FOOTER_MESSAGE).html()).toEqual('overview.contactPartner');
      expect(this.view).not.toContainElement(STATUS_INDICATOR);
      expect(this.view).not.toContainElement(SETTINGS_LINK);
    });

    it('should display license data and health information after broadcasts', function () {
      initComponent.call(this);
      this.$rootScope.$emit(OverviewEvent.SUBSCRIPTIONS_LOADED_EVENT, this.subscriptions);
      this.$rootScope.$emit(OverviewEvent.HEALTH_STATUS_LOADED_EVENT, {
        components: [{
          id: HealthStatusID.SparkCall,
          status: 'operational',
        }],
      });
      this.$scope.$apply();

      expect(this.view.find(OVERVIEW_INFO).first().find('a').html()).toEqual(' 600 ');
      expect(this.view.find(OVERVIEW_INFO).last().html()).toEqual(this.$scope.l10nLicenseDescription);
      expect(this.view).toContainElement(STATUS_INDICATOR);
      expect(this.view).toContainElement(SETTINGS_LINK);
    });
  });
});