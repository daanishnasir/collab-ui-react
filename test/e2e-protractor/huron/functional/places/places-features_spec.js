import * as provisioner from '../../../provisioner/provisioner';
import { huronCustomer } from '../../../provisioner/huron/huron-customer-config';
import { CallPlacesPage } from '../../pages/callPlaces.page';
import { CallSpeedDialsPage } from '../../pages/callSpeedDials.page';
import { CallUserPage } from '../../pages/callUser.page';

const CallPlaces = new CallPlacesPage();
const CallUser = new CallUserPage();
const SpeedDialsPage = new CallSpeedDialsPage();

describe('Huron Functional: places-features', () => {
  const customer = huronCustomer('places-features');
  beforeAll(done => {
    provisioner.provisionCustomerAndLogin(customer)
      .then(done);
  });

  afterAll(done => {
    provisioner.tearDownAtlasCustomer(customer.partner, customer.name).then(done);
  });

  it('should be on overview page of customer portal', () => {
    navigation.expectDriverCurrentUrl('overview');
    utils.expectIsDisplayed(navigation.tabs);
  });

  it('should navigate to places page', () => {
    utils.click(navigation.placesTab);
    navigation.expectDriverCurrentUrl('places');
  });

  describe('Add places flow', () => {
    describe('create a new place with Desk Phone', () => {
      it('should show an option to add new place', () => {
        utils.click(CallPlaces.addNewPlaceEmpty);
        utils.expectIsDisplayed(CallPlaces.newPlaceInput);
      });
      it('should take a new place input and allow to save', () => {
        utils.expectIsDisabled(CallPlaces.nxtBtn);
        utils.sendKeys(CallPlaces.newPlaceInput, 'Naboo');
        utils.expectIsEnabled(CallPlaces.nxtBtn);
      });
      it('should go to device selection page and select a device', () => {
        utils.click(CallPlaces.nxtBtn);
        utils.expectIsDisabled(CallPlaces.nxtBtn2);
        utils.click(CallPlaces.selectHuron);
        utils.expectIsEnabled(CallPlaces.nxtBtn2);
      });
      it('should go to Assign Numbers section and select an extension', () => {
        utils.click(CallPlaces.nxtBtn2);
        utils.selectDropdown('.csSelect-container[name="internalNumber"]', '304');
      });
      it('should go to a final setup patch with a QR', () => {
        utils.click(CallPlaces.nxtBtn3);
        utils.expectIsDisplayed(CallPlaces.qrCode);
      });
      it('should close current setup', () => {
        utils.click(CallPlaces.closeGrp);
      });
    });

    describe('Place Call Features', () => {
      it('should list newly added place by search', () => {
        utils.click(CallPlaces.searchPlaces);
        utils.sendKeys(CallPlaces.searchBar, 'Naboo');
      });
      it('should click on newly added place and bring up side menu', () => {
        utils.click(CallPlaces.clickLocation);
      });
      it('should select Call under services and navigate to the next page', () => {
        utils.click(CallPlaces.callClick);
        utils.expectIsDisplayed(CallPlaces.featuresSct);
      });

      describe('Speed Dials', () => {
        it('should navigate to Speed Dials details view', () => {
          utils.click(CallPlaces.callOverview.features.speedDials);
          utils.expectIsDisplayed(SpeedDialsPage.title);
          utils.expectIsDisplayed(SpeedDialsPage.actionMenu);
        });
        describe('Speed Dials action menu', () => {
          beforeAll(() => {
            utils.click(CallPlaces.callSubMenu);
            utils.click(CallPlaces.callOverview.features.speedDials);
            utils.click(SpeedDialsPage.actionMenu);
          });
          it('should show Add Speed Dial menu item', () => {
            utils.expectIsDisplayed(SpeedDialsPage.addSpeedDialAction);
          });
          it('should show Reorder menu item', () => {
            utils.expectIsDisplayed(SpeedDialsPage.reorderSpeedDialAction);
          });

          describe('Add Speed Dial section', () => {
            beforeAll(() => {
              utils.click(SpeedDialsPage.addSpeedDialAction);
            });
            it('should show the Speed Dials title', () => {
              utils.expectIsDisplayed(SpeedDialsPage.title);
            });
            it('should show Cancel button', () => {
              utils.expectIsDisplayed(SpeedDialsPage.speedDialCancelButton);
            });
            it('should show disabled Save button', () => {
              utils.expectIsDisplayed(SpeedDialsPage.speedDialSaveButton);
              utils.expectIsDisabled(SpeedDialsPage.speedDialSaveButton);
            });
            it('should show Contact Name fields', () => {
              utils.expectIsDisplayed(SpeedDialsPage.newSpeedDialContactNameLabel);
              utils.expectIsDisplayed(SpeedDialsPage.newSpeedDialContactNameInput);
            });
            it('should show Destination fields', () => {
              utils.expectIsDisplayed(SpeedDialsPage.newSpeedDialDestinationLabel);
              utils.expectIsDisplayed(SpeedDialsPage.newSpeedDialDestinationDropdown);
            });

            describe('Cancel Button', () => {
              it('should take user back to Speed Dial list', () => {
                utils.click(SpeedDialsPage.speedDialCancelButton);
                utils.expectIsNotDisplayed(SpeedDialsPage.newSpeedDialContactNameLabel);
                utils.expectIsDisplayed(SpeedDialsPage.actionMenu);
              });
            });
          });

          describe('Add new Speed Dial action', () => {
            const SPEEDDIAL_DESTINATION_E164_NAME = 'Ann Anderson External E164';
            const SPEEDDIAL_DESTINATION_E164_VALUE = '4695550000';
            const SPEEDDIAL_DESTINATION_URI_NAME = 'Billy Bob URI Address';
            const SPEEDDIAL_DESTINATION_URI_VALUE = 'billy.bob@uri.com';
            const SPEEDDIAL_DESTINATION_CUSTOM_NAME = 'Curtis Carter Custom DN';
            const SPEEDDIAL_DESTINATION_CUSTOM_VALUE = '5001';
            const SPEEDDIAL_DESTINATION_TYPE_EXTERNAL = 'External';
            const SPEEDDIAL_DESTINATION_TYPE_URI = 'URI Address';
            const SPEEDDIAL_DESTINATION_TYPE_CUSTOM = 'Custom';
            beforeEach(() => {
              utils.click(CallPlaces.callSubMenu);
              utils.click(CallPlaces.callOverview.features.speedDials);
              utils.click(SpeedDialsPage.actionMenu);
              utils.click(SpeedDialsPage.addSpeedDialAction);
              utils.expectIsDisplayed(SpeedDialsPage.newSpeedDialContactNameInput);
              utils.expectIsDisplayed(SpeedDialsPage.newSpeedDialDestinationDropdown);
            });
            afterEach(() => {
              utils.expectIsNotDisplayed(SpeedDialsPage.newSpeedDialContactNameLabel);
            });
            it('should be able to save a new external number speed dial', () => {
              utils.selectDropdown('.csSelect-container[name="CallDestTypeSelect"]', SPEEDDIAL_DESTINATION_TYPE_EXTERNAL);
              utils.sendKeys(SpeedDialsPage.newSpeedDialContactNameInput, SPEEDDIAL_DESTINATION_E164_NAME);
              utils.sendKeys(SpeedDialsPage.newSpeedDialDestinationInputPhone, SPEEDDIAL_DESTINATION_E164_VALUE);
              utils.click(SpeedDialsPage.speedDialSaveButton);
              utils.waitForText(SpeedDialsPage.speedDialLabels, SPEEDDIAL_DESTINATION_E164_NAME)
            });
            it('should be able to save a new uri speed dial', () => {
              utils.selectDropdown('.csSelect-container[name="CallDestTypeSelect"]', SPEEDDIAL_DESTINATION_TYPE_URI);
              utils.sendKeys(SpeedDialsPage.newSpeedDialContactNameInput, SPEEDDIAL_DESTINATION_URI_NAME);
              utils.sendKeys(SpeedDialsPage.newSpeedDialDestinationInputUri, SPEEDDIAL_DESTINATION_URI_VALUE);
              utils.click(SpeedDialsPage.speedDialSaveButton);
              utils.waitForText(SpeedDialsPage.speedDialLabels, SPEEDDIAL_DESTINATION_URI_NAME)
            });
            it('should be able to save a new internal number speed dial', () => {
              utils.selectDropdown('.csSelect-container[name="CallDestTypeSelect"]', SPEEDDIAL_DESTINATION_TYPE_CUSTOM);
              utils.sendKeys(SpeedDialsPage.newSpeedDialContactNameInput, SPEEDDIAL_DESTINATION_CUSTOM_NAME);
              utils.sendKeys(SpeedDialsPage.newSpeedDialDestinationInputCustom, SPEEDDIAL_DESTINATION_CUSTOM_VALUE);
              utils.click(SpeedDialsPage.speedDialSaveButton);
              utils.waitForText(SpeedDialsPage.speedDialLabels, SPEEDDIAL_DESTINATION_CUSTOM_NAME)
            });
          });

          describe('Reorder Speed Dial action', () => {
            beforeAll(() => {
              utils.click(CallPlaces.callSubMenu);
              utils.click(CallPlaces.callOverview.features.speedDials);
              utils.expectIsDisplayed(SpeedDialsPage.firstSpeedDialEntryLabel);
              utils.click(SpeedDialsPage.actionMenu);
              utils.expectIsDisplayed(SpeedDialsPage.reorderSpeedDialAction);
              utils.click(SpeedDialsPage.reorderSpeedDialAction);
            });
            it('should show the Speed Dials title', () => {
              utils.expectIsDisplayed(SpeedDialsPage.title);
            });
            it('should show Cancel button', () => {
              utils.expectIsDisplayed(SpeedDialsPage.speedDialCancelButton);
            });
            it('should show Save button', () => {
              utils.expectIsDisplayed(SpeedDialsPage.speedDialSaveButton);
            });
            it('should show draggable handle', () => {
              utils.expectCountToBeGreater(SpeedDialsPage.speedDialEntryDraggableHandles, 0);
            });

            describe('Draggable Handle', () => {
              it('should have two or more speed dials for this test', () => {
                utils.expectCountToBeGreater(SpeedDialsPage.speedDialEntries, 1);
              });
              // Unable to get Drag and Drop to work at this time.
              xit('should be able to move speed dial entry', () => {
                SpeedDialsPage.firstSpeedDialEntryLabel.getText().then((initialFirstSpeedDialName) => {
                  utils.dragAndDrop(SpeedDialsPage.speedDialEntries.first(), SpeedDialsPage.speedDialEntries.last());
                  utils.expectNotText(SpeedDialsPage.firstSpeedDialEntryLabel, initialFirstSpeedDialName);
                });
              });
            });
            it('should be able to save reordered speed dials', () => {
              utils.click(SpeedDialsPage.speedDialSaveButton);
            });
            it('saving should take you back to the speed dials list', () => {
              utils.expectIsDisplayed(SpeedDialsPage.firstSpeedDialEntryLabel);
              utils.expectIsNotDisplayed(SpeedDialsPage.speedDialEntryDraggableHandles);
            });
          });

          describe('Delete speed dials', () => {
            beforeAll(() => {
              utils.click(CallPlaces.callSubMenu);
              utils.click(CallPlaces.callOverview.features.speedDials);
              utils.expectIsDisplayed(SpeedDialsPage.firstSpeedDialEntryLabel); // expect at least one existing speed dial entry
            });
            it('should see a list of speed dials that can be deleted', () => {
              utils.expectCountToBeGreater(SpeedDialsPage.speedDialEntries, 0);
              utils.expectIsDisplayed(SpeedDialsPage.firstSpeedDialEntryLabel);
              utils.expectIsDisplayed(SpeedDialsPage.firstSpeedDialDeleteButton);
            });
            it('should be able to remove an existing speed dial', () => {
              SpeedDialsPage.firstSpeedDialEntryLabel.getText().then((initialFirstSpeedDialName) => {
                utils.click(SpeedDialsPage.firstSpeedDialDeleteButton);
                utils.expectIsDisplayed(SpeedDialsPage.speedDialDeleteConfirmationButton);
                utils.click(SpeedDialsPage.speedDialDeleteConfirmationButton);
                utils.expectNotText(SpeedDialsPage.firstSpeedDialEntryLabel, initialFirstSpeedDialName);
              });
            });
          });
        });
        it('should navigate back to call details view', () => {
          utils.click(CallPlaces.callSubMenu);
          utils.expectIsDisplayed(CallPlaces.callOverview.features.title);
        });
      });

      describe('Dialing Restrictions', () => {
        it('should navigate to Dialing Restrictions details view', () => {
          // TODO: Need to add tests
          utils.click(CallUser.callOverview.features.dialingRestrictions);
          utils.expectIsDisplayed(CallUser.dialingRestrictions.nationaDialing.title);
          utils.expectIsDisplayed(CallUser.dialingRestrictions.premiumDialing.title);
          utils.expectIsDisplayed(CallUser.dialingRestrictions.internationalDialing.title);
        });
        it('should navigate back to call details view', () => {
          utils.click(CallPlaces.callSubMenu);
          utils.expectIsDisplayed(CallPlaces.callOverview.features.title);
        });
      });

      xdescribe('External Call Transfer/Conference', () => {
        it('should navigate to External Call Transfer/Conference details view', () => {
          // TODO: Need to add tests
        });
        it('should navigate back to call details view', () => {
          utils.click(CallPlaces.callSubMenu);
          utils.expectIsDisplayed(CallPlaces.callOverview.features.title);
        });
      });

      it('should exit side navigation and return to main Places page', () => {
        utils.click(CallPlaces.sideNavClose);
        utils.expectIsNotDisplayed(CallPlaces.callOverview.main);
      });
    });
  });
});