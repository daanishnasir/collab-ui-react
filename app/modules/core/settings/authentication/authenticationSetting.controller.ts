export class AuthenticationSettingController {

  public ssoStatusLoaded = false;
  public ssoEnabled: boolean = false;
  public ssoStatus: string;
  public ssoStatusText: string;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private Orgservice,
  ) {
    const params = {
      basicInfo: true,
    };
    this.Orgservice.getAdminOrg(this.getAdminOrgHandler.bind(this), null, params);
  }

  private getAdminOrgHandler(data: { success: boolean, ssoEnabled: boolean }) {
    if (data.success) {
      this.setSSOStatus(data.ssoEnabled || false);
    }
  }

  private setSSOStatus(ssoEnabled: boolean) {
    this.ssoEnabled = ssoEnabled;
    this.ssoStatus = ssoEnabled ? 'success' : 'disabled';
    this.ssoStatusLoaded = true;
    this.ssoStatusText = `ssoModal.${this.ssoEnabled ? 'ssoEnabledStatus' : 'ssoNotEnabledStatus'}`;
  }

  public modifySSO() {
    this.$state.go('setupwizardmodal', {
      currentTab: 'enterpriseSettings',
      currentStep: 'init',
      onlyShowSingleTab: true,
      showStandardModal: true,
    });
  }
}
