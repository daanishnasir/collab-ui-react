import { CmcUserData } from './cmcUserData';
import { CmcService } from './cmc.service';
import { ICmcUser } from './cmcUser.interface';

class CmcUserDetailsSettingsController implements ng.IComponentController {

  private user: ICmcUser;
  public entitled: boolean = false;
  public validDataChange: boolean = false;
  public mobileNumber: string;
  public invalid: boolean = false;
  public invalidMessage: string | null;
  public messages = {
    pattern: 'Invalid Mobile Number',
  };
  private oldCmcUserData: CmcUserData;

  /* @ngInject */
  constructor(private $log: ng.ILogService,
              private $translate: ng.translate.ITranslateService,
              private CmcService: CmcService) {
    this.$log.debug('CmcUserDetailsSettingsController');
  }

  public $onInit() {
    this.$log.debug('$onInit');
    this.extractCmcData();
    this.oldCmcUserData = new CmcUserData(this.mobileNumber, this.entitled);
    this.$log.warn('Current user:', this.user);
  }

  private extractCmcData() {
    let persistedCmcData: CmcUserData = this.CmcService.getData(this.user);
    this.entitled = persistedCmcData.entitled;
    this.mobileNumber = persistedCmcData.mobileNumber;
  }

  //TODO: Not supposed to happen.
  //      Are we sure that we handle things correctly when user changes
  //      while we're in the cmc settings page for the user.
  //      For example in the middle of a save dialog...
  // public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
  //   let userChanges = changes['user'];
  //   this.$log.warn('user changed unexpectedly:', userChanges);
  //   if (userChanges) {
  //     if (userChanges.currentValue) {
  //       this.user = <ICmcUser>userChanges.currentValue;
  //       this.extractCmcData();
  //     }
  //   }
  // }

  public save(): void {
    let newData = new CmcUserData(this.mobileNumber, this.entitled);
    this.$log.warn('trying to set data', newData, ', id=', this.user.id);
    this.CmcService.setData(this.user, newData);

    this.oldCmcUserData.entitled = this.entitled;
    this.oldCmcUserData.mobileNumber = this.mobileNumber;
    this.validDataChange = false;
  }

  public cancel(): void {
    this.entitled = this.oldCmcUserData.entitled;
    this.mobileNumber = this.oldCmcUserData.mobileNumber;
    this.validDataChange = false;
  }

  public dataChanged() {
    let valid: boolean = this.validate();
    this.$log.debug('invalid', !valid, this.mobileChanged(), this.enableChanged());
    this.invalid = !valid && (this.mobileChanged() || this.enableChanged());
    this.validDataChange = valid;
    this.invalidMessage = this.getInvalidMessage();
  }

  public entitle(toggleValue) {
    this.entitled = toggleValue;
    let valid: boolean = this.validate();
    this.$log.debug('invalid', !valid, this.mobileChanged(), this.enableChanged());
    this.invalid = !valid && (this.mobileChanged() || this.enableChanged());
    this.validDataChange = valid;
    this.invalidMessage = this.getInvalidMessage();
  }

  private mobileChanged(): boolean {
    return (this.mobileNumber !== this.oldCmcUserData.mobileNumber);
  }

  private enableChanged(): boolean {
    return (this.entitled !== this.oldCmcUserData.entitled);
  }

  private isE164(): boolean {
    const e164Regex: RegExp = /^\+(?:[0-9]?){6,14}[0-9]$/;
    return e164Regex.test(this.mobileNumber);
  }

  private validate(): boolean {
    let check1: boolean = (!_.isNil(this.mobileNumber) && this.mobileNumber.length === 0) && !this.entitled && (this.mobileChanged() || this.enableChanged());
    let check2: boolean = !_.isNil(this.mobileNumber) && this.isE164() && (this.mobileChanged() || this.enableChanged());
    let check3: boolean = !_.isNil(this.mobileNumber) && this.isE164() && this.mobileChanged() && !this.entitled;
    return check1 || check2 || check3;
  }

  private getInvalidMessage(): string | null {
    if (this.invalid) {
      if (this.entitled && (_.isNil(this.mobileNumber) || this.mobileNumber.length === 0)) {
        // return 'Always provide valid mobile number when enabling';
        return this.$translate.instant('cmc.details.invalidInput');
      }
    }
    return null;
  }
}

export class CmcUserDetailsSettingsComponent implements ng.IComponentOptions {
  public controller = CmcUserDetailsSettingsController;
  public templateUrl = 'modules/cmc/user-details-settings.component.html';
  public bindings = {
    user: '<',
  };
}
