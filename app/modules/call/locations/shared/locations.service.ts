import { IRLocation, Location, IRLocationListItem, LocationListItem, IRLocationInternalNumberPoolList, LocationInternalNumberPoolList } from './location';

interface ILocationResource extends ng.resource.IResourceClass<ng.resource.IResource<IRLocationListItem>> {}

interface IUserLocationDetailResource extends ng.resource.IResourceClass<ng.resource.IResource<IRLocation>> {}

interface IUserMoveLocationResource extends ng.resource.IResourceClass<ng.resource.IResource<IRLocation>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

interface ILocationDetailResource extends ng.resource.IResourceClass<ng.resource.IResource<IRLocation>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

interface ILocationInternalNumberPoolResource extends ng.resource.IResourceClass<IRLocationInternalNumberPoolList & ng.resource.IResource<IRLocationInternalNumberPoolList>> {}

export class LocationsService {
  private locationListResource: ILocationResource;
  private userLocationDetailResource: IUserLocationDetailResource;
  private userMoveLocationResource: IUserMoveLocationResource;
  private locationDetailResource: ILocationDetailResource;
  private locationInternalNumberPoolResource: ILocationInternalNumberPoolResource;
  private defaultLocation: LocationListItem | undefined = undefined;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $resource: ng.resource.IResourceService,
    private HuronConfig,
    private Authinfo,
  ) {

    const updateAction: ng.resource.IActionDescriptor = {
      method: 'PUT',
    };

    const saveAction: ng.resource.IActionDescriptor = {
      method: 'POST',
      headers: {
        'Access-Control-Expose-Headers': 'Location',
      },
    };

    this.locationListResource = <ILocationResource>this.$resource(`${this.HuronConfig.getCmiV2Url()}/customers/:customerId/locations`, {},
      {
        save: saveAction,
      });
    this.locationInternalNumberPoolResource = this.$resource(`${this.HuronConfig.getCmiUrl()}/voice/customers/:customerId/locations/:locationId/internalnumberpools`, {}, {}) as ILocationInternalNumberPoolResource;
    this.userMoveLocationResource = <IUserMoveLocationResource>this.$resource(`${this.HuronConfig.getCmiV2Url()}/customers/:customerId/users/:userId/move/locations`, {},
      {
        update: updateAction,
      });
    this.userLocationDetailResource = <IUserLocationDetailResource>this.$resource(`${this.HuronConfig.getCmiV2Url()}/customers/:customerId/users/:userId`, {}, {});
    this.locationDetailResource = <ILocationDetailResource>this.$resource(`${this.HuronConfig.getCmiV2Url()}/customers/:customerId/locations/:locationId`, {},
      {
        update: updateAction,
      });
  }

  public getLocationList(): IPromise<LocationListItem[]> {
    return this.locationListResource.get({
      customerId: this.Authinfo.getOrgId(),
      wide: true,
    }).$promise.then(locations => {
      return _.map(_.get<IRLocationListItem[]>(locations, 'locations', []), location => {
        return new LocationListItem(location);
      });
    });
  }

  public getLocationsByRoutingPrefix(routingPrefix: string): IPromise<LocationListItem[]> {
    return this.locationListResource.get({
      customerId: this.Authinfo.getOrgId(),
      routingprefix: routingPrefix,
    }).$promise.then(locations => {
      return _.map(_.get<IRLocationListItem[]>(locations, 'locations', []), location => {
        return new LocationListItem(location);
      });
    });
  }

  public getLocation(locationId: string): ng.IPromise<Location> {
    return this.locationDetailResource.get({
      customerId: this.Authinfo.getOrgId(),
      locationId,
    }).$promise
    .then(response => new Location(response));
  }

  public getUserLocation(userId: string): ng.IPromise<Location> {
    return this.userLocationDetailResource.get({
      customerId: this.Authinfo.getOrgId(),
      userId,
    }).$promise
    .then(response =>  _.get<Location>(response, 'location'));
  }

  public createLocation(location: Location): ng.IPromise<string> {
    let locationHeader: string;
    return this.locationListResource.save({
      customerId: this.Authinfo.getOrgId(),
    }, {
      name: location.name,
      routingPrefix: location.routingPrefix,
      defaultLocation: location.defaultLocation,
      timeZone: location.timeZone,
      preferredLanguage: location.preferredLanguage,
      tone: location.tone,
      dateFormat: location.dateFormat,
      timeFormat: location.timeFormat,
      steeringDigit: location.steeringDigit,
      allowExternalTransfer: location.allowExternalTransfer,
      voicemailPilotNumber: location.voicemailPilotNumber,
      regionCodeDialing: location.regionCodeDialing,
      callerId: location.callerId,
    },
    (_response, headers) => {
      locationHeader = headers('Location');
    }).$promise
    .then(() => locationHeader);
  }

  public updateLocation(location: Location): ng.IPromise<void> {
    return this.locationDetailResource.update({
      customerId: this.Authinfo.getOrgId(),
      locationId: location.uuid,
    }, {
      name: location.name,
      routingPrefix: location.routingPrefix,
      defaultLocation: location.defaultLocation,
      timeZone: location.timeZone,
      preferredLanguage: location.preferredLanguage,
      tone: location.tone,
      dateFormat: location.dateFormat,
      timeFormat: location.timeFormat,
      steeringDigit: location.steeringDigit,
      allowExternalTransfer: location.allowExternalTransfer,
      voicemailPilotNumber: location.voicemailPilotNumber,
      regionCodeDialing: location.regionCodeDialing,
      callerId: location.callerId,
    }).$promise;
  }

  public updateUserLocation(userId: string, locationId: string | undefined, validateFlag: boolean): ng.IPromise<void> {
    return this.userMoveLocationResource.update({
      customerId: this.Authinfo.getOrgId(),
      userId,
    }, {
      locationUuid: locationId,
      validate: validateFlag,
    }).$promise.then(() => {
      if ( validateFlag === true) {
        return this.updateUserLocation(userId, locationId, false);
      } else {
        return this.$q.resolve();
      }
    });
  }

  public deleteLocation(locationId: string): ng.IPromise<IRLocation> {
    return this.locationDetailResource.delete({
      customerId: this.Authinfo.getOrgId(),
      locationId: locationId,
    }, location).$promise;
  }

  public getDefaultLocation() {
    if (!this.defaultLocation) {
      return this.getLocationList().then(locationList => {
        this.defaultLocation = locationList[0];
        return this.defaultLocation;
      });
    } else {
      return this.$q.resolve(this.defaultLocation);
    }
  }

  public makeDefault(locationId: string): ng.IPromise<void> {
    return this.locationDetailResource.update({
      customerId: this.Authinfo.getOrgId(),
      locationId: locationId,
    }, {
      defaultLocation: true,
    }).$promise.then(() => {
      this.getDefaultLocation();
    });
  }

  public filterCards(locations: LocationListItem[], filterText: string): LocationListItem[] {
    if (_.isEmpty(filterText)) {
      return locations;
    }
    return _.filter(locations, filteredLocation => {
      return filteredLocation.name.toLowerCase().indexOf(filterText.toLowerCase()) !== -1;
    });
  }

  public hasLocation(name: string): ng.IPromise<boolean> {
    return this.locationListResource.get({
      customerId: this.Authinfo.getOrgId(),
      name: name,
    }).$promise.then(locations => {
      const filterList = _.get<LocationListItem[]>(locations, 'locations', []).filter((item) => {
        return item.name === name;
      });
      return filterList.length > 0;
    });
  }

  public getLocationInternalNumberPoolList(locationId, directorynumber, order, patternQuery, patternlimit): IPromise<LocationInternalNumberPoolList[]> {
    return this.locationInternalNumberPoolResource.query({
      customerId: this.Authinfo.getOrgId(),
      locationId: locationId,
      directorynumber,
      order,
      pattern: patternQuery,
      limit: patternlimit,
    }).$promise.then((response) => {
      return _.map(response, location => {
        return new LocationInternalNumberPoolList(location);
      });
    });
  }
}
