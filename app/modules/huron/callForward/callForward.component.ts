import { CallForward, CallForwardAll, CallForwardBusy } from './callForward';

interface ITranslationMessages {
  placeholderText: string;
  helpText: string;
}
interface IForwardDestination {
  destination: any;
  voicemail: boolean;
}
const callForwardInputs = ['external', 'uri', 'custom'];
const MIN_SECONDS = 1;
const MAX_SECONDS = 300;
class CallForwardCtrl implements ng.IComponentController {
  public static ALL: string = 'all';
  public static BUSY: string = 'busy';
  public static NONE: string = 'none';

  public forwardState: string;
  public forwardExternalCallsDifferently: boolean = false;
  public forwardOptions: string[] = [];
  public userVoicemailEnabled: boolean;
  public ownerType: string;
  public callForward: CallForward;
  public onChangeFn: Function;
  public customTranslations: ITranslationMessages;

  public forwardAll: IForwardDestination;
  public busyInternal: IForwardDestination;
  public busyExternal: IForwardDestination;
  public callForwardTimer: number = 25;
  public isError: boolean = false;
  public errorMsg: {};

 /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {
    this.customTranslations = {
      placeholderText: this.$translate.instant('callDestination.alternateCustomPlaceholder'),
      helpText: this.$translate.instant('callDestination.alternateCustomHelpText'),
    };
    this.forwardOptions = callForwardInputs;
    this.errorMsg = {
      min: this.$translate.instant('callForwardPanel.ringDurationTimer.validation.error'),
      max: this.$translate.instant('callForwardPanel.ringDurationTimer.validation.error'),
    };
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    const { callForward } = changes;

    if (callForward && callForward.currentValue) {
      this.processForwardOptionsChange(callForward);
      this.processCallForwardChanges(callForward);
    }
  }

  private processForwardOptionsChange(callForwardChanges: ng.IChangesObject) {
    let all = callForwardChanges.currentValue.callForwardAll;
    if (all.destination) {
      this.addForwardOption(all.destination);
    }
    let busy = callForwardChanges.currentValue.callForwardBusy;
    if (busy.internalDestination) {
      this.addForwardOption(busy.internalDestination);
    }

    if (busy.externalDestination) {
      this.addForwardOption(busy.externalDestination);
    }
  }

  private processCallForwardChanges(callForwardChanges: ng.IChangesObject) {
    let forward: any = callForwardChanges.currentValue.callForwardAll;
    let number: string = forward.destination;
    let all = {
      destination: number,
      voicemail: forward.voicemailEnabled,
    };
    forward = callForwardChanges.currentValue.callForwardBusy;
    number = forward.internalDestination;

    let internal = {
      destination: number,
      voicemail: forward.internalVoicemailEnabled,
    };
    forward = callForwardChanges.currentValue.callForwardBusy;
    number = forward.externalDestination;

    let external = {
      destination: number,
      voicemail: forward.externalVoicemailEnabled,
    };
    this.forwardAll = all;
    this.busyInternal = internal;
    this.busyExternal = external;

    this.forwardState = (all.destination || all.voicemail) ? CallForwardCtrl.ALL : ((internal.destination || internal.voicemail) ?  CallForwardCtrl.BUSY : this.forwardState = CallForwardCtrl.NONE);

    this.forwardExternalCallsDifferently = (( external.destination || external.voicemail ) && !_.isEqual(internal, external) );
    this.callForwardTimer = _.get<number>(callForwardChanges, 'currentValue.callForwardBusy.ringDurationTimer');
  }

  private addForwardOption(value: string): void {
    if (!_.includes(this.forwardOptions, value)) {
      this.forwardOptions.push(value);
    }
  }

  public onCallFwdNoneChange(): void {
    this.change(new CallForward());
  }

  public showVoicemail(): boolean {
    return this.ownerType !== 'place' && this.userVoicemailEnabled ;
  }

  public onCallFwdAllChange(destination: any): void {
    let callForwardAll: CallForwardAll = new CallForwardAll();
    callForwardAll.destination = destination || null;
    this.callForward.callForwardAll = callForwardAll;
    this.callForward.callForwardBusy = new CallForwardBusy();
    this.change(this.callForward);
  }

  public onVoicemailAll(): void {
    let callForwardAll: CallForwardAll = new CallForwardAll();
    callForwardAll.voicemailEnabled = this.forwardAll.voicemail;
    this.callForward.callForwardAll = callForwardAll;
    this.callForward.callForwardBusy = new CallForwardBusy();
    this.change(this.callForward);
  }

  public onCallFwdBusyChange(destination: any): void {
    let callForwardBusy: CallForwardBusy = _.cloneDeep(this.callForward.callForwardBusy);
    callForwardBusy.internalDestination = destination || null;
    this.callForward.callForwardAll = new CallForwardAll();
    this.callForward.callForwardBusy = callForwardBusy;
    this.change(this.callForward);
  }

  public onVoicemailBusy(): void {
    let callForwardBusy: CallForwardBusy =  _.cloneDeep(this.callForward.callForwardBusy);
    callForwardBusy.internalVoicemailEnabled = this.busyInternal.voicemail;
    if (callForwardBusy.internalVoicemailEnabled) {
      callForwardBusy.internalDestination = null;
    }
    this.callForward.callForwardAll = new CallForwardAll();
    this.callForward.callForwardBusy = callForwardBusy;
    this.change(this.callForward);
  }

  public onCallFwdBusyExternalChange(destination: any): void {
    let callForwardBusy: CallForwardBusy = _.cloneDeep(this.callForward.callForwardBusy);
    if (this.forwardExternalCallsDifferently) {
      callForwardBusy.externalDestination = destination || null;
    }
    this.callForward.callForwardAll = new CallForwardAll();
    this.callForward.callForwardBusy = callForwardBusy;
    this.change(this.callForward);
  }

  public onVoicemailBusyExternal(): void {
    let callForwardBusy: CallForwardBusy = _.cloneDeep(this.callForward.callForwardBusy);
    callForwardBusy.externalVoicemailEnabled = this.busyExternal.voicemail;
    if (callForwardBusy.externalVoicemailEnabled) {
      callForwardBusy.externalDestination = null;
    }
    this.callForward.callForwardAll = new CallForwardAll();
    this.callForward.callForwardBusy = callForwardBusy;
    this.change(this.callForward);
  }

  public onCallForwardBusyDifferentlyChange(): void {
    let callForwardBusy: CallForwardBusy = _.cloneDeep(this.callForward.callForwardBusy);
    if (!this.forwardExternalCallsDifferently) {
      callForwardBusy.externalDestination = callForwardBusy.internalDestination;
      callForwardBusy.externalVoicemailEnabled = callForwardBusy.internalVoicemailEnabled;
      this.callForward.callForwardBusy = callForwardBusy;
      this.change(this.callForward);
    }
  }

  private setCallForwardBusyExternal(callForwardBusy): void {
    if (!this.forwardExternalCallsDifferently) {
      callForwardBusy.externalDestination = callForwardBusy.internalDestination;
      callForwardBusy.externalVoicemailEnabled = callForwardBusy.internalVoicemailEnabled;
    }
  }

  private change(callForward: CallForward): void {
    this.setCallForwardBusyExternal(callForward.callForwardBusy);
    this.onChangeFn({
      callForward: callForward,
    });
  }

  public onCFNATimerChange(): void {
    if (this.validateCallForwardTimer()) {
      this.isError = false;
    } else {
      this.isError = true;
    }

    let callForwardBusy: CallForwardBusy = _.cloneDeep(this.callForward.callForwardBusy);
    callForwardBusy.ringDurationTimer = this.callForwardTimer;
    this.callForward.callForwardAll = new CallForwardAll();
    this.callForward.callForwardBusy = callForwardBusy;
    this.change(this.callForward);
  }

  private validateCallForwardTimer(): boolean {
    return _.inRange(this.callForwardTimer, MIN_SECONDS, MAX_SECONDS + 1);
  }
}

export class CallForwardComponent implements ng.IComponentOptions {
  public controller = CallForwardCtrl;
  public templateUrl = 'modules/huron/callForward/callForward.html';
  public bindings = {
    userVoicemailEnabled: '<',
    ownerType: '<',
    callForward: '<',
    onChangeFn: '&',
  };
}
