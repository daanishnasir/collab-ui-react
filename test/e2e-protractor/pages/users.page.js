'use strict';

// TODO - break up into UserList/UserAdd/UserPreview
var UsersPage = function () {
  this.inviteTestUser = {
    username: 'pbr-org-admin@squared2webex.com',
    password: 'C1sc0123!',
    usernameWithNoEntitlements: 'collabctg+doNotDeleteTestUser@gmail.com'
  };

  this.testUser = {
    username: 'atlasmapservice+ll1@gmail.com',
    password: 'C1sc0123!',
  };

  this.huronTestUser = {
    username: 'admin@int1.huron-alpha.com',
    password: 'Cisco123!',
  };

  this.accountTestUser = {
    username: 'nkamboh+acc2@gmail.com',
    password: 'C1sc0123!',
  };

  this.listPanel = element(by.id('userslistpanel'));
  this.manageDialog = element(by.id('modalContent'));
  this.squaredPanel = element(by.id('conversations-link'));
  this.entitlementPanel = element(by.id('entitlementPanel'));
  this.huronPanel = element(by.id('huronPanel'));
  this.conferencePanel = element(by.id('conferencePanel'));
  this.endpointPanel = element(by.id('endpointPanel'));
  this.previewPanel = element(by.id('details-panel'));
  this.previewName = element(by.id('name-preview'));

  this.nextButton = element(by.id('next-button'));
  this.rolesPanel = element(by.id('roles-panel'));
  this.closeRolesPanel = element(by.id('close-roles'));
  this.closeSidePanel = element(by.css('.panel-close'));
  this.messagingService = element(by.id('Messaging'));

  this.addUsers = element(by.id('addUsers'));
  this.addUsersField = element(by.id('usersfield-tokenfield'));
  this.closeAddUsers = element(by.id('closeAddUser'));
  this.invalid = element(by.css('.invalid'));
  this.close = element(by.css('.close'));

  this.manageCallInitiation = element(by.id('chk_squaredCallInitiation')); // on add users
  this.manageSquaredTeamMember = element(by.id('chk_squaredTeamMember'));
  this.callInitiationCheckbox = element(by.id('chk_squaredCallInitiation')); // on edit user
  this.messengerCheckBox = element(by.id('chk_jabberMessenger'));
  this.fusionCheckBox = element(by.id('chk_squaredFusionUC'));
  this.squaredCheckBox = element(by.id('chk_webExSquared'));
  this.squaredUCCheckBox = element(by.id('chk_ciscoUC'));
  this.closePreview = element(by.id('exitPreviewButton'));
  this.closeDetails = element(by.id('exit-details-btn'));

  this.subTitleAdd = element(by.id('subTitleAdd'));
  this.subTitleEnable = element(by.id('subTitleEnable'));

  this.onboardButton = element(by.id('btnOnboard'));
  this.inviteButton = element(by.id('btnInvite'));
  this.entitleButton = element(by.id('btnEntitle'));
  this.addButton = element(by.id('btnAdd'));

  this.cancelButton = element(by.id('btn-cancel'));
  this.saveButton = element(by.id('btn-save'));

  this.clearButton = element(by.id('btnCancel'));

  this.currentPage = element(by.css('.pagination-current a'));
  this.queryCount = element(by.binding('totalResults'));
  this.nextPage = element(by.id('next-page'));
  this.prevPage = element(by.id('prev-page'));
  this.queryResults = element(by.id('queryresults'));

  this.moreOptions = element(by.id('userMoreOptions'));
  this.settingsBar = element(by.id('setting-bar'));
  this.exportButton = element(by.id('export-btn'));
  this.logoutButton = element(by.id('logout-btn'));
  this.userNameCell = element(by.id('userNameCell'));
  this.checkBoxEnts = element.all(by.repeater('(service, val) in entitlements'));
  this.iconSearch = element(by.id('icon-search'));
  this.userListEnts = element.all(by.binding('userName'));
  this.userListStatus = element.all(by.binding('userStatus'));
  this.userListAction = element(by.id('actionsButton'));
  this.actionDropdown = element(by.css('.dropdown-menu'));
  this.resendInviteOption = element(by.id('resendInviteOption'));
  this.gridCell = element(by.css('.ngCell'));
  this.userLink = element(by.id('user-profile'));

  this.fnameField = element(by.id('fnameField'));
  this.lnameField = element(by.id('lnameField'));
  this.displayField = element(by.id('displayField'));
  this.emailField = element(by.id('emailField'));
  this.orgField = element(by.id('orgField'));
  this.titleField = element(by.id('titleField'));
  this.userTab = element(by.id('usertab'));

  this.collabRadio1 = element(by.id('collabRadioLabel1'));
  this.collabRadio2 = element(by.id('collabRadioLabel2'));

  this.rolesChevron = element(by.css('#rolesChevron .header-title'));

  this.messageLicenses = element(by.id('messaging'));
  this.conferenceLicenses = element(by.id('conference'));
  this.communicationLicenses = element(by.id('communication'));

  this.assertSorting = function (nameToSort) {
    this.queryResults.getAttribute('value').then(function (value) {
      var queryresults = parseInt(value, 10);
      if (queryresults > 1) {
        //get first user
        var user = null;
        element.all(by.repeater('user in queryuserslist')).then(function (rows) {
          user = rows[0].getText();
        });
        //Click on username sort and expect the first user not to be the same
        element(by.id(nameToSort)).click().then(function () {
          element.all(by.repeater('user in queryuserslist')).then(function (rows) {
            expect(rows[0].getText()).not.toBe(user);
          });
        });
      }
    });
  };

  this.clickOnUser = function () {
    utils.click(element.all(by.repeater('row in renderedRows')).first());
  };

  this.assertPage = function (page) {
    utils.expectText(this.currentPage, page);
  };

  this.assertResultsLength = function (results) {
    element.all(by.repeater('row in renderedRows')).then(function (rows) {
      if (results === 20) {
        expect(rows.length).toBeLessThanOrEqualTo(results);
      } else if (results === 0) {
        return expect(rows.length).toBeGreaterThan(results);
        //expect(rows.length).toBeGreaterThan(results);
      } else {
        expect(rows.length).toBe(results);
      }
    });
  };

  this.returnUser = function (userEmail) {
    return element.all(by.cssContainingText('.col3', userEmail)).first();
  };

  this.assertEntitlementListSize = function (size) {
    element.all(by.repeater('key in entitlementsKeys')).then(function (items) {
      expect(items.length).toBe(size);
    });
  };
};

module.exports = UsersPage;
