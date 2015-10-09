'use strict';
angular
  .module('wx2AdminWebClientApp')
  .config(['$httpProvider', '$stateProvider', '$urlRouterProvider', '$translateProvider',
    function ($httpProvider, $stateProvider, $urlRouterProvider, $translateProvider) {
      var sidepanelMemo = 'sidepanelMemo';

      $urlRouterProvider.otherwise('login');
      $stateProvider
        .state('login', {
          url: '/login',
          views: {
            'main@': {
              templateUrl: 'modules/core/login/login.tpl.html',
              controller: 'LoginCtrl'
            }
          },
          authenticate: false
        })
        .state('main', {
          views: {
            'main@': {
              templateUrl: 'modules/core/views/main.tpl.html'
            }
          },
          abstract: true,
          sticky: true
        })
        .state('partner', {
          template: '<div ui-view></div>',
          url: '/partner',
          parent: 'main',
          abstract: true
        })
        .state('unauthorized', {
          url: '/unauthorized',
          templateUrl: 'modules/squared/views/unauthorized.html',
          parent: 'main'
        })
        .state('sidepanel', {
          abstract: true,
          onEnter: /* @ngInject */ function ($modal, $state, $previousState) {
            if ($state.sidepanel) {
              $state.sidepanel.stopPreviousState = true;
            } else {
              $previousState.memo(sidepanelMemo);
            }
            $state.sidepanel = $modal.open({
              template: '<cs-sidepanel></cs-sidepanel>',
              windowTemplateUrl: 'sidepanel/sidepanel-modal.tpl.html',
              backdrop: false,
              keyboard: false
            });
            $state.sidepanel.result.finally(function () {
              if (!this.stopPreviousState && !$state.modal) {
                $state.sidepanel = null;
                var previousState = $previousState.get(sidepanelMemo);
                if (previousState) {
                  return $previousState.go(sidepanelMemo).then(function () {
                    $previousState.forget(sidepanelMemo);
                  });
                }
              }
            }.bind($state.sidepanel));
          },
          onExit: /* @ngInject */ function ($state, $previousState) {
            if ($state.sidepanel) {
              $state.sidepanel.dismiss();
            }
          }
        });

      $httpProvider.interceptors.push('TrackingIDInterceptor');
      $httpProvider.interceptors.push('ResponseInterceptor');

      // See ... http://angular-translate.github.io/docs/#/guide/19_security
      $translateProvider.useSanitizeValueStrategy('escapeParameters');

      $translateProvider.useStaticFilesLoader({
        prefix: 'l10n/',
        suffix: '.json'
      });

      $translateProvider.addInterpolation('$translateMessageFormatInterpolation');

      var defaultLang = 'en_US';

      //Tell the module what language to use by default
      $translateProvider.preferredLanguage(defaultLang);
    }
  ]);

angular
  .module('Squared')
  .config(['$urlRouterProvider', '$stateProvider',
    function ($urlRouterProvider, $stateProvider) {
      var modalMemo = 'modalMemo';
      var wizardmodalMemo = 'wizardmodalMemo';

      // Modal States Enter and Exit functions
      function modalOnEnter(options) {
        options = options || {};
        /* @ngInject */
        return function ($modal, $state, $previousState) {
          if ($state.modal) {
            $state.modal.stopPreviousState = true;
          } else {
            $previousState.memo(modalMemo);
          }
          $state.modal = $modal.open({
            template: '<div ui-view="modal"></div>',
            size: options.size,
            windowClass: options.windowClass,
            backdrop: options.backdrop || 'static'
          });
          $state.modal.result.finally(function () {
            if (!this.stopPreviousState) {
              $state.modal = null;
              var previousState = $previousState.get(modalMemo);
              if (previousState) {
                return $previousState.go(modalMemo).then(function () {
                  $previousState.forget(modalMemo);
                });
              }
            }
          }.bind($state.modal));
        };
      }

      /* @ngInject */
      function modalOnExit($state, $previousState) {
        if ($state.modal) {
          $state.modal.dismiss();
        }
      }

      $stateProvider
        .state('activate', {
          url: '/activate',
          templateUrl: 'modules/squared/views/activate.html',
          controller: 'ActivateCtrl',
          parent: 'main',
          authenticate: false
        })
        .state('csadmin', {
          url: '/csadmin?eqp',
          templateUrl: 'modules/squared/csadmin/csadmin.html',
          controller: 'CsAdminCtrl',
          parent: 'main'
        })
        .state('downloads', {
          url: '/downloads',
          templateUrl: 'modules/squared/views/downloads.html',
          controller: 'DownloadsCtrl',
          parent: 'main',
          authenticate: false
        })
        .state('profile', {
          url: '/profile',
          templateUrl: 'modules/core/partnerProfile/partnerProfile.tpl.html',
          controller: 'PartnerProfileCtrl',
          parent: 'main'
        })
        .state('invite', {
          url: '/invite',
          templateUrl: 'modules/squared/views/invite.html',
          controller: 'InviteCtrl',
          parent: 'main',
          authenticate: false
        })
        .state('invitelauncher', {
          url: '/invitelauncher',
          templateUrl: 'modules/squared/views/invitelauncher.html',
          controller: 'InvitelauncherCtrl',
          parent: 'main',
          authenticate: false
        })
        .state('applauncher', {
          url: '/applauncher',
          templateUrl: 'modules/squared/views/applauncher.html',
          controller: 'ApplauncherCtrl',
          parent: 'main',
          authenticate: false
        })
        .state('appdownload', {
          url: '/appdownload',
          templateUrl: 'modules/squared/views/appdownload.html',
          controller: 'AppdownloadCtrl',
          parent: 'main',
          authenticate: false
        })
        .state('processorder', {
          url: '/processorder',
          templateUrl: 'modules/squared/views/processorder.html',
          controller: 'ProcessorderCtrl',
          parent: 'main',
          authenticate: false
        })
        .state('overview', {
          url: '/overview',
          templateUrl: 'modules/core/landingPage/landingPage.tpl.html',
          controller: 'LandingPageCtrl',
          parent: 'main'
        })
        .state('users', {
          abstract: true,
          template: '<div ui-view></div>',
          parent: 'main'
        })
        .state('users.list', {
          url: '/users',
          templateUrl: 'modules/core/users/userList/userList.tpl.html',
          controller: 'UserListCtrl',
          params: {
            showAddUsers: {}
          }
        })
        .state('users.delete', {
          parent: 'modal',
          views: {
            'modal@': {
              controller: 'UserDeleteCtrl',
              templateUrl: 'modules/core/users/userDelete/userDelete.tpl.html'
            }
          },
          params: {
            deleteUserOrgId: null,
            deleteUserUuId: null,
            deleteUsername: null,
            deleteUserfamilyName: null,
            Username: null
          }
        })
        .state('users.deleteSelf', {
          parent: 'modal',
          views: {
            'modal@': {
              controller: 'UserDeleteCtrl',
              templateUrl: 'modules/core/users/userDelete/userDeleteSelf.tpl.html'
            }
          },
          params: {
            deleteUserOrgId: null,
            deleteUserUuId: null,
            deleteUsername: null
          }
        })
        .state('users.add', {
          parent: 'modalLarge',
          views: {
            'modal@': {
              controller: 'OnboardCtrl',
              template: '<div ui-view="usersAdd"></div>'
            },
            'usersAdd@users.add': {
              templateUrl: 'modules/core/users/userAdd/onboardUsersModal.tpl.html'
            }
          }
        })
        .state('users.add.services', {
          views: {
            'usersAdd@users.add': {
              templateUrl: 'modules/core/users/userAdd/assignServicesModal.tpl.html'
            }
          }
        })
        .state('users.add.services.dn', {
          views: {
            'usersAdd@users.add': {
              templateUrl: 'modules/huron/users/assignDnAndDirectLinesModal.tpl.html'
            }
          }
        })
        .state('users.convert', {
          parent: 'modalLarge',
          views: {
            'modal@': {
              controller: 'OnboardCtrl',
              template: '<div ui-view="usersConvert"></div>'
            },
            'usersConvert@users.convert': {
              templateUrl: 'modules/core/convertUsers/convertUsersModal.tpl.html'
            }
          }
        })
        .state('users.convert.services', {
          views: {
            'usersConvert@users.convert': {
              templateUrl: 'modules/core/users/userAdd/assignServicesModal.tpl.html'
            }
          }
        })
        .state('users.convert.services.dn', {
          views: {
            'usersConvert@users.convert': {
              templateUrl: 'modules/huron/users/assignDnAndDirectLinesModal.tpl.html'
            }
          }
        })
        .state('editService', {
          parent: 'modalLarge',
          views: {
            'modal@': {
              controller: 'OnboardCtrl',
              templateUrl: 'modules/core/users/userPreview/editServices.tpl.html'
            }
          },
          params: {
            currentUser: {}
          }
        })
        .state('user-overview', {
          parent: 'sidepanel',
          views: {
            'sidepanel@': {
              controller: 'UserOverviewCtrl',
              controllerAs: 'userOverview',
              templateUrl: 'modules/core/users/userOverview/userOverview.tpl.html'
            },
            'header@user-overview': {
              templateUrl: 'modules/core/users/userOverview/userHeader.tpl.html'
            }
          },
          resolve: {
            currentUser: /* @ngInject */ function ($http, $stateParams, Config, Utils, Authinfo) {
              var userUrl = Config.getScimUrl(Authinfo.getOrgId()) + '/' + $stateParams.currentUser.id;

              return $http.get(userUrl)
                .then(function (response) {
                  angular.copy(response.data, this.currentUser);
                  this.entitlements = Utils.getSqEntitlements(this.currentUser);
                  return response.data;
                }.bind($stateParams));
            }
          },
          params: {
            currentUser: {},
            entitlements: {},
            queryuserslist: {}
          },
          data: {
            displayName: 'Overview'
          }
        })
        .state('user-overview.communication', {
          templateUrl: 'modules/huron/overview/telephonyOverview.tpl.html',
          controller: 'TelephonyOverviewCtrl',
          controllerAs: 'telephonyOverview',
          params: {
            reloadToggle: false
          },
          data: {
            displayName: 'Communications'
          }
        })
        .state('user-overview.communication.directorynumber', {
          templateUrl: 'modules/huron/lineSettings/lineSettings.tpl.html',
          controller: 'LineSettingsCtrl',
          controllerAs: 'lineSettings',
          params: {
            directoryNumber: {}
          },
          data: {
            displayName: 'Line Configuration'
          }
        })
        .state('user-overview.device', {
          params: {
            device: {}
          },
          data: {
            displayName: 'Device Configuration'
          },
          views: {
            'header@user-overview': {
              templateUrl: 'modules/huron/device/deviceHeader.tpl.html',
              controller: 'DeviceHeaderCtrl',
              controllerAs: 'device'
            },
            '': {
              templateUrl: 'modules/huron/device/deviceDetail.tpl.html',
              controller: 'DeviceDetailCtrl',
              controllerAs: 'ucDeviceDetail'
            }
          }
        })
        .state('user-overview.communication.voicemail', {
          template: '<div uc-voicemail></div>',
          data: {
            displayName: 'Voicemail'
          }
        })
        .state('user-overview.communication.snr', {
          template: '<div uc-single-number-reach></div>',
          data: {
            displayName: 'Single Number Reach'
          }
        })
        .state('user-overview.messaging', {
          templateUrl: 'modules/core/users/userPreview/userPreview.tpl.html',
          controller: 'UserPreviewCtrl',
          data: {
            displayName: 'Messaging'
          },
          params: {
            service: 'MESSAGING'
          }
        })
        .state('user-overview.cloudExtension-squared-fusion-cal', {
          templateUrl: 'modules/hercules/cloudExtensions/cloudExtensionPreview.tpl.html',
          controller: 'CloudExtensionPreviewCtrl',
          data: {
            displayName: 'Calendar Service'
          },
          params: {
            extensionId: {}
          }
        })
        .state('user-overview.cloudExtension-squared-fusion-uc', {
          templateUrl: 'modules/hercules/cloudExtensions/callServicePreview.tpl.html',
          controller: 'CallServicePreviewCtrl',
          data: {
            displayName: 'Call Service'
          },
          params: {
            extensionId: {}
          }
        })
        .state('user-overview.conferencing', {
          templateUrl: 'modules/core/users/userPreview/conferencePreview.tpl.html',
          controller: 'ConferencePreviewCtrl',
          controllerAs: 'confPreview',
          data: {
            displayName: 'Conferencing'
          },
          params: {
            service: 'CONFERENCING'
          }
        })
        .state('user-overview.conferencing.webex', {
          templateUrl: 'modules/webex/userSettings/userSettings.tpl.html',
          controller: 'WebExUserSettingsCtrl',
          controllerAs: 'WebExUserSettings',
          data: {
            displayName: 'Session Enablement'
          },
          params: {
            currentUser: {},
            site: {}
          }
        })
        .state('user-overview.conferencing.webex.webex2', {
          templateUrl: 'modules/webex/userSettings/userSettings2.tpl.html',
          controller: 'WebExUserSettings2Ctrl',
          controllerAs: 'WebExUserSettings2',
          data: {
            displayName: 'Privileges'
          },
          params: {
            currentUser: {},
            site: {}
          }
        })
        .state('user-overview.contactCenter', {
          templateUrl: 'modules/sunlight/users/userOverview/sunlightUserOverview.tpl.html',
          controller: 'SunlightUserOverviewCtrl',
          controllerAs: 'SunlightUserOverview',
          data: {
            displayName: 'Contact Center'
          },
          params: {
            service: 'CONTACTCENTER'
          }
        })
        .state('user-overview.userProfile', {
          templateUrl: 'modules/core/users/userRoles/userRoles.tpl.html',
          controller: 'UserRolesCtrl',
          data: {
            displayName: 'Roles'
          }
        })

      // .state('users.list.preview', {
      //     templateUrl: 'modules/core/users/userPreview/userPreview.tpl.html',
      //     controller: 'UserPreviewCtrl'
      //   })
      //   .state('users.list.preview.conversations', {
      //     template: '<div user-entitlements current-user="currentUser" entitlements="entitlements" queryuserslist="queryuserslist"></div>'
      //   })
      //   .state('users.list.preview.roles', {
      //     template: '<div class="sub-details-full" user-roles current-user="currentUser" entitlements="entitlements" roles="roles" queryuserslist="queryuserslist"></div>'
      //   })
      //   .state('users.list.preview.directorynumber', {
      //     templateUrl: 'modules/huron/lineSettings/lineSettings.tpl.html',
      //     controller: 'LineSettingsCtrl',
      //     controllerAs: 'lineSettings',
      //     params: {
      //       showAddUsers: {},
      //       directoryNumber: {}
      //     }
      //   })
      //   .state('users.list.preview.voicemail', {
      //     template: '<div uc-voicemail></div>'
      //   })
      //   .state('users.list.preview.snr', {
      //     template: '<div uc-single-number-reach></div>'
      //   })
      //   .state('users.list.preview.device', {
      //     templateUrl: 'modules/huron/device/deviceDetail.tpl.html',
      //     controller: 'DeviceDetailCtrl',
      //     controllerAs: 'ucDeviceDetail',
      //     params: {
      //       showAddUsers: {},
      //       device: {}
      //     }
      //   })
      .state('groups', {
          abstract: true,
          template: '<div ui-view></div>',
          parent: 'main'
        })
        .state('groups.list', {
          url: '/groups',
          templateUrl: 'modules/core/groups/groupList/groupList.tpl.html',
          controller: 'ListGroupsCtrl'
        })
        .state('groups.list.preview', {
          templateUrl: 'modules/core/groups/groupPreview/groupPreview.tpl.html',
          controller: 'GroupPreviewCtrl'
        })
        .state('organizations', {
          url: '/organizations',
          templateUrl: 'modules/core/organizations/organizationList/organizationList.tpl.html',
          controller: 'ListOrganizationsCtrl',
          parent: 'main'
        })
        .state('organization-overview', {
          parent: 'sidepanel',
          views: {
            'sidepanel@': {
              controller: 'OrganizationOverviewCtrl',
              controllerAs: 'orgOverview',
              templateUrl: 'modules/core/organizations/organizationOverview/organizationOverview.tpl.html'
            },
            'header@organization-overview': {
              templateUrl: 'modules/core/organizations/organizationOverview/organizationHeader.tpl.html'
            }
          },
          params: {
            currentOrganization: null
          },
          data: {
            displayName: 'Overview'
          }
        })
        .state('organization-overview.features', {
          templateUrl: 'modules/core/organizations/organizationFeatures/organizationFeatures.tpl.html',
          controller: 'OrganizationFeaturesCtrl',
          controllerAs: 'features',
          params: {
            reloadToggle: false
          },
          data: {
            displayName: 'Beta Features'
          }
        })
        .state('organization-overview.add', {
          parent: 'modalLarge',
          views: {
            'modal@': {
              controller: 'OrganizationAddCtrl',
              controllerAs: 'orgAdd',
              template: '<div ui-view="orgAdd"></div>'
            },
            'orgAdd@organization-overview.add': {
              templateUrl: 'modules/core/organizations/organizationAdd/organizationAdd.tpl.html'
            }
          }
        })
        .state('organization-overview.add.info', {
          templateUrl: 'modules/core/organizations/organizationAdd/organizationAdd.tpl.html'
        })
        .state('organization-overview.add.addNumbers', {
          templateUrl: 'modules/core/organizations/organizationAdd/addNumbers.tpl.html',
          controller: 'DidAddCtrl',
          controllerAs: 'didAdd',
          params: {
            currentTrial: {},
            currentOrg: {}
          }
        })
        .state('site-list', {
          url: '/site-list',
          templateUrl: 'modules/core/siteList/siteList.tpl.html',
          controller: 'SiteListCtrl',
          controllerAs: 'siteList',
          parent: 'main'
        })
        .state('site-settings', {
          url: 'site_settings',
          templateUrl: 'modules/webex/siteSettings/siteSettings.tpl.html',
          controller: 'WebExSiteSettingsCtrl',
          controllerAs: 'WebExSiteSettings',
          parent: 'main',
          params: {
            siteUrl: null
          }
        })
        .state('site-settings.site-setting', {
          templateUrl: 'modules/webex/siteSetting/siteSetting.tpl.html',
          controller: 'WebExSiteSettingCtrl',
          controllerAs: 'WebExSiteSetting',
          parent: 'main',
          params: {
            siteUrl: null,
            webexPageId: null,
            settingPageIframeUrl: null
          }
        })
        .state('webex-reports', {
          url: '/webexreports',
          templateUrl: 'modules/webex/siteReports/siteReports.tpl.html',
          controller: 'ReportsCtrl',
          controllerAs: 'reports',
          parent: 'main',
          params: {
            siteUrl: null
          },
          data: {
            displayName: 'Reports Page1'
          }
        })
        .state('webex-reports-iframe', {
          url: '/iwebexreports',
          templateUrl: 'modules/webex/siteReportsIframe/siteReportIframe.tpl.html',
          controller: 'ReportsIframeCtrl',
          controllerAs: 'reportsIframe',
          parent: 'main',
          params: {
            siteUrl: null,
            reportPageId: null,
            reportPageIframeUrl: null
          },
          data: {
            displayName: 'Reports Page2'
          }
        })
        .state('templates', {
          url: '/templates',
          templateUrl: 'modules/squared/views/templates.html',
          controller: 'UsersCtrl',
          parent: 'main'
        })
        .state('reports', {
          url: '/reports',
          templateUrl: 'modules/squared/views/reports.html',
          controller: 'ReportsCtrl',
          parent: 'main'
        })
        .state('userprofile', {
          url: '/userprofile/:uid',
          templateUrl: 'modules/squared/views/userprofile.html',
          controller: 'UserProfileCtrl',
          parent: 'main'
        })
        .state('support', {
          url: '/support?search',
          templateUrl: 'modules/squared/support/support.tpl.html',
          controller: 'SupportCtrl',
          parent: 'main'
        })
        .state('billing', {
          url: '/orderprovisioning?enc',
          templateUrl: 'modules/squared/support/billing.tpl.html',
          controller: 'BillingCtrl',
          parent: 'main'
        })

      /*
        devices redux
      */

      .state('devices', {
          url: '/devices',
          templateUrl: 'modules/squared/devicesRedux/devices.html',
          controller: 'DevicesCtrlRedux',
          controllerAs: 'sc',
          parent: 'main'
        })
        .state('device-overview', {
          parent: 'sidepanel',
          views: {
            'sidepanel@': {
              controller: 'DeviceOverviewCtrlRedux',
              controllerAs: 'deviceOverview',
              templateUrl: 'modules/squared/devicesRedux/overview/deviceOverview.tpl.html'
            },
            'header@device-overview': {
              templateUrl: 'modules/squared/devicesRedux/overview/deviceHeader.tpl.html'
            }
          },
          params: {
            currentDevice: {}
          },
          data: {
            displayName: 'Device Overview'
          }
        })

      /*
        devices redux prototypes
      */

      .state('main-redux', {
          views: {
            'main@': {
              templateUrl: 'modules/squared/devicesRedux2/main-redux.html'
            }
          },
          abstract: true,
          sticky: true
        })
        .state('devices-redux2', {
          abstract: true,
          url: '/devices-redux2',
          templateUrl: 'modules/squared/devicesRedux2/devices.html',
          controller: 'DevicesReduxCtrl2',
          controllerAs: 'devices',
          parent: 'main-redux'
        })
        .state('devices-redux2.search', {
          url: '/search',
          views: {
            'rightPanel': {
              templateUrl: 'modules/squared/devicesRedux2/list.html'
            }
          }
        })
        .state('devices-redux2.details', {
          url: '/details',
          views: {
            'rightPanel': {
              controllerAs: 'deviceDetails',
              controller: 'DevicesReduxDetailsCtrl2',
              templateUrl: 'modules/squared/devicesRedux2/details.html'
            }
          },
          params: {
            device: null
          }
        })

      .state('devices-redux3', {
          abstract: true,
          url: '/devices-redux3',
          templateUrl: 'modules/squared/devicesRedux3/devices.html',
          controller: 'DevicesReduxCtrl3',
          controllerAs: 'devices',
          parent: 'main-redux'
        })
        .state('devices-redux3.search', {
          url: '/search',
          views: {
            'leftPanel': {
              templateUrl: 'modules/squared/devicesRedux3/list.html'
            }
          }
        })
        .state('devices-redux3.details', {
          url: '/details',
          views: {
            'leftPanel': {
              templateUrl: 'modules/squared/devicesRedux3/list.html'
            },
            'rightPanel': {
              controllerAs: 'deviceDetails',
              controller: 'DevicesReduxDetailsCtrl3',
              templateUrl: 'modules/squared/devicesRedux3/details.html'
            }
          },
          params: {
            device: null
          }
        })

      .state('devices-redux4', {
          abstract: true,
          url: '/devices-redux4',
          templateUrl: 'modules/squared/devicesRedux4/devices.html',
          controller: 'DevicesReduxCtrl4',
          controllerAs: 'devices',
          parent: 'main-redux'
        })
        .state('devices-redux4.search', {
          url: '/search',
          views: {
            'leftPanel': {
              templateUrl: 'modules/squared/devicesRedux4/list.html'
            }
          }
        })
        .state('devices-redux4.details', {
          url: '/details',
          views: {
            // 'leftPanel': {
            //   templateUrl: 'modules/squared/devicesRedux4/list.html'
            // },
            'rightPanel': {
              controllerAs: 'deviceDetails',
              controller: 'DevicesReduxDetailsCtrl4',
              templateUrl: 'modules/squared/devicesRedux4/details.html'
            }
          },
          params: {
            device: null
          }
        })
        .state('devices-redux5', {
          abstract: true,
          templateUrl: 'modules/squared/devicesRedux5/devices.html',
          controller: 'DevicesReduxCtrl5',
          controllerAs: 'devices',
          parent: 'main-redux'
        })
        .state('devices-redux5.search', {
          url: '/devices-redux',
          views: {
            'leftPanel': {
              templateUrl: 'modules/squared/devicesRedux5/list.html'
            }
          }
        })
        .state('devices-redux5.details', {
          url: '/devices-redux/details',
          views: {
            'leftPanel': {
              controllerAs: 'deviceDetails',
              controller: 'DevicesReduxDetailsCtrl5',
              templateUrl: 'modules/squared/devicesRedux5/details.html'
            }
          },
          params: {
            device: null
          }
        })
        /*
          end: devices redux prototypes
        */

      .state('partneroverview', {
          parent: 'partner',
          url: '/overview',
          templateUrl: 'modules/core/views/partnerlanding.html',
          controller: 'PartnerHomeCtrl'
        })
        .state('partnerreports', {
          parent: 'partner',
          url: '/reports',
          templateUrl: 'modules/squared/views/partnerreports.html',
          controller: 'PartnerReportsCtrl'
        })
        .state('newpartnerreports', {
          parent: 'partner',
          url: '/newreports',
          templateUrl: 'modules/core/partnerReports/partnerReports.tpl.html',
          controller: 'PartnerReportCtrl',
          controllerAs: 'nav'
        })
        .state('login_swap', {
          url: '/login/:customerOrgId/:customerOrgName',
          views: {
            'main@': {
              templateUrl: 'modules/core/login/login.tpl.html',
              controller: 'LoginCtrl'
            }
          },
          authenticate: false
        })
        .state('launch_partner_org', {
          url: '/login/:partnerOrgId/:partnerOrgName/:launchPartner',
          views: {
            'main@': {
              templateUrl: 'modules/core/login/login.tpl.html',
              controller: 'LoginCtrl'
            }
          },
          authenticate: false
        })
        .state('partnercustomers', {
          parent: 'partner',
          template: '<div ui-view></div>',
          absract: true
        })
        .state('partnercustomers.list', {
          url: '/customers',
          templateUrl: 'modules/core/customers/customerList/customerList.tpl.html',
          controller: 'PartnerHomeCtrl',
          params: {
            filter: null
          }
        })
        .state('customer-overview', {
          parent: 'sidepanel',
          views: {
            'sidepanel@': {
              controller: 'CustomerOverviewCtrl',
              controllerAs: 'customerOverview',
              templateUrl: 'modules/core/customers/customerOverview/customerOverview.tpl.html'
            }
          },
          resolve: {
            identityCustomer: /* @ngInject */ function ($stateParams, $q, Orgservice) {
              var defer = $q.defer();
              if ($stateParams.currentCustomer) {
                Orgservice.getOrg(orgCallback, $stateParams.currentCustomer.customerOrgId);
              }

              return defer.promise;

              function orgCallback(data, status) {
                defer.resolve(data);
              }
            }
          },
          params: {
            currentCustomer: {}
          },
          data: {
            displayName: 'Overview'
          }
        })
        .state('customer-overview.externalNumbers', {
          controller: 'ExternalNumberDetailCtrl',
          controllerAs: 'externalNumbers',
          templateUrl: 'modules/huron/externalNumbers/externalNumberDetail.tpl.html',
          data: {
            displayName: 'Phone Numbers'
          }
        })
        .state('modal', {
          abstract: true,
          onEnter: modalOnEnter(),
          onExit: modalOnExit
        })
        .state('modalLarge', {
          abstract: true,
          onEnter: modalOnEnter({
            size: 'lg'
          }),
          onExit: modalOnExit
        })
        .state('modalSmall', {
          abstract: true,
          onEnter: modalOnEnter({
            size: 'sm'
          }),
          onExit: modalOnExit
        })
        .state('modalFull', {
          abstract: true,
          onEnter: modalOnEnter({
            windowClass: 'modal-full',
            backdrop: 'static'
          }),
          onExit: modalOnExit
        })
        .state('wizardmodal', {
          abstract: true,
          onEnter: ['$modal', '$state', '$previousState',
            function ($modal, $state, $previousState) {
              $previousState.memo(wizardmodalMemo);
              $state.modal = $modal.open({
                template: '<div ui-view="modal"></div>',
                controller: 'ModalWizardCtrl',
                windowTemplateUrl: 'modules/core/modal/wizardWindow.tpl.html',
                backdrop: 'static'
              });
              $state.modal.result.finally(function () {
                $state.modal = null;
                var previousState = $previousState.get(wizardmodalMemo);
                if (previousState) {
                  return $previousState.go(wizardmodalMemo);
                }
              });
            }
          ],
          onExit: ['$state', '$previousState',
            function ($state, $previousState) {
              if ($state.modal) {
                $previousState.forget(wizardmodalMemo);
                $state.modal.close();
              }
            }
          ]
        })
        .state('firsttimesplash', {
          abstract: true,
          views: {
            'main@': {
              templateUrl: 'modules/core/setupWizard/firstTimeWizard.tpl.html',
              controller: 'FirstTimeWizardCtrl'
            }
          }
        })
        .state('firsttimewizard', {
          parent: 'firsttimesplash',
          template: '<cr-wizard tabs="tabs" finish="finish" is-first-time="true"></cr-wizard>',
          controller: 'SetupWizardCtrl',
          data: {
            firstTimeSetup: true
          }
        })
        .state('setupwizardmodal', {
          parent: 'wizardmodal',
          views: {
            'modal@': {
              template: '<cr-wizard tabs="tabs" finish="finish"></cr-wizard>',
              controller: 'SetupWizardCtrl'
            }
          },
          params: {
            currentTab: {}
          },
          data: {
            firstTimeSetup: false
          }
        })
        .state('trialExtInterest', {
          url: '/trialExtInterest?eqp',
          templateUrl: 'modules/squared/views/trialExtInterest.html',
          controller: 'TrialExtInterestCtrl',
          parent: 'main'
        });
    }
  ]);

angular
  .module('Huron')
  .config(['$stateProvider',
    function ($stateProvider) {
      $stateProvider
        .state('cdrsupport', {
          url: '/cdrsupport',
          templateUrl: 'modules/huron/cdrLogs/cdrlogs.tpl.html',
          controller: 'CdrLogsCtrl',
          controllerAs: 'cdr',
          parent: 'main'
        })
        .state('callroutingBase', {
          abstract: true,
          parent: 'main',
          templateUrl: 'modules/huron/callRouting/callRouting.tpl.html'
        })
        .state('callrouting', {
          url: '/callrouting',
          parent: 'callroutingBase',
          views: {
            'header': {
              templateUrl: 'modules/huron/callRouting/callRoutingHeader.tpl.html'
            },
            'nav': {
              templateUrl: 'modules/huron/callRouting/callRoutingNav.tpl.html',
              controller: 'CallRoutingNavCtrl',
              controllerAs: 'nav'
            },
            'main': {
              template: '<div ui-view></div>'
            }
          }
        })
        .state('autoattendant', {
          url: '/autoattendant',
          abstract: false,
          parent: 'callrouting',
          template: '<div> <div ui-view></div> </div>'
        })
        .state('autoattendant.landing', {
          parent: 'autoattendant',
          templateUrl: 'modules/huron/callRouting/autoAttendant/autoAttendantLanding.tpl.html',
          controller: 'AutoAttendantLandingCtrl',
          controllerAs: 'aaLanding'
        })
        .state('autoattendant.main', {
          abstract: true,
          parent: 'modal',
          views: {
            'modal@': {
              controller: 'AutoAttendantMainCtrl',
              templateUrl: 'modules/huron/callRouting/autoAttendant/autoAttendantMain.tpl.html',
              controllerAs: 'aaMain'
            }
          }
        })
        .state('autoattendant.main.general', {
          parent: 'autoattendant.main',
          params: {
            aaName: ''
          },
          views: {
            'tabContent': {
              templateUrl: 'modules/huron/callRouting/autoAttendant/autoAttendantGeneral.tpl.html',
              controller: 'AutoAttendantGeneralCtrl',
              controllerAs: 'aaGeneral'
            }
          }
        })
        .state('autoattendant.main.aa', {
          parent: 'autoattendant.main',
          params: {
            aaName: ''
          },
          views: {
            'tabContent': {
              templateUrl: 'modules/huron/callRouting/autoAttendant/autoAttendantMenu.tpl.html',
              controller: 'AutoAttendantMenuCtrl',
              controllerAs: 'aaMenu'
            }
          }
        })
        .state('autoattendant.aalanding', {
          parent: 'autoattendant',
          templateUrl: 'modules/huron/callRouting/autoAttendant/aaLanding.tpl.html',
          controller: 'AALandingCtrl',
          controllerAs: 'aaLanding'
        })
        .state('autoattendant.aabuilder', {
          parent: 'main',
          params: {
            aaName: ''
          },
          templateUrl: 'modules/huron/callRouting/autoAttendant/builder/aaBuilderMain.tpl.html',
          controller: 'AABuilderMainCtrl',
          controllerAs: 'aaBuilderMain'
        })
        .state('callpark', {
          url: '/callpark',
          parent: 'callrouting',
          templateUrl: 'modules/huron/callRouting/callPark/callPark.tpl.html',
          controller: 'CallParkCtrl',
          controllerAs: 'cp'
        })
        .state('callpickup', {
          url: '/callpickup',
          parent: 'callrouting',
          template: '<div></div>'
        })
        .state('intercomgroups', {
          url: '/intercomgroups',
          parent: 'callrouting',
          template: '<div></div>'
        })
        .state('paginggroups', {
          url: '/paginggroups',
          parent: 'callrouting',
          template: '<div></div>'
        })
        .state('huntgroups', {
          url: '/huntgroups',
          parent: 'callrouting',
          template: '<div></div>'
        })
        .state('mediaonhold', {
          parent: 'modalLarge',
          url: '/mediaonhold',
          views: {
            'modal@': {
              templateUrl: 'modules/huron/moh/moh.tpl.html',
              controller: 'MohCtrl',
              controllerAs: 'moh'
            }
          }
        })
        .state('trialAdd', {
          abstract: true,
          parent: 'modal',
          views: {
            'modal@': {
              template: '<div ui-view></div>',
              controller: 'TrialAddCtrl',
              controllerAs: 'trial'
            }
          }
        })
        .state('trialAdd.info', {
          templateUrl: 'modules/core/trials/trialAdd.tpl.html'
        })
        .state('trialAdd.addNumbers', {
          templateUrl: 'modules/core/trials/addNumbers.tpl.html',
          controller: 'DidAddCtrl',
          controllerAs: 'didAdd',
          params: {
            currentTrial: {},
            currentOrg: {}
          }
        })
        .state('trialAdd.nextSteps', {
          templateUrl: 'modules/core/trials/nextStep.tpl.html',
          controller: 'DidAddCtrl',
          controllerAs: 'didAdd'
        })
        .state('trialEdit', {
          abstract: true,
          parent: 'modal',
          views: {
            'modal@': {
              template: '<div ui-view></div>',
              controller: 'TrialEditCtrl',
              controllerAs: 'trial'
            }
          },
          params: {
            showPartnerEdit: false,
            currentTrial: {}
          }
        })
        .state('trialEdit.addNumbers', {
          templateUrl: 'modules/core/trials/addNumbers.tpl.html',
          controller: 'DidAddCtrl',
          controllerAs: 'didAdd',
          params: {
            fromEditTrial: false,
            currentOrg: {}
          }
        })
        .state('trialEdit.info', {
          templateUrl: 'modules/core/trials/trialEdit.tpl.html'
        })
        .state('generateauthcode', {
          parent: 'modal',
          url: '/generateauthcode',
          params: {
            currentUser: {},
            activationCode: {}
          },
          views: {
            'modal@': {
              templateUrl: 'modules/huron/device/generateActivationCodeModal.tpl.html',
              controller: 'GenerateActivationCodeCtrl',
              controllerAs: 'genAuthCode'
            }
          }
        })
        .state('didadd', {
          parent: 'modal',
          params: {
            currentOrg: {},
            editMode: true
          },
          views: {
            'modal@': {
              templateUrl: 'modules/huron/didAdd/didAdd.tpl.html',
              controller: 'DidAddCtrl',
              controllerAs: 'didAdd'
            }
          }
        })
        .state('pstnSetup', {
          parent: 'modalFull',
          params: {
            customerId: {},
            customerName: {}
          },
          views: {
            'modal@': {
              template: '<div ui-view></div>',
              controller: 'PstnSetupCtrl',
              controllerAs: 'pstnSetup'
            },
            '@pstnSetup': {
              templateUrl: 'modules/huron/pstnSetup/pstnProviders.tpl.html'
            }
          }
        })
        .state('pstnSetup.orderNumbers', {
          templateUrl: 'modules/huron/pstnSetup/pstnNumbers.tpl.html'
        })
        .state('pstnSetup.review', {
          templateUrl: 'modules/huron/pstnSetup/pstnReview.tpl.html'
        })
        .state('pstnSetup.nextSteps', {
          templateUrl: 'modules/huron/pstnSetup/pstnNextSteps.tpl.html'
        })
        .state('hurondetailsBase', {
          abstract: true,
          parent: 'main',
          templateUrl: 'modules/huron/details/huronDetails.tpl.html'
        })
        .state('hurondetails', {
          url: '/hurondetails',
          parent: 'hurondetailsBase',
          views: {
            'nav': {
              templateUrl: 'modules/huron/details/huronDetailsNav.tpl.html',
              controller: 'HuronDetailsNavCtrl',
              controllerAs: 'nav'
            },
            'main': {
              template: '<div ui-view></div>'
            }
          }
        })
        .state('huronlines', {
          url: '/lines',
          parent: 'hurondetails',
          templateUrl: 'modules/huron/lines/lineList.tpl.html',
          controller: 'LinesListCtrl',
          controllerAs: 'linesListCtrl'
        })
        .state('huronsettings', {
          url: '/settings',
          parent: 'hurondetails',
          templateUrl: 'modules/huron/callRouter/companyNumber.tpl.html',
          controller: 'CallRouterCtrl',
          controllerAs: 'callRouterCtrl'
        })
        .state('huronfeatures', {
          url: '/features',
          parent: 'hurondetails',
          templateUrl: 'modules/huron/features/features.tpl.html',
          controller: 'HuronFeaturesCtrl',
          controllerAs: 'huronFeaturesCtrl'
        })
        .state('huronnewfeature', {
          url: '/newfeature',
          parent: 'hurondetails',
          controller: 'NewFeatureCtrl',
          controllerAs: 'newFeatureCtrl',
          templateUrl: 'modules/huron/features/newFeature/newFeature.tpl.html',
        })
        .state('huronfeatures.deleteHuntGroup', {
          parent: 'modal',
          views: {
            'modal@': {
              controller: 'HuntGroupDeleteCtrl',
              controllerAs: 'huntGroupDeleteCtrl',
              templateUrl: 'modules/huron/features/huntGroup/huntGroupDeleteModal.tpl.html'
            }
          },
          params: {
            deleteHuntGroupName: null,
            deleteHuntGroupId: null
          }
        });
    }
  ]);

angular
  .module('Hercules')
  .config(['$stateProvider',
    function ($stateProvider) {
      $stateProvider
        .state('fusion', {
          url: '/fusion',
          templateUrl: 'modules/hercules/dashboard/dashboard-next.html',
          controller: 'DashboardNextController',
          parent: 'main'
        })
        .state('calendar-service', {
          templateUrl: 'modules/hercules/call-service/call.html',
          controller: 'CallController',
          controllerAs: 'call',
          data: {
            serviceType: "c_cal"
          },
          parent: 'main',
          abstract: true
        })
        .state('calendar-service.list', {
          url: '/services/calendar',
          views: {
            'fullPane': {
              templateUrl: 'modules/hercules/call-service/call-list.html',
              controller: 'CallController',
              controllerAs: 'call'
            }
          }
        })
        .state('calendar-service.list.details', {
          views: {
            'rightPane': {
              controllerAs: 'callDetails',
              controller: 'CallDetailsController',
              templateUrl: 'modules/hercules/call-service/call-details.html'
            }
          },
          params: {
            cluster: null,
            serviceType: "c_cal"
          }
        })
        .state('calendar-service.list.details.cluster-settings', {
          views: {
            'details-pane': {
              templateUrl: 'modules/hercules/call-service/cluster-settings.html'
            }
          }
        })
        .state('calendar-service.about', {
          url: '/services/calendar/about',
          views: {
            'fullPane': {
              templateUrl: 'modules/hercules/call-service/calendar-about.html'
            }
          }
        })
        .state('calendar-service.settings', {
          url: '/services/calendar/settings',
          views: {
            'fullPane': {
              controllerAs: 'callServiceSettings',
              controller: 'CallServiceSettingsController',
              templateUrl: 'modules/hercules/call-service/calendar-service-settings.html'
            }
          },
          params: {
            serviceType: "c_cal"
          }
        })
        .state('call-service', {
          templateUrl: 'modules/hercules/call-service/call.html',
          controller: 'CallController',
          controllerAs: 'call',
          data: {
            serviceType: "c_ucmc"
          },
          parent: 'main',
        })
        .state('call-service.list', {
          url: '/services/call',
          views: {
            'fullPane': {
              templateUrl: 'modules/hercules/call-service/call-list.html',
              controller: 'CallController',
              controllerAs: 'call'
            }
          }
        })
        .state('call-service.list.details', {
          views: {
            'rightPane': {
              controllerAs: 'callDetails',
              controller: 'CallDetailsController',
              templateUrl: 'modules/hercules/call-service/call-details.html'
            }
          },
          params: {
            cluster: null,
            serviceType: "c_ucmc"
          }
        })
        .state('call-service.list.details.cluster-settings', {
          views: {
            'details-pane': {
              templateUrl: 'modules/hercules/call-service/cluster-settings.html'
            }
          }
        })
        .state('call-service.settings', {
          url: '/services/call/settings',
          views: {
            'fullPane': {
              controllerAs: 'callServiceSettings',
              controller: 'CallServiceSettingsController',
              templateUrl: 'modules/hercules/call-service/call-service-settings.html'
            }
          },
          params: {
            serviceType: "c_ucmc"
          }
        })
        .state('call-service.about', {
          url: '/services/call/about',
          views: {
            'fullPane': {
              templateUrl: 'modules/hercules/call-service/call-about.html'
            }
          }
        })

      .state('cluster-details', {
          parent: 'sidepanel',
          views: {
            'sidepanel@': {
              controller: 'ClusterDetailsController',
              templateUrl: 'modules/hercules/dashboard/cluster-details.html'
            },
            'header@cluster-details': {
              templateUrl: 'modules/hercules/dashboard/cluster-header.html'
            }
          },
          data: {
            displayName: 'Overview'
          },
          params: {
            clusterId: undefined
          }
        })
        .state('cluster-details.hosts', {
          templateUrl: 'modules/hercules/dashboard/host-details.html',
          controller: 'HostDetailsController',
          data: {
            displayName: 'Hosts'
          },
          params: {
            clusterId: undefined,
            hostSerial: undefined
          }
        })
        .state('cluster-details.service', {
          templateUrl: 'modules/hercules/dashboard/service-details.html',
          controller: 'ServiceDetailsController',
          data: {
            displayName: 'Connectors'
          },
          params: {
            clusterId: undefined,
            serviceType: undefined
          }
        });
    }
  ]);

angular
  .module('Mediafusion')
  .config(['$stateProvider',
    function ($stateProvider) {
      $stateProvider
        .state('meetings', {
          abstract: true,
          template: '<div ui-view></div>',
          //url: '/meetings',
          //templateUrl: 'modules/mediafusion/meetings/meetingList/meetingList.tpl.html',
          //controller: 'ListMeetingsCtrl',
          parent: 'main'
        })
        .state('meetings.list', {
          url: '/meetings',
          templateUrl: 'modules/mediafusion/meetings/meetingList/meetingList.tpl.html',
          controller: 'ListMeetingsCtrl',
          params: {
            showAddUsers: {}
          }
        })
        .state('meetings.list.preview', {
          templateUrl: 'modules/mediafusion/meetings/meetingPreview/meetingPreview.tpl.html',
          controller: 'MeetingPreviewCtrl'
        })
        .state('metrics', {
          url: '/metrics',
          templateUrl: 'modules/mediafusion/metrics/metricsList/metricsList.tpl.html',
          controller: 'MetricsCtrl',
          parent: 'main'
        })
        .state('metrics.preview', {
          templateUrl: 'modules/mediafusion/metrics/metricsPreview/metricsPreview.tpl.html',
          controller: 'MetricsPreviewCtrl'
        })
        .state('threshold', {
          url: '/threshold',
          templateUrl: 'modules/mediafusion/threshold/thresholdList/thresholdList.tpl.html',
          controller: 'ThresholdCtrl',
          parent: 'main'
        })
        .state('threshold.preview', {
          templateUrl: 'modules/mediafusion/threshold/thresholdPreview/thresholdPreview.tpl.html',
          controller: 'ThresholdPreviewCtrl'
        })
        .state('fault', {
          url: '/fault',
          templateUrl: 'modules/mediafusion/faultRules/faultRules.tpl.html',
          controller: 'FaultRulesCtrl',
          parent: 'main'
        })
        .state('vts', {
          abstract: true,
          template: '<div ui-view></div>',
          parent: 'main'
        })
        .state('vts.list', {
          url: '/vts',
          templateUrl: 'modules/mediafusion/enterpriseResource/enterpriseResourceList/enterpriseResourceList.tpl.html',
          controller: 'ListVtsCtrl'
        })
        .state('vts.list.preview', {
          templateUrl: 'modules/mediafusion/enterpriseResource/enterpriseResourcePreview/enterpriseResourcePreview.tpl.html',
          controller: 'VtsPreviewCtrl'
        })
        .state('alarms', {
          url: '/alarms',
          templateUrl: 'modules/mediafusion/alarms/alarmList/alarmList.tpl.html',
          controller: 'AlarmListCtrl',
          parent: 'main'
        })
        .state('alarms.preview', {
          templateUrl: 'modules/mediafusion/alarms/alarmPreview/alarmPreview.tpl.html',
          controller: 'AlarmPreviewCtrl'
        })
        .state('events', {
          url: '/events',
          templateUrl: 'modules/mediafusion/events/eventList/eventList.tpl.html',
          controller: 'EventListCtrl',
          parent: 'main'
        })
        .state('events.preview', {
          templateUrl: 'modules/mediafusion/events/eventPreview/eventPreview.tpl.html',
          controller: 'EventPreviewCtrl'
        })
        .state('utilization', {
          url: '/utilization',
          templateUrl: 'modules/mediafusion/utilization/overAllUtilization.tpl.html',
          controller: 'UtilizationCtrl',
          parent: 'main'
        })
        .state('mediafusionconnector', {
          url: '/mediafusionconnector',
          templateUrl: 'modules/mediafusion/mediafusion-connector/mediafusionConnector.tpl.html',
          controller: 'mediafusionConnectorCtrl',
          parent: 'main'
        })
        .state('connector-details', {
          parent: 'sidepanel',
          views: {
            'sidepanel@': {
              controller: 'ConnectorDetailsController',
              templateUrl: 'modules/mediafusion/mediafusion-connector/connector-details.html'
            },
            'header@connector-details': {
              templateUrl: 'modules/mediafusion/mediafusion-connector/connector-header.html'
            }
          },
          data: {
            displayName: 'Overview'
          },
          params: {
            connectorId: {},
            groupName: {}
          }
        })
        .state('connector-details.alarms', {
          templateUrl: 'modules/mediafusion/mediafusion-connector/alarms-details.html',
          controller: 'AlarmsDetailsController',
          data: {
            displayName: 'Alarms'
          },
          params: {
            cconnectorId: {}
          }
        });
    }
  ]);

angular
  .module('Messenger')
  .config(['$stateProvider',
    function ($stateProvider) {
      $stateProvider
        .state('messenger', {
          parent: 'main',
          url: '/messenger',
          templateUrl: 'modules/messenger/ci-sync/ciSync.tpl.html',
          controller: 'CiSyncCtrl',
          controllerAs: 'sync'
        });
    }
  ]);
