export class ProPackService {

  /* @ngInject */
  constructor(
    private FeatureToggleService,
    private $q: ng.IQService,
    ) {}

  public hasProPackEnabled(): ng.IPromise<boolean> {
    return this.FeatureToggleService.atlasITProPackGetStatus().then(result => {
      return result;
    });
  }

  public getProPackPurchased(): ng.IPromise<boolean> {
    return this.FeatureToggleService.atlasITProPackPurchasedGetStatus().then(result => {
      return result;
    });
  }

  // This will be true if the ProPack Toggle and propack is purchased are true
  public hasProPackPurchased(): ng.IPromise<boolean> {
    const promises = {
      proPack: this.hasProPackEnabled(),
      proPackPurchased: this.getProPackPurchased(),
    };
    return this.$q.all(promises).then(result => {
      return result.proPack && result.proPackPurchased;
    });
  }

  // This will be true if the ProPack Toggle is false OR propack is purchased
  public hasProPackPurchasedOrNotEnabled(): ng.IPromise<boolean> {
    const promises = {
      proPack: this.hasProPackEnabled(),
      proPackPurchased: this.getProPackPurchased(),
    };
    return this.$q.all(promises).then(result => {
      return !result.proPack || result.proPackPurchased;
    });
  }

  //This will be true if the ProPack Toggle is true and the propack is not purchased
  public hasProPackEnabledAndNotPurchased(): ng.IPromise<boolean> {
    const promises = {
      proPack: this.hasProPackEnabled(),
      proPackPurchased: this.getProPackPurchased(),
    };
    return this.$q.all(promises).then(result => {
      return result.proPack && !result.proPackPurchased;
    });
  }

}