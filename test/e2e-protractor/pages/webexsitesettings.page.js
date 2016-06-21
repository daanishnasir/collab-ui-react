'use strict';

var SiteSettigsPage = function () {
  this.testInfo = {
    describeCount: 0,
    testType: null,
    describeText: null
  };

  this.conferencing = element(by.css('a[href="#site-list"]'));
  this.configureSite = element(by.css('a[href="#/webexSiteSettings"]'));
  this.siteSettingsUrl = '/site_settings';
  this.siteSettingPanel = element(by.id('siteSetting'));
  this.emailAllHostsBtn = element(by.id('emailAllHostsBtn'));
  this.siteInformationLink = element(by.id('SiteInfo_site_info'));
  this.siteFeaturesLink = element(by.id('SiteInfo_site_features'));
  this.configureCommonUserPrivLink = element(by.id('CommonSettings_user_priv'));
  this.configureCommonSiteOptionsLink = element(by.id('CommonSettings_common_options'));
  this.configureCommonSessionTypesLink = element(by.id('CommonSettings_session_type'));
  this.configureCommonSecurityLink = element(by.id('CommonSettings_security'));
  this.configureCommonSchedulerLink = element(by.id('CommonSettings_scheduler'));
  this.configureCommonProductivityToolsLink = element(by.id('CommonSettings_productivity'));
  this.configureCommonNavigationLink = element(by.id('CommonSettings_navigation'));
  this.configureCommonMobileLink = element(by.id('CommonSettings_mobile'));
  this.configureCommonEmailTemplateLink = element(by.id('CommonSettings_email_template'));
  this.configureCommonDisclaimersLink = element(by.id('CommonSettings_disclaimer'));
  this.configureCommonCompanyAddressesLink = element(by.id('CommonSettings_address'));
  this.configureCommonCMRLink = element(by.id('CommonSettings_cmr'));
  this.configureCommonSiteInformationLink = element(by.id('CommonSettings_site_info'));
  this.configureCommonPartnerAuthLink = element(by.id('CommonSettings_pda_settings'));

  this.iFramePage = element(by.id('webexIframeContainer'));
  this.siteSettingsPanel = element(by.id('webexSiteSettings'));
  this.siteInfoCardId = element(by.id('SiteInfo-card'));
  this.emaillAllHostsId = element(by.id('EMAIL_send_email_to_all'));
  this.siteInformationId = element(by.id('SiteInfo_site_info'));
  this.siteFeaturesId = element(by.id('SiteInfo_site_features'));
  this.commonSettingsCardId = element(by.id('CommonSettings-card'));
  this.commonUserPrivId = element(by.id('CommonSettings_user_priv'));
  this.commonSiteOptionsId = element(by.id('CommonSettings_common_options'));
  this.commonSessionTypesId = element(by.id('CommonSettings_session_type'));
  this.commonSecurityId = element(by.id('CommonSettings_security'));
  this.commonSchedulerId = element(by.id('CommonSettings_scheduler'));
  this.commonProductivityToolsId = element(by.id('CommonSettings_productivity'));
  this.commonNavigationId = element(by.id('CommonSettings_navigation'));
  this.commonMobileId = element(by.id('CommonSettings_mobile'));
  this.commonSiteInformationId = element(by.id('CommonSettings_site_info'));
  this.commonPartnerAuthId = element(by.id('CommonSettings_pda_settings'));
  this.emaillTemplateId = element(by.id('CommonSettings_email_template'));
  this.disclaimersId = element(by.id('CommonSettings_disclaimer'));
  this.companyAddressesId = element(by.id('CommonSettings_address'));
  this.cmrId = element(by.id('CommonSettings_cmr'));
  this.siteSettingsBreadCrumbs = element(by.id('siteSettingsBreadCrumbs'));
  this.siteSettingBreadCrumbs = element(by.id('siteSettingBreadCrumbs'));
  this.siteListCrumb = element(by.id('siteListCrumb'));
  this.siteSettingsCrumb = element(by.id('siteSettingsCrumb'));
  this.xLaunchSiteSettingsT30CITEST = element(by.id('t30citest.webex.com_xlaunch-webex-site-settings'));
  this.xLaunchSiteReportsT30CITEST = element(by.id('t30citest.webex.com_xlaunch-webex-site-reports'));
};

module.exports = SiteSettigsPage;
