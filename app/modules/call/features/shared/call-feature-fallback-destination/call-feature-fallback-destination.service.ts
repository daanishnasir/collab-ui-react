import { Member } from 'modules/huron/members';

interface IDirectoryNumberResource extends ng.resource.IResourceClass<ng.resource.IResource<any>> {}

export class CallFeatureFallbackDestinationService {
  private directoryNumberResource: IDirectoryNumberResource;

    /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
  ) {

    this.directoryNumberResource = <IDirectoryNumberResource>this.$resource(this.HuronConfig.getCmiUrl() + '/voice/customers/:customerId/directorynumbers/:directoryNumberId');
  }

  // TODO (jlowery): rename this
  public getDirectoryNumber(numberUuid): ng.IPromise<any> {
    return this.directoryNumberResource.get({
      customerId: this.Authinfo.getOrgId(),
      directoryNumberId: numberUuid,
    }).$promise;
  }

  public getDisplayName(member: Member): string {
    if (member.displayName) {
      return member.displayName;
    } else if (!member.firstName && !member.lastName && member.userName) {
      return member.userName;
    } else if (member.firstName && member.lastName) {
      return member.firstName + ' ' + member.lastName;
    } else if (member.firstName) {
      return member.firstName;
    } else if (member.lastName) {
      return member.lastName;
    } else {
      return '';
    }
  }

}
