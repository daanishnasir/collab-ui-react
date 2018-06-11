import { BsftSettings } from './bsft-settings';
import { BsftCustomerService } from './bsft-customer.service';
import { Notification } from 'modules/core/notifications';
import { PstnModel } from 'modules/huron/pstn';

export class BsftSettingsData {
  public bsftSettings: BsftSettings;
}

export class BsftSettingsService {
  private errors: string[] = [];

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private BsftCustomerService: BsftCustomerService,
    private Notification: Notification,
    private PstnModel: PstnModel,
  ) {}

  public get(customerId?: string | undefined) {
    return this.getBsftSettingsData(customerId);
  }

  public save(bsftSettings: BsftSettings): IPromise<void> {
    this.PstnModel.setBsftCustomer(bsftSettings);
    return this.$q.resolve();
  }

  private getBsftSettingsData(customerId) {
    this.errors = [];
    const bsftSettingsData = new BsftSettingsData();
    return this.$q.all({
      bsftSettings: this.getBsftCustomer(customerId).then(bsftSettings => bsftSettingsData.bsftSettings = bsftSettings),
    });
  }

  private getBsftCustomer(customerId: string) {
    if (customerId) {
      return this.BsftCustomerService.getBsftCustomer(customerId)
        .catch(error => {
          this.errors.push(this.Notification.processErrorResponse(error));
          return this.$q.reject();
        });
    } else {
      return this.$q.resolve(new BsftSettings());
    }
  }
}
