class HybridServicesSidepanelErrorMessageCtrl implements ng.IComponentController {

  private translationKey: string;
  public localizedErrorMessage: string;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) { }

  public $onInit() {
    this.localizedErrorMessage = this.$translate.instant(this.translationKey);
  }

}

export class HybridServicesSidepanelErrorMessageComponent implements ng.IComponentOptions {
  public controller = HybridServicesSidepanelErrorMessageCtrl;
  public template = `<div class="error-message">
        <i class="icon icon-error"></i>
        <p class="message">{{:: $ctrl.localizedErrorMessage }}</p>
      </div>`;
  public bindings = {
    translationKey: '<',
  };
}