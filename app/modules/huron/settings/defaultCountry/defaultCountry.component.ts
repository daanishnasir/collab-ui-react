import { IOption } from 'modules/huron/dialing/dialing.service';

class HuronDefaultCountryCtrl implements ng.IComponentController {
  public defaultCountry: string;
  public selected: IOption;
  public defaultCountryOptions: Array<IOption>;
  public onChangeFn: Function;

  /* @ngInject */
  constructor() {}

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    const { defaultCountry } = changes;
    if (defaultCountry && defaultCountry.currentValue) {
      this.selected = _.find(this.defaultCountryOptions, { value: this.defaultCountry });
    }
  }

  public onDefaultCountryChanged(): void {
    this.onChangeFn({
      defaultCountry: _.get(this.selected, 'value'),
    });
  }
}

export class HuronDefaultCountryComponent implements ng.IComponentOptions {
  public controller = HuronDefaultCountryCtrl;
  public templateUrl = 'modules/huron/settings/defaultCountry/defaultCountry.html';
  public bindings = {
    defaultCountry: '<',
    defaultCountryOptions: '<',
    onChangeFn: '&',
  };
}