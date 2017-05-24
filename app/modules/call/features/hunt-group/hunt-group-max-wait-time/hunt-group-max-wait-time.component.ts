class HuntGroupMaxWaitTimeCtrl implements ng.IComponentController {
  public maxWaitMins: string;
  public onChangeFn: Function;
  public options: Array<number> = [1, 2, 3];

  public onMaxWaitMinsChange(minutes: number): void {
    this.onChangeFn({
      minutes: minutes,
    });
  }
}

export class HuntGroupMaxWaitTimeComponent implements ng.IComponentOptions {
  public controller = HuntGroupMaxWaitTimeCtrl;
  public templateUrl = 'modules/call/features/hunt-group/hunt-group-max-wait-time/hunt-group-max-wait-time.component.html';
  public bindings = {
    maxWaitMins: '<',
    onChangeFn: '&',
  };
}