import { LocationsService } from 'modules/call/locations/shared';
// import { Notification } from 'modules/core/notifications';

class UserLocationDetailsCtrl implements ng.IComponentController {
  public locationName: string;
  public userId: string;
  public selectedLocation: string;
  public locationOptions: string[] = [];
  public location: string;
  public locationPlaceholder: string;
  private form: ng.IFormController;
  public saveInProcess: boolean;
  public uuid: string;

  /* @ngInject */
  constructor(
    public LocationsService: LocationsService,
    // private Notification: Notification,
  ) { }

  public $onInit(): void {
    this.getDetails();
  }

  public getDetails(): void {
    this.loadLocations();
    this.getUserLocation();
  }

  public loadLocations(): void {
    this.LocationsService.getLocationList().then(result => {
      this.locationOptions = [];
      const tempThis = this;
      _.forEach(result, function (result) {
        tempThis.locationOptions.push(result.name);
      });
    });
  }

  public getUserLocation(): void {
    this.LocationsService.getUserLocation(this.userId).then(result => {
      this.selectedLocation = result.name;
    });
  }

  public reset(): void {
    this.getDetails();
    this.form.$setPristine();
    this.form.$setUntouched();
  }

  public onlocationChanged(): void {
    this.location = this.selectedLocation;
  }

  public onLocationSelect(): void {
    this.location = this.selectedLocation;
  }

  public save(): void {
    // this.saveInProcess = true;
    // this.LocationsService.updateLocation(this.uuid, {
    //   name: this.locationName,
    // })
    // .catch(error => this.Notification.errorResponse(error))
    // .finally( () => {
    //   this.saveInProcess = false;
    //   this.reset();
    //});
  }
}

export class UserLocationDetailsComponent implements ng.IComponentOptions {
  public controller = UserLocationDetailsCtrl;
  public templateUrl = 'modules/call/locations/locations-user-details/locations-user-details.component.html';
  public bindings = {
    location: '<',
    locationOptions: '<',
    userId: '<',
  };
}