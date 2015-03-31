(function () {
  'use strict';

  angular.module('WebExUserSettings').factory('WebExUserSettingsFact', [
    '$q',
    '$log',
    '$stateParams',
    '$translate',
    'XmlApiFact',
    'WebexUserSettingsSvc',
    'XmlApiInfoSvc',
    'Authinfo',
    function (
      $q,
      $log,
      $stateParams,
      $translate,
      XmlApiFact,
      userSettingsModel,
      xmlApiInfo,
      Authinfo
    ) {
      return {
        validateXmlData: function (
          commentText,
          infoXml,
          startOfBodyStr,
          endOfBodyStr
        ) {
          var funcName = "validateXmlData()";
          var logMsg = "";

          logMsg = funcName + ": " + "\n" +
            "commentText=" + commentText + "\n" +
            "infoXml=\n" + infoXml + "\n" +
            "startOfBodyStr=" + startOfBodyStr + "\n" +
            "endOfBodyStr=" + endOfBodyStr;
          // $log.log(logMsg);

          var headerJson = XmlApiFact.xml2JsonConvert(
            commentText + " Header",
            infoXml,
            "<serv:header>",
            "<serv:body>"
          ).body;

          var bodyJson = XmlApiFact.xml2JsonConvert(
            commentText,
            infoXml,
            startOfBodyStr,
            endOfBodyStr
          ).body;

          var errReason = "";
          var errId = "";
          if ("SUCCESS" != headerJson.serv_header.serv_response.serv_result) {
            errReason = headerJson.serv_header.serv_response.serv_reason;
            errId = headerJson.serv_header.serv_response.serv_exceptionID;

            logMsg = funcName + ": " + "ERROR!!!" + "\n" +
              "headerJson=\n" + JSON.stringify(headerJson) + "\n" +
              "errReason=\n" + errReason;
            $log.log(logMsg);
          }

          var result = {
            headerJson: headerJson,
            bodyJson: bodyJson,
            errId: errId,
            errReason: errReason
          };

          return result;
        }, // validateXmlData()

        initUserSettingsModel: function () {
          userSettingsModel.viewReady = false;
          userSettingsModel.loadError = false;

          userSettingsModel.meetingCenter.label = "Meeting Center";

          userSettingsModel.trainingCenter.label = "Training Center";
          userSettingsModel.trainingCenter.handsOnLabAdmin.label = $translate.instant("webexUserSettingLabels.handsOnLabAdminLabel");

          userSettingsModel.eventCenter.label = "Event Center";
          userSettingsModel.eventCenter.optimizeBandwidthUsage.label = $translate.instant("webexUserSettingLabels.optimizeBandwidthUsageLabel");

          userSettingsModel.supportCenter.label = "Support Center";

          userSettingsModel.videoSettings.label = $translate.instant("webexUserSettingLabels.videoSettingsLabel");
          userSettingsModel.videoSettings.hiQualVideo.label = $translate.instant("webexUserSettingLabels.hiQualVideoLabel");
          userSettingsModel.videoSettings.hiQualVideo.hiDefVideo.label = $translate.instant("webexUserSettingLabels.hiDefVideoLabel");

          userSettingsModel.telephonyPriviledge.label = $translate.instant("webexUserSettingLabels.telephonyPrivilegesLabel");
          userSettingsModel.telephonyPriviledge.callInTeleconf.label = $translate.instant("webexUserSettingLabels.callInTeleconfLabel");
          userSettingsModel.telephonyPriviledge.callInTeleconf.callInTollTypes[0].label = $translate.instant("webexUserSettingLabels.tollOnlyLabel");
          userSettingsModel.telephonyPriviledge.callInTeleconf.callInTollTypes[1].label = $translate.instant("webexUserSettingLabels.tollFreeOnlyLabel");
          userSettingsModel.telephonyPriviledge.callInTeleconf.callInTollTypes[2].label = $translate.instant("webexUserSettingLabels.tollAndTollFreeLabel");
          userSettingsModel.telephonyPriviledge.callInTeleconf.teleconfViaGlobalCallin.label = $translate.instant("webexUserSettingLabels.teleconfViaGlobalCallinLabel");
          userSettingsModel.telephonyPriviledge.callInTeleconf.cliAuth.label = $translate.instant("webexUserSettingLabels.cliAuthLabel");
          userSettingsModel.telephonyPriviledge.callInTeleconf.cliAuth.reqPinEnabled.label = $translate.instant("webexUserSettingLabels.reqPinEnabledLabel");
          userSettingsModel.telephonyPriviledge.callBackTeleconf.label = $translate.instant("webexUserSettingLabels.callBackTeleconfLabel");
          userSettingsModel.telephonyPriviledge.callBackTeleconf.globalCallBackTeleconf.label = $translate.instant("webexUserSettingLabels.globalCallBackTeleconfLabel");
          userSettingsModel.telephonyPriviledge.otherTeleconfServices.label = $translate.instant("webexUserSettingLabels.otherTeleconfServicesLabel");
          userSettingsModel.telephonyPriviledge.integratedVoIP.label = $translate.instant("webexUserSettingLabels.integratedVoIPLaabel");

          return userSettingsModel;
        }, // initUserSettingsModel()

        initXmlApiInfo: function (
          webexSiteUrl,
          webexSiteName,
          webexAdminSessionTicket
        ) {
          xmlApiInfo.xmlServerURL = "https://" + webexSiteUrl + "/WBXService/XMLService";
          xmlApiInfo.webexSiteName = webexSiteName;
          xmlApiInfo.webexAdminID = Authinfo.getUserName();
          xmlApiInfo.webexAdminSessionTicket = webexAdminSessionTicket;
          xmlApiInfo.webexUserId = $stateParams.currentUser.userName;
        }, // initXmlApiInfo()

        updateUserSettingsModel: function () {
          var funcName = "updateUserSettingsModel()";
          var logMsg = null;

          var userInfoJson = userSettingsModel.userInfo.bodyJson;
          var siteInfoJson = userSettingsModel.siteInfo.bodyJson;
          var meetingTypesInfoJson = userSettingsModel.meetingTypesInfo.bodyJson;

          //---------------- start of center status update ----------------//
          var siteServiceTypes = [].concat(siteInfoJson.ns1_siteInstance.ns1_metaData.ns1_serviceType);

          siteServiceTypes.forEach(function (siteServiceType) {
            if (siteServiceType == userSettingsModel.meetingCenter.label) {
              userSettingsModel.meetingCenter.isSiteEnabled = true;
            } else if (siteServiceType == userSettingsModel.eventCenter.label) {
              userSettingsModel.eventCenter.isSiteEnabled = true;
            } else if (siteServiceType == userSettingsModel.trainingCenter.label) {
              userSettingsModel.trainingCenter.isSiteEnabled = true;
            } else if (siteServiceType == userSettingsModel.supportCenter.label) {
              userSettingsModel.supportCenter.isSiteEnabled = true;
            }
          }); // siteServiceTypes.forEach()
          //---------------- end of center status update ----------------//

          //---------------- start of session types update ----------------//
          var sessionTypes = [];
          if (null != meetingTypesInfoJson.mtgtype_meetingType) {
            var siteMeetingTypes = [].concat(meetingTypesInfoJson.mtgtype_meetingType);

            siteMeetingTypes.forEach(function (siteMeetingType) {
              var siteMtgServiceTypeID = siteMeetingType.mtgtype_meetingTypeID;
              var siteMtgProductCodePrefix = siteMeetingType.mtgtype_productCodePrefix;
              var siteMtgDisplayName = siteMeetingType.mtgtype_displayName;
              var siteMtgServiceTypes = [].concat(siteMeetingType.mtgtype_serviceTypes.mtgtype_serviceType);

              var meetingCenterApplicable = false;
              var trainingCenterApplicable = false;
              var eventCenterApplicable = false;
              var supportCenterApplicable = false;

              siteMtgServiceTypes.forEach(function (siteMtgServiceType) {
                if (userSettingsModel.meetingCenter.serviceType == siteMtgServiceType) {
                  meetingCenterApplicable = true;
                } else if (userSettingsModel.eventCenter.serviceType == siteMtgServiceType) {
                  if ("AUO" != siteMtgProductCodePrefix) {
                    eventCenterApplicable = true;
                  }
                } else if (userSettingsModel.trainingCenter.serviceType == siteMtgServiceType) {
                  if ("AUO" != siteMtgProductCodePrefix) {
                    trainingCenterApplicable = true;
                  }
                } else if (userSettingsModel.supportCenter.serviceType == siteMtgServiceType) {
                  if (
                    ("SMT" != siteMtgProductCodePrefix) &&
                    ("AUO" != siteMtgProductCodePrefix)
                  ) {
                    supportCenterApplicable = true;
                  }
                }
              }); // siteMtgServiceTypes.forEach()

              var sessionType = {
                id: "sessionType-" + siteMtgServiceTypeID,
                sessionTypeId: siteMtgServiceTypeID,
                sessionName: siteMtgProductCodePrefix,
                sessionDescription: siteMtgDisplayName,
                meetingCenterApplicable: meetingCenterApplicable,
                trainingCenterApplicable: trainingCenterApplicable,
                eventCenterApplicable: eventCenterApplicable,
                supportCenterApplicable: supportCenterApplicable,
                sessionEnabled: false
              }; // sessionType

              sessionTypes.push(sessionType);
            }); // siteMeetingTypes.forEach()
          }

          userSettingsModel.sessionTypes = sessionTypes;
          var enabledSessionTypesIDs = [].concat(userInfoJson.use_meetingTypes.use_meetingType);

          logMsg = funcName + ": " + "\n" +
            "enabledSessionTypesIDs=" + enabledSessionTypesIDs;
          // $log.log(logMsg);

          enabledSessionTypesIDs.forEach(function (enabledSessionTypeID) { // loop through user's enabled session type
            userSettingsModel.sessionTypes.forEach(function (sessionType) {
              var sessionTypeId = sessionType.sessionTypeId;

              logMsg = funcName + ": " + "\n" +
                "enabledSessionTypeID=" + enabledSessionTypeID + "\n" +
                "sessionTypeId=" + sessionTypeId;
              // $log.log(logMsg);

              if (sessionType.sessionTypeId == enabledSessionTypeID) {
                sessionType.sessionEnabled = true;
              }
            }); // userSettingsModel.sessionTypes.forEach()
          }); // enabledSessionTypesIDs.forEach()
          //---------------- end of session types update ----------------//

          //---------------- start of user privileges update -----------------//
          // General
          // TODO:
          //   if (???) {
          //     userSettingsModel.videoSettings.hiQualVideo.isSiteEnabled = true;
          //   }
          //
          //   if (???) {
          //     userSettingsModel.videoSettings.hiQualVideo.value = true;
          //   }
          //
          //   if (???) {
          //     userSettingsModel.videoSettings.hiQualVideo.hiDefVideo.value = true;
          //   }

          // Telephony
          if ("true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_callInTeleconferencing) {
            userSettingsModel.telephonyPriviledge.callInTeleconf.isSiteEnabled = true;

            if ("true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_hybridTeleconference) {
              userSettingsModel.telephonyPriviledge.callInTeleconf.callInTollTypes[0].isDisabled = false;
              userSettingsModel.telephonyPriviledge.callInTeleconf.callInTollTypes[1].isDisabled = false;
              userSettingsModel.telephonyPriviledge.callInTeleconf.callInTollTypes[2].isDisabled = false;
            } else {
              if ("true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_tollFreeCallinTeleconferencing) {
                userSettingsModel.telephonyPriviledge.callInTeleconf.callInTollTypes[0].isDisabled = true;
                userSettingsModel.telephonyPriviledge.callInTeleconf.callInTollTypes[1].isDisabled = false;
                userSettingsModel.telephonyPriviledge.callInTeleconf.callInTollTypes[2].isDisabled = true;
              } else {
                userSettingsModel.telephonyPriviledge.callInTeleconf.callInTollTypes[0].isDisabled = true;
                userSettingsModel.telephonyPriviledge.callInTeleconf.callInTollTypes[1].isDisabled = true;
                userSettingsModel.telephonyPriviledge.callInTeleconf.callInTollTypes[2].isDisabled = false;
              }
            }
          }

          if (
            ("true" == userInfoJson.use_privilege.use_teleConfCallIn) &&
            ("true" == userInfoJson.use_privilege.use_teleConfTollFreeCallIn)
          ) {
            userSettingsModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType = 3;
          } else if ("true" == userInfoJson.use_privilege.use_teleConfTollFreeCallIn) {
            userSettingsModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType = 2;
          } else {
            userSettingsModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType = 1;
          }

          logMsg = funcName + ": " + "\n" +
            "ns1_callInTeleconferencing=" + siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_callInTeleconferencing + "\n" +
            "ns1_hybridTeleconference=" + siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_hybridTeleconference + "\n" +
            "ns1_tollFreeCallinTeleconferencing=" + siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_tollFreeCallinTeleconferencing + "\n" +
            "use_teleConfCallIn=" + userInfoJson.use_privilege.use_teleConfCallIn + "\n" +
            "use_teleConfTollFreeCallIn=" + userInfoJson.use_privilege.use_teleConfTollFreeCallIn + "\n" +
            "callInTeleconf.selectedCallInTollType=" + userSettingsModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType + "\n" +
            "callInTollTypes[0].isDisabled=" + userSettingsModel.telephonyPriviledge.callInTeleconf.callInTollTypes[0].isDisabled + "\n" +
            "callInTollTypes[1].isDisabled=" + userSettingsModel.telephonyPriviledge.callInTeleconf.callInTollTypes[1].isDisabled + "\n" +
            "callInTollTypes[2].isDisabled=" + userSettingsModel.telephonyPriviledge.callInTeleconf.callInTollTypes[2].isDisabled;
          $log.log(logMsg);

          // TODO:
          //   if (???) {
          //     userSettingsModel.telephonyPriviledge.callInTeleconf.value = true;
          //   }

          // TODO:
          //   if (???) {
          //     userSettingsModel.telephonyPriviledge.callInTeleconf.teleconfViaGlobalCallin.isSiteEnabled = true;
          //   }

          if ("true" == userInfoJson.use_privilege.use_teleConfCallInInternational) {
            userSettingsModel.telephonyPriviledge.callInTeleconf.teleconfViaGlobalCallin.value = true;
          }

          // TODO:
          //   if (???) {
          //     userSettingsModel.telephonyPriviledge.callInTeleconf.cliAuth.isSiteEnabled == true;
          //

          // TODO:
          //   if (???) {
          //     userSettingsModel.telephonyPriviledge.callInTeleconf.cliAuth.value = true;
          //   }

          // TODO:
          //   if (???) {
          //      userSettingsModel.telephonyPriviledge.callInTeleconf.cliAuth.reqPinEnabled.value = true;
          //   }

          if ("true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_callBackTeleconferencing) {
            userSettingsModel.telephonyPriviledge.callBackTeleconf.isSiteEnabled = true;
          }

          if ("true" == userInfoJson.use_privilege.use_teleConfCallOut) {
            userSettingsModel.telephonyPriviledge.callBackTeleconf.value = true;
          }

          if ("true" == userInfoJson.use_privilege.use_teleConfCallOutInternational) {
            userSettingsModel.telephonyPriviledge.callBackTeleconf.globalCallBackTeleconf.value = true;
          }

          // TODO:
          //   if (???) {
          //     userSettingsModel.telephonyPriviledge.otherTeleconfServices.isSiteEnabled = true;
          //   }

          if ("true" == userInfoJson.use_privilege.use_otherTelephony) {
            userSettingsModel.telephonyPriviledge.otherTeleconfServices.value = true;
          }

          if ("true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_internetPhone) {
            userSettingsModel.telephonyPriviledge.integratedVoIP.isSiteEnabled = true;
          }

          if ("true" == userInfoJson.use_privilege.use_voiceOverIp) {
            userSettingsModel.telephonyPriviledge.integratedVoIP.value = true;
          }

          // Event Center
          // TODO:
          //   if (???) {
          //     userSettingsModel.eventCenter.optimizeBandwidthUsage.isSitenEnabled = true;
          //   }
          //
          //   if (???) {
          //     userSettingsModel.eventCenter.optimizeBandwidthUsage.value = true;
          //   }

          // Training Center
          if ("true" == siteInfoJson.ns1_siteInstance.ns1_tools.ns1_handsOnLab) {
            userSettingsModel.trainingCenter.handsOnLabAdmin.isSiteEnabled = true;
          }

          if ("true" == userInfoJson.use_privilege.use_labAdmin) {
            userSettingsModel.trainingCenter.handsOnLabAdmin.value = true;
          }
          //---------------- end of user privileges update -----------------//

        }, // updateUserSettingsModel()

        getUserInfoXml: function () {
          var xmlData = XmlApiFact.getUserInfo(xmlApiInfo);

          return $q.all(xmlData);
        }, // getUserInfoXml()

        getSiteInfoXml: function () {
          var xmlData = XmlApiFact.getSiteInfo(xmlApiInfo);

          return $q.all(xmlData);
        }, // getSiteInfoXml()

        getMeetingTypeInfoXml: function () {
          var xmlData = XmlApiFact.getMeetingTypeInfo(xmlApiInfo);

          return $q.all(xmlData);
        }, // getMeetingTypeInfoXml()

        getUserSettingsInfoXml: function () {
          var userInfoXml = XmlApiFact.getUserInfo(xmlApiInfo);
          var siteInfoXml = XmlApiFact.getSiteInfo(xmlApiInfo);
          var meetingTypesInfoXml = XmlApiFact.getMeetingTypeInfo(xmlApiInfo);

          return $q.all({
            userInfoXml: userInfoXml,
            siteInfoXml: siteInfoXml,
            meetingTypesInfoXml: meetingTypesInfoXml
          });
        }, // getUserSettingsInfoXml()

        getUserSettingsInfo: function () {
          var _self = this;

          angular.element('#reloadBtn').button('loading');

          this.getUserSettingsInfoXml().then(
            function getUserSettingsInfoXmlSuccess(getInfoResult) {
              var funcName = "getUserSettingsInfo().getUserSettingsInfoSuccess()";
              var logMsg = "";

              userSettingsModel.userInfo = _self.validateXmlData(
                "User Data",
                getInfoResult.userInfoXml,
                "<use:",
                "</serv:bodyContent>"
              );

              userSettingsModel.siteInfo = _self.validateXmlData(
                "Site Info",
                getInfoResult.siteInfoXml,
                "<ns1:",
                "</serv:bodyContent>"
              );

              userSettingsModel.meetingTypesInfo = _self.validateXmlData(
                "Meeting Types Info",
                getInfoResult.meetingTypesInfoXml,
                "<mtgtype:",
                "</serv:bodyContent>"
              );

              if (
                ("" === userSettingsModel.userInfo.errId) &&
                ("" === userSettingsModel.siteInfo.errId) &&
                ("" === userSettingsModel.meetingTypesInfo.errId)
              ) {

                _self.updateUserSettingsModel();

                userSettingsModel.viewReady = true;
                userSettingsModel.loadError = false;
              } else { // xmlapi returns error
                logMsg = funcName + ": " + "\n" +
                  "userInfo.errId=" + userSettingsModel.userInfo.errId + "\n" +
                  "userInfo.errReason=" + userSettingsModel.userInfo.errReason + "\n" +
                  "siteInfo.errId=" + userSettingsModel.siteInfo.errId + "\n" +
                  "siteInfo.errReason=" + userSettingsModel.siteInfo.errReason + "\n" +
                  "meetingTypesInfo.errId=" + userSettingsModel.meetingTypesInfo.errId + "\n" +
                  "meetingTypesInfo.errReason=" + userSettingsModel.meetingTypesInfo.errReason;
                $log.log(logMsg);

                logMsg = funcName + ": " + "\n" +
                  "Error message=[" + $translate.instant('webexUserSettingsAccessErrors.' + "errCode-" + userSettingsModel.userInfo.errId) + "]";
                $log.log("logMsg");

                if ("030001" == userSettingsModel.userInfo.errId) {
                  logMsg = funcName + ": " + "Corresponding User not found!!!";
                  $log.log(logMsg);
                } else {
                  // TODO
                  //   handle all other errors
                  logMsg = funcName + ": " + "OTHER ERROR!!!";
                  $log.log(logMsg);
                }

                userSettingsModel.viewReady = false;
                userSettingsModel.loadError = true;
              } // xmlapi returns error

              angular.element('#reloadBtn').button('reset'); //Reset "try again" button to normal state
            }, // getUserSettingsInfoXmlSuccess()

            function getUserSettingsInfoXmlError(getInfoResult) {
              var funcName = "getUserSettingsInfoXmlError()";
              var logMsg = "";

              logMsg = funcName + ": " + "getInfoResult=" + JSON.stringify(getInfoResult);
              $log.log(logMsg);
            } // getUserSettingsInfoXmlError()
          ); // WebExUserSettingsFact.getUserSettingsInfoXml()
        }, // getUserSettingsInfo()

        updateUserSettings: function (userSettings) {
          return XmlApiFact.updateUserSettings(xmlApiInfo, userSettings);
        },

        updateUserSettings2: function () {
          var funcName = "updateUserSettings2()";
          var logMsg = "";

          var teleConfCallIn = false;
          var teleConfTollFreeCallIn = false;

          switch (userSettingsModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType) {
          case 3:
            teleConfCallIn = true;
            teleConfTollFreeCallIn = true;
            break;

          case 2:
            teleConfTollFreeCallIn = true;
            break;

          case 1:
            teleConfCallIn = true;
            break;

          default:
            break;
          }

          logMsg = funcName + ": " + "\n" +
            "selectedCallInTollType=" + userSettingsModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType + "\n" +
            "teleConfCallIn=" + teleConfCallIn + "\n" +
            "teleConfTollFreeCallIn=" + teleConfTollFreeCallIn;
          // $log.log(logMsg);

          userSettingsModel.telephonyPriviledge.teleConfCallIn = teleConfCallIn;
          userSettingsModel.telephonyPriviledge.teleConfTollFreeCallIn = teleConfTollFreeCallIn;

          if (!userSettingsModel.telephonyPriviledge.callInTeleconf.cliAuth.value) {
            userSettingsModel.telephonyPriviledge.callInTeleconf.cliAuth.reqPinEnabled = false;
          }

          xmlApiInfo.teleConfCallIn = userSettingsModel.telephonyPriviledge.teleConfCallIn;
          xmlApiInfo.teleConfTollFreeCallIn = userSettingsModel.telephonyPriviledge.teleConfTollFreeCallIn;
          xmlApiInfo.teleconfViaGlobalCallin = userSettingsModel.telephonyPriviledge.callInTeleconf.teleconfViaGlobalCallin.value;
          xmlApiInfo.callBackTeleconf = userSettingsModel.telephonyPriviledge.callBackTeleconf.value;
          xmlApiInfo.globalCallBackTeleconf = userSettingsModel.telephonyPriviledge.callBackTeleconf.globalCallBackTeleconf.value;
          xmlApiInfo.otherTelephony = userSettingsModel.telephonyPriviledge.otherTeleconfServices.value;
          xmlApiInfo.integratedVoIP = userSettingsModel.telephonyPriviledge.integratedVoIP.value;
          xmlApiInfo.handsOnLabAdmin = userSettingsModel.trainingCenter.handsOnLabAdmin.value;

          return XmlApiFact.updateUserSettings2(xmlApiInfo);
        }, // updateUserSettings2()

        getSessionTicket: function (webexSiteUrl) {
          return XmlApiFact.getSessionTicket(webexSiteUrl);
        }, //getSessionTicket()

        getSiteUrl: function () {
          if (!$stateParams.site) {
            return "";
          }
          return $stateParams.site;
        }, //getSiteUrl

        getSiteName: function (siteUrl) {
          var index = siteUrl.indexOf(".");
          return siteUrl.slice(0, index);
        }, //getSiteName

      }; // return
    } //WebExUserSettingsFact
  ]); // angular
})();
