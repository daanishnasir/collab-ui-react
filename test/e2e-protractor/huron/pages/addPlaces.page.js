export class AddPlacesPage {
  constructor() {
    this.placesTab = element(by.css('i.icon-location'));
    this.addNewPlace = element.all(by.css('button.add-button')).first();
    this.addNewPlaceEmpty = element.all(by.css('button.add-button.places-empty')).first();
    this.newPlaceInput = element(by.id('newPlace'));
    this.nxtBtn = element(by.id('next-button'));
    this.nxtBtn2 = element(by.css('[ng-click="chooseDeviceType.next()"]'));
    this.selectHuron = element(by.css('[ng-click="chooseDeviceType.huron()"]'));
    this.selectCloudberry = element(by.css('[ng-click="chooseDeviceType.cloudberry()"]'));
    this.sparkOnlyRadio = element(by.css('.cs-radio[for="service1"]'));
    this.sparkPhoneRadio = element(by.css('label[for="service2"]'));
    this.nxtBtn4 = element(by.css('[ng-click="editServices.next()"]'));
    this.addExtension = element(by.name('internalNumber'));
    this.nxtBtn3 = element(by.css('[ng-click="addLines.next()"]'));
    this.qrCode = element.all(by.css('.activation-code')).first();
    this.closeGrp = element(by.css('button.close'));
    this.searchPlaces = element(by.css('i.icon-search'));
    this.clearSearchPlace = element(by.css('i.icon-exit-outline'));
    this.searchBar = element(by.id('searchFilter'));
    this.clickLocation = element(by.cssContainingText('.ui-grid-cell-contents', 'Naboo'));
    this.overviewPg = element.all(by.cssContainingText('.ng-binding', 'Overview')).first();
    this.servicesSctn = element(by.cssContainingText('.section-name', 'Services'));
    this.devicesSctn = element(by.cssContainingText('.section-name', 'Devices'));
    this.callClick = element(by.cssContainingText('.feature-label', 'Cisco Spark + Cisco Spark Call'));
    this.callStngsPg = element.all(by.cssContainingText('.ng-binding', 'Call')).first();
    this.clickLocation2 = element(by.cssContainingText('.ui-grid-cell-contents', 'Jedha'));
    this.clickLocation3 = element(by.cssContainingText('.ui-grid-cell-contents', 'Eadu'));
    this.callClick2 = element(by.cssContainingText('.feature-label', 'Cisco Spark only'));
    this.prfrdLang = element(by.cssContainingText('.section-name', 'Preferred Language'));
    this.prfrdLangDd = element(by.css('.csSelect-container[name="languageSelect"]'));
    this.prfrdLangInst = element(by.css('.description-block', 'Configure preferred language'));
    this.callOverview = {
      main: element.all(by.css('[ui-sref="place-overview"]')).last(),
      services: {
        call: element(by.cssContainingText('.feature-name.ng-binding', 'Call')),
      },
      features: {
        speedDials: element(by.cssContainingText('.feature-name.ng-binding', 'Speed Dials')),
      },
    };
    this.callSubMenu = element.all(by.css('[ui-sref="place-overview.communication"]')).last();
    this.dirNumSct = element(by.cssContainingText('.section-name', 'Directory Numbers'));
    this.featuresSct = element(by.cssContainingText('.section-name', 'Features'));
    this.primaryClick = element(by.cssContainingText('.feature-status', 'Primary'));
    this.LineConfigPg = element(by.cssContainingText('.section-name', 'Line Configuration'));
    this.directoryNumSct = element(by.cssContainingText('.section__title', 'Directory Numbers'));
    this.callFwdSct = element(by.cssContainingText('.section__title', 'Call Forwarding'));
    this.simulCallSct = element(by.cssContainingText('.section__title', 'Simultaneous Calls'));
    this.callerIdSct = element(by.cssContainingText('.section__title', 'Caller ID'));
    this.autoAnsSct = element(by.cssContainingText('.section__title', 'Auto Answer'));
    this.sharedLineSct = element(by.cssContainingText('.section__title', 'Shared Line'));
    this.sideNavClose = element(by.css('button.panel-close'));
  }
};
