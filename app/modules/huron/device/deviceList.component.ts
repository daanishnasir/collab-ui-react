import './_hn-devices.scss';

import { IActionItem } from '../../core/components/sectionTitle/sectionTitle.component';

class DeviceList implements ng.IComponentController {
  public ownerType: string;
  public deviceList: any;
  public devicesLoaded: ng.IPromise<any>;
  public multipleOtp: boolean;
  public onGenerateFn: Function;
  public onShowDeviceDetailFn: Function;
  public actionList: Array<IActionItem>;
  public showActions: boolean = false;
  public showGenerateButton: boolean = false;
  public generateCodeText: string;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  public $onInit(): void {
    if (this.ownerType === 'place') {
      this.generateCodeText = this.$translate.instant('usersPreview.generateActivationCodeTextPlace');
    } else {
      this.generateCodeText = this.$translate.instant('usersPreview.generateActivationCodeText');
    }

    this.initActions();
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    const { deviceList } = changes;
    if (this.devicesLoaded) {
      this.devicesLoaded.then(() => {
        this.showGenerateButton = _.size(Object.keys(deviceList.currentValue)) === 0;
        this.showActions = this.multipleOtp && !this.showGenerateButton;
      });
    } else {
      this.showGenerateButton = _.size(Object.keys(deviceList.currentValue)) === 0;
      this.showActions = this.multipleOtp && !this.showGenerateButton;
    }
  }

  public onGenerateCode(): void {
    this.onGenerateFn();
  }

  public onShowDeviceDetail(device): void {
    this.onShowDeviceDetailFn({
      device: device,
    });
  }

  private initActions(): void {
    this.actionList = [{
      actionKey: 'usersPreview.generateActivationCode',
      actionFunction: () => {
        this.onGenerateCode();
      },
    }];
  }
}

export class DeviceListComponent implements ng.IComponentOptions {
  public controller = DeviceList;
  public templateUrl = 'modules/huron/device/deviceList.html';
  public bindings = <{ [binding: string]: string }>{
    ownerType: '@',
    deviceList: '<',
    devicesLoaded: '<',
    multipleOtp: '<',
    onGenerateFn: '&',
    onShowDeviceDetailFn: '&',
  };
}
