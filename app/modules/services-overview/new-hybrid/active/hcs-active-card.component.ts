import { HcsSetupModalService, HcsSetupModalSelect } from 'modules/hcs/hcs-shared/';
class HcsActiveCardController implements ng.IComponentController {
  public loading = false;
  public canSetup = true; //false only if both services up

  /* @ngInject */
  constructor(
    private HcsSetupModalService: HcsSetupModalService,
  ) {
  }

  public openSetUp(): void {
    this.HcsSetupModalService.openSetupModal(true, HcsSetupModalSelect.FirstTimeSetup);
  }
}
export class HcsActiveCardComponent implements ng.IComponentOptions {
  public controller = HcsActiveCardController;
  public template = `
    <article>
      <div class="cs-card">
        <h4 translate="hcs.cardTitle"></h4>
      </div>
      <div class="active-card_content active-card-center_content">
        <div class="active-card_section">
          <div class="active-card_action"><a ui-sref="hcs.shared.inventoryList" translate="hcs.inventory.title"></a></div>
        </div>
        <div class="active-card_section">
          <div class="active-card_action"><a ui-sref="hcs.shared.installFiles" translate="hcs.agentInstallFiles"></a></div>
        </div>
      </div>
    </article>
  `;
  public bindings = {
    serviceStatus: '<',
  };
}