'use strict';

angular.module('Core')
  .constant('NAME_DELIMITER', ' \u000B')
  .service('Userservice', ['$http', '$rootScope', '$location', 'Storage', 'Config', 'Authinfo', 'Log', 'Auth', 'Utils', 'HuronUser', 'Notification', 'NAME_DELIMITER',
    '$translate', '$q',
    function ($http, $rootScope, $location, Storage, Config, Authinfo, Log, Auth, Utils, HuronUser, Notification, NAME_DELIMITER, $translate, $q) {

      var userUrl = Config.getAdminServiceUrl();

      function tokenParseFirstLastName(name) {
        var givenName = null;
        var familyName = null;

        if (angular.isString(name) && name.length > 0) {
          if (name.indexOf(NAME_DELIMITER) > -1) {
            givenName = name.split(NAME_DELIMITER).slice(0, -1).join(' ').trim();
            familyName = name.split(NAME_DELIMITER).slice(-1).join(' ').trim();
          } else {
            givenName = name.split(' ').slice(0, -1).join(' ').trim();
            familyName = name.split(' ').slice(-1).join(' ').trim();
          }
        }
        return {
          'givenName': givenName,
          'familyName': familyName
        };
      }

      function onboardUsers(userData, callback, cancelPromise) {

        if (userData && angular.isArray(userData.users) && userData.users.length > 0) {
          $http.post(userUrl + 'organization/' + Authinfo.getOrgId() + '/users/onboard', userData, {
              timeout: cancelPromise
            }).success(function (data, status) {
              data = data || {};
              data.success = true;
              callback(data, status);
            })
            .error(function (data, status) {
              data = data || {};
              data.success = false;
              data.status = status;

              callback(data, status);
            });
        } else {
          callback('No valid emails entered.');
        }
      }

      return {

        updateUsers: function (usersDataArray, licenses, entitlements, method, callback) {
          var userData = {
            'users': []
          };

          for (var i = 0; i < usersDataArray.length; i++) {
            var userEmail = usersDataArray[i].address.trim();
            if (userEmail.length > 0) {
              var user = {
                'email': userEmail,
                'userEntitlements': entitlements,
                'licenses': licenses,
                'assignedDn': usersDataArray[i].assignedDn,
                'externalNumber': usersDataArray[i].externalNumber
              };
              userData.users.push(user);
            }
          }

          if (userData.users.length > 0) {
            var resultList = [];
            $http({
                method: 'PATCH',
                url: userUrl + 'organization/' + Authinfo.getOrgId() + '/users',
                data: userData
              })
              .success(function (data, status) {
                data = data || {};
                // Huron user onboarding
                if (angular.isDefined(data.userResponse) && angular.isArray(data.userResponse) && data.userResponse.length > 0) {
                  var promises = [];
                  angular.forEach(data.userResponse, function (user, index) {
                    var userResult = {
                      email: user.email,
                      alertType: null
                    };

                    // This code is being added temporarily to add/remove users from Squared UC
                    // Discussions are ongoing concerning how these common functions should be
                    // integrated.
                    if (user.entitled && user.entitled.indexOf(Config.entitlements.huron) !== -1) {
                      var userObj = {
                        'email': user.email,
                        'name': user.name,
                        'directoryNumber': "",
                        'externalNumber': ""
                      };

                      var userAndDnObj = userData.users.filter(function (user) {
                        return (user.email == userObj.email);
                      });

                      if (angular.isDefined(userAndDnObj[0].assignedDn) && (userAndDnObj[0].assignedDn !== null) && userAndDnObj[0].assignedDn.pattern.length > 0) {
                        userObj.directoryNumber = userAndDnObj[0].assignedDn.pattern;
                      }
                      //with None as externalNumber pattern the CMI call fails
                      if (angular.isDefined(userAndDnObj[0].externalNumber) && userAndDnObj[0].externalNumber !== false && userAndDnObj[0].externalNumber.pattern !== "None") {
                        userObj.externalNumber = userAndDnObj[0].externalNumber.pattern;
                      }

                      promises.push(HuronUser.create(user.uuid, userObj)
                        .catch(function (response) {
                          this.alertType = 'danger';
                          this.message = Notification.processErrorResponse(response, 'usersPage.ciscoucError', this);
                        }.bind(userResult)));

                    } else if (user.unentitled && user.unentitled.indexOf(Config.entitlements.huron) !== -1) {
                      promises.push(HuronUser.delete(user.uuid)
                        .catch(function (response) {
                          // If the user does not exist in Squared UC do not report an error
                          if (response.status !== 404) {
                            this.alertType = 'danger';
                            this.message = Notification.processErrorResponse(response, 'usersPage.deleteUserError', this);
                          }
                        }.bind(userResult)));
                    }
                    resultList.push(userResult);
                  }); // end of foreach

                  $q.all(promises).finally(function () {
                    //concatenating the results in an array of strings for notify function
                    var errors = [];

                    for (var idx in resultList) {
                      if (resultList[idx].alertType === 'danger') {
                        errors.push(resultList[idx].message);
                      }
                    }
                    //Displaying notifications
                    if (errors.length > 0) {
                      Notification.notify(errors, 'error');
                    }

                    $rootScope.$broadcast('Userservice::updateUsers');

                    // callback to entitlement handle function
                    data.success = true;
                    callback(data, status, method);

                  });

                } // end of if
              })
              .error(function (data, status) {
                data = data || {};
                data.success = false;
                data.status = status;
                callback(data, status, method);
              });
          }
        },

        addUsers: function (usersDataArray, entitlements, callback) {
          var userData = {
            'users': []
          };

          for (var i = 0; i < usersDataArray.length; i++) {
            var userEmail = usersDataArray[i].address.trim();
            var userName = usersDataArray[i].name.trim();
            var user = {
              'email': null,
              'name': null,
              'userEntitlements': entitlements
            };
            if (userEmail.length > 0) {
              user.email = userEmail;
              if (userName.length > 0 && userName !== false) {
                user.name = userName;
              }
              userData.users.push(user);
            }
          }

          if (userData.users.length > 0) {

            $http.post(userUrl + 'organization/' + Authinfo.getOrgId() + '/users', userData)
              .success(function (data, status) {
                data = data || {};
                data.success = true;
                callback(data, status);
              })
              .error(function (data, status) {
                data = data || {};
                data.success = false;
                data.status = status;

                callback(data, status);
              });
          } else {
            callback('No valid emails entered.');
          }
        },

        getUser: function (userid, callback) {
          var scimUrl = Config.getScimUrl(Authinfo.getOrgId()) + '/' + userid;
          var userUrl = scimUrl;

          $http.get(userUrl, {
              cache: true
            })
            .success(function (data, status) {
              data = data || {};
              data.success = true;
              callback(data, status);
            })
            .error(function (data, status) {
              data = data || {};
              data.success = false;
              data.status = status;
              callback(data, status);
            });
        },

        updateUserProfile: function (userid, userData, callback) {
          var scimUrl = Config.getScimUrl(Authinfo.getOrgId()) + '/' + userid;

          if (userData) {

            $http({
                method: 'PATCH',
                url: scimUrl,
                data: userData
              })
              .success(function (data, status) {
                data = data || {};
                // This code is being added temporarily to update users on Squared UC
                // Discussions are ongoing concerning how these common functions should be
                // integrated.
                if (data.entitlements && data.entitlements.indexOf(Config.entitlements.huron) !== -1) {
                  HuronUser.update(data.id, data)
                    .then(function () {
                      data.success = true;
                      callback(data, status);
                    }).catch(function (response) {
                      // Notify Huron error
                      Notification.errorResponse(response);

                      // Callback update success
                      data.success = true;
                      callback(data, status);
                    });
                } else {
                  data.success = true;
                  callback(data, status);
                }
              })
              .error(function (data, status) {
                data = data || {};
                data.success = false;
                data.status = status;
                callback(data, status);
              });
          }
        },

        inviteUsers: function (usersDataArray, entitlements, forceResend, callback) {
          var apiUrl = null;
          if (arguments.length === 3) { // if only two arguments were supplied
            if (Object.prototype.toString.call(forceResend) === '[object Function]') {
              callback = forceResend;
              apiUrl = userUrl + 'organization/' + Authinfo.getOrgId() + '/invitations';
            }
          } else if (arguments.length === 4) {
            apiUrl = userUrl + 'organization/' + Authinfo.getOrgId() + '/invitations/?resendInvite=' + forceResend;
          }

          var userData = {
            'inviteList': []
          };

          for (var i = 0; i < usersDataArray.length; i++) {
            var userEmail = usersDataArray[i].address.trim();

            var userName = null;
            if (usersDataArray[i].name) {
              userName = usersDataArray[i].name.trim();
            }

            var user = {
              'email': userEmail,
              'displayName': userName,
              'userEntitlements': null
            };
            if (entitlements) {
              user['userEntitlements'] = entitlements;
            }
            if (userEmail.length > 0) {
              userData.inviteList.push(user);
            }
          }

          if (userData.inviteList.length > 0) {

            $http.post(apiUrl, userData)
              .success(function (data, status) {
                data = data || {};
                data.success = true;
                callback(data, status);
              })
              .error(function (data, status) {
                data = data || {};
                data.success = false;
                data.status = status;
                callback(data, status);
              });
          } else {
            callback('No valid emails entered.');
          }
        },

        sendEmail: function (userEmail, adminEmail, callback) {
          var requestBody = {
            'recipientEmail': userEmail,
            'adminEmail': adminEmail
          };
          $http.post(userUrl + 'user/mail/provisioning', requestBody)
            .success(function (data, status) {
              data = data || {};
              data.success = true;
              callback(data, status);
            })
            .error(function (data, status) {
              data = data || {};
              data.success = false;
              data.status = status;
              callback(data, status);
            });
        },

        patchUserRoles: function (email, name, roles, callback) {
          var patchUrl = userUrl + '/organization/' + Authinfo.getOrgId() + '/users/roles';

          var requestBody = {
            'users': [{
              'userRoles': roles,
              'email': email,
              'name': name
            }]
          };

          $http({
              method: 'PATCH',
              url: patchUrl,
              data: requestBody
            })
            .success(function (data, status) {
              data = data || {};
              data.success = true;
              callback(data, status);
            })
            .error(function (data, status) {
              data = data || {};
              data.success = false;
              data.status = status;
              callback(data, status);
            });
        },

        migrateUsers: function (users, callback) {
          var requestBody = {
            'users': []
          };

          for (var x in users) {
            var user = {
              'email': users[x].userName
            };
            requestBody.users.push(user);
          }

          $http.post(userUrl + 'organization/' + Authinfo.getOrgId() + '/users/migrate', requestBody)
            .success(function (data, status) {
              data = data || {};
              data.success = true;
              callback(data, status);
            })
            .error(function (data, status) {
              data = data || {};
              data.success = false;
              data.status = status;
              callback(data, status);
            });
        },

        // Note there are two license arrays that can be passed
        // 'licenses' is a general array applied to all users
        // 'licensesPerUser' is an array of license arrays paired to each user in the usersDataArray
        // this latter argument is used by thinsg like CSV import
        //
        onboardUsers: function (usersDataArray, entitlements, licenses, licensesPerUser, callback, cancelPromise) {
          var userData = {
            'users': []
          };

          for (var i = 0; i < usersDataArray.length; i++) {
            var userEmail = usersDataArray[i].address.trim();
            var userName = usersDataArray[i].name;
            var displayName = usersDataArray[i].displayName;

            var user = {
              'email': null,
              'name': {
                'givenName': null,
                'familyName': null,
              },
              'userEntitlements': (entitlements && entitlements.length > 0) ? entitlements : null,
              'licenses': null
            };

            if (userEmail.length > 0) {

              user.email = userEmail;
              user.name = tokenParseFirstLastName(userName);
              if (displayName) {
                user.displayName = displayName;
              }

              // CSV import specifies licenses on a per-user basis
              if (licenses && licenses.length > 0)
                user.licenses = licenses;
              else if (licensesPerUser && licensesPerUser.length > i)
                user.licenses = licensesPerUser[i];

              userData.users.push(user);
            }
          }
          onboardUsers(userData, callback, cancelPromise);
        },

        deactivateUser: function (userData) {
          return $http.delete(userUrl + 'organization/' + Authinfo.getOrgId() + '/user?email=' + encodeURIComponent(userData.email));
        }
      };
    }
  ]);
