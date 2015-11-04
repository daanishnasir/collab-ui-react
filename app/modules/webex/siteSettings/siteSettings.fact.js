(function () {
  'use strict';

  angular.module('WebExSiteSettings').factory('WebExSiteSettingsFact', [
    '$q',
    '$log',
    '$stateParams',
    '$translate',
    'Orgservice',
    'Authinfo',
    'WebExUtilsFact',
    'WebExXmlApiFact',
    'WebExXmlApiInfoSvc',
    function (
      $q,
      $log,
      $stateParams,
      $translate,
      Orgservice,
      Authinfo,
      WebExUtilsFact,
      WebExXmlApiFact,
      webExXmlApiInfoObj
    ) {
      return {
        newSiteSettingsObj: function () {
          this.webExSiteSettingsObj = {
            viewReady: false,
            hasLoadError: false,
            sessionTicketError: false,
            allowRetry: false,
            errMsg: "",
            pageTitle: null,
            pageTitleFull: null,

            siteUrl: null,
            siteName: null,

            // siteInfo: null,
            // meetingTypesInfo: null,
            // sessionTypesInfo: null,
            settingPagesInfo: null,

            emailAllHostsBtnObj: {
              id: "emailAllHostsBtn",
              pageObj: null,
            }, // emailAllHostsBtnObj

            siteInfoCardObj: {
              id: "SiteInfo",

              licensesTotal: {
                id: "licensesTotal",
                count: null
              },

              licensesUsage: {
                id: "licensesUsage",
                count: null
              },

              licensesAvailable: {
                id: "licensesAvailable",
                count: null
              },

              siteInfoPageObj: null,
              siteFeaturesPageObj: null
            }, // siteInfoCardObj

            siteSettingCardObjs: [{
              id: "CommonSettings",
              label: null,
              comment: null,
              pageObjs: null,

              subSectionObjs: []
            }, {
              id: "MC",
              label: "Meeting Center",
              comment: null,
              pageObjs: null,

              subSectionObjs: []
            }, {
              id: "TC",
              label: "Training Center",
              comment: null,
              pageObjs: null,

              subSectionObjs: []
            }, {
              id: "SC",
              label: "Support Center",
              comment: null,
              pageObjs: null,

              subSectionObjs: [{
                id: "WebACD",
                label: "WebACD",
                pageObjs: null
              }, {
                id: "RA",
                label: "Remote Access",
                pageObjs: null
              }]
            }, {
              id: "EC",
              label: "Event Center",
              comment: null,
              pageObjs: null,

              subSectionObjs: []
            }], // siteSettingCardObjs

            categoryObjs: [{
              id: "EMAIL",
              pageObjs: []
            }, {
              id: "SiteInfo",
              pageObjs: []
            }, {
              id: "CommonSettings",
              pageObjs: []
            }, {
              id: "MC",
              pageObjs: []
            }, {
              id: "EC",
              pageObjs: []
            }, {
              id: "SC",
              pageObjs: []
            }, {
              id: "TC",
              pageObjs: []
            }, {
              id: "RA",
              pageObjs: []
            }, {
              id: "WebACD",
              pageObjs: []
            }], // categoryObjs
          }; // webExSiteSettingsObj

          return this.webExSiteSettingsObj;
        }, // newSiteSettingsObj()

        initSiteSettingsObj: function () {
          var funcName = "initSiteSettingsObj()";
          var logMsg = funcName;

          var _this = this;

          _this.newSiteSettingsObj();

          var siteUrl = (!$stateParams.siteUrl) ? '' : $stateParams.siteUrl;
          var siteName = WebExUtilsFact.getSiteName(siteUrl);
          var pageTitle = $translate.instant("webexSiteSettingsLabels.siteSettingsIndexPageTitle");
          var pageTitleFull = $translate.instant(
            "webexSiteSettingsLabels.siteSettingsIndexPageTitleFull", {
              siteUrl: siteUrl
            }
          );

          logMsg = funcName + ": " + "\n" +
            "siteUrl=" + siteUrl + "\n" +
            "siteName=" + siteName + "\n" +
            "pageTitle=" + pageTitle + "\n" +
            "pageTitleFull=" + pageTitleFull;
          $log.log(logMsg);

          _this.webExSiteSettingsObj.siteUrl = siteUrl;
          _this.webExSiteSettingsObj.siteName = siteName;
          _this.webExSiteSettingsObj.pageTitle = pageTitle;
          _this.webExSiteSettingsObj.pageTitleFull = pageTitleFull;

          _this.getSessionTicket(siteUrl).then(
            function getSessionTicketSuccess(sessionTicket) {
              var funcName = "initSiteSettingsModel().getSessionTicketSuccess()";
              var logMsg = "";

              _this.webExSiteSettingsObj.sessionTicketError = false;

              webExXmlApiInfoObj.xmlServerURL = "https://" + siteUrl + "/WBXService/XMLService";
              webExXmlApiInfoObj.webexSiteName = siteName;
              webExXmlApiInfoObj.webexAdminID = Authinfo.getPrimaryEmail();
              webExXmlApiInfoObj.webexAdminSessionTicket = sessionTicket;

              _this.getSiteSettingsInfo();
            }, // getSessionTicketSuccess()

            function getSessionTicketError(errId) {
              var funcName = "initSiteSettingsModel().getSessionTicketError()";
              var logMsg = "";

              logMsg = funcName + ": " + "errId=" + errId;
              $log.log(logMsg);

              _this.webExSiteSettingsObj.sessionTicketError = true;
            } // getSessionTicketError()
          ); // _this.getSessionTicket().then()

          return _this.webExSiteSettingsObj;
        }, // initSiteSettingsObj

        getSessionTicket: function (webexSiteUrl) {
          return WebExXmlApiFact.getSessionTicket(webexSiteUrl);
        }, //getSessionTicket()

        initXmlApiInfo: function (
          siteUrl,
          siteName,
          sessionTicket
        ) {
          webExXmlApiInfoObj.xmlServerURL = "https://" + siteUrl + "/WBXService/XMLService";
          webExXmlApiInfoObj.webexSiteName = siteName;
          webExXmlApiInfoObj.webexAdminID = Authinfo.getPrimaryEmail();
          webExXmlApiInfoObj.webexAdminSessionTicket = sessionTicket;
        }, // initXmlApiInfo()

        getSiteSettingsInfo: function () {
          var funcName = "getSiteSettingsInfo()";
          var logMsg = "";

          var _this = this;

          Orgservice.getValidLicenses().then(
            function getValidLicensesSuccess(licenses) {
              var funcName = "getValidLicensesSuccess()";
              var logMsg = "";

              logMsg = funcName + ": " + "\n" +
                "licenses=" + JSON.stringify(licenses);
              // $log.log(logMsg);

              _this.updateLicenseInfo(licenses);
            },

            function getValidLicensesError(info) {
              var funcName = "getValidLicensesError()";
              var logMsg = "";

              logMsg = funcName + ": " + "\n" +
                "info=" + JSON.stringify(info);
              $log.log(logMsg);
            }
          ); // Orgservice.getValidLicenses().then()

          _this.getSiteSettingsInfoXml().then(
            function getSiteSettingsInfoXmlSuccess(getInfoResult) {
              var funcName = "getSiteSettingsInfoXmlSuccess()";
              var logMsg = "";

              logMsg = funcName + ": " + "getInfoResult=" + JSON.stringify(getInfoResult);
              // $log.log(logMsg);

              _this.processSettingPagesInfo(WebExUtilsFact.validateAdminPagesInfoXmlData(getInfoResult.settingPagesInfoXml));
              _this.updateDisplayInfo();
              _this.webExSiteSettingsObj.viewReady = true;
            },

            function getSiteSettingsInfoXmlError(getInfoResult) {
              var funcName = "getSiteSettingsInfoXmlError()";
              var logMsg = "";

              logMsg = funcName + ": " + "getInfoResult=" + JSON.stringify(getInfoResult);
              $log.log(logMsg);
            } // getSiteSettingsInfoXmlError()
          ); // _this.getSiteSettingsInfoXml().then()
        }, // getSiteSettingsInfo()

        updateLicenseInfo: function (licenses) {
          var funcName = "updateLicenseInfo()";
          var logMsg = "";

          var _this = this;
          var updateDone = false;

          licenses.forEach(
            function checkLicense(license) {
              logMsg = funcName + ": " + "\n" +
                "license=" + JSON.stringify(license);
              // $log.log(logMsg);

              if (
                (!updateDone) &&
                ("CONFERENCING" == license.licenseType) &&
                (0 <= license.licenseId.indexOf(_this.webExSiteSettingsObj.siteUrl))
              ) {

                var licenseVolume = license.volume;
                var licenseUsage = license.usage;
                var licensesAvailable = licenseVolume - licenseUsage;

                _this.webExSiteSettingsObj.siteInfoCardObj.licensesTotal.count = licenseVolume;
                _this.webExSiteSettingsObj.siteInfoCardObj.licensesUsage.count = licenseUsage;
                _this.webExSiteSettingsObj.siteInfoCardObj.licensesAvailable.count = licensesAvailable;

                updateDone = true;
              }
            } // checkLicense()
          ); // licenses.forEach()

          logMsg = funcName + ":" + "\n" +
            "siteInfoCardObj=" + JSON.stringify(_this.webExSiteSettingsObj.siteInfoCardObj);
          // $log.log(logMsg);
        }, // updateLicenseInfo()

        processSettingPagesInfo: function (settingPagesInfo) {
          var funcName = "processSettingPagesInfo()";
          var logMsg = "";

          var _this = this;

          _this.webExSiteSettingsObj.settingPagesInfo = settingPagesInfo;

          var locale = $translate.use().replace("_", "-");
          var siteAdminNavUrls = _this.webExSiteSettingsObj.settingPagesInfo.bodyJson.ns1_siteAdminNavUrl;

          logMsg = funcName + ": " + "\n" +
            "siteAdminNavUrls.length=" + siteAdminNavUrls.length;
          $log.log(logMsg);

          siteAdminNavUrls.forEach(
            function processSiteAdminNavUrl(siteAdminNavUrl) {
              logMsg = funcName + ": " +
                "siteAdminNavUrl=" + "\n" +
                JSON.stringify(siteAdminNavUrl);
              // $log.log(logMsg);

              var category = siteAdminNavUrl.ns1_category;
              var pageId = siteAdminNavUrl.ns1_navItemId;
              var iframeUrl = siteAdminNavUrl.ns1_url;

              logMsg = funcName + ": " + "\n" +
                "category=" + category + "\n" +
                "pageId=" + pageId + "\n" +
                "iframeUrl=" + iframeUrl;
              // $log.log(logMsg);

              addPage(
                category,
                pageId,
                iframeUrl
              );
            } // processSiteAdminNavUrl()
          ); // siteAdminNavUrls.forEach()

          var emailCategoryObj = _this.getCategoryObj("EMAIL");
          var siteInfoCategoryObj = _this.getCategoryObj("SiteInfo");

          if (0 === emailCategoryObj.pageObjs.length) {
            logMsg = funcName + ": " +
              "Missing Email All Hosts page!";
            $log.log(logMsg);

            addPage(
              "EMAIL",
              "send_email_to_all",
              null
            );
          }

          var hasSiteInfoPage = false;
          var hasSiteFeaturesPage = false;

          siteInfoCategoryObj.pageObjs.forEach(
            function checkPageObj(pageObj) {
              if ("site_info" == pageObj.pageId) {
                hasSiteInfoPage = true;
              } else if ("site_features" == pageObj.pageId) {
                hasSiteFeaturesPage = true;
              }
            } // checkPageObj()
          ); // getCategoryObj().pageObjs.forEach()

          if (!hasSiteInfoPage) {
            logMsg = funcName + ": " +
              "Missing Site Information page!";
            $log.log(logMsg);

            addPage(
              "SiteInfo",
              "site_info",
              null
            );
          }

          if (!hasSiteFeaturesPage) {
            logMsg = funcName + ": " +
              "Missing Site Features page!";
            $log.log(logMsg);

            addPage(
              "SiteInfo",
              "site_features",
              null
            );
          }

          function addPage(
            categoryId,
            pageId,
            iframeUrl
          ) {

            var funcName = "addPage()";
            var logMsg = "";

            var webexPageId = categoryId + "_" + pageId;
            var indexPageLabelId = "webexSiteSettingsLabels.indexPageLabel_" + webexPageId;
            var indexPageLabel = $translate.instant(indexPageLabelId);

            var iframePageLabelId = "webexSiteSettingsLabels.iframePageLabel_" + webexPageId;
            var iframePageLabel = $translate.instant(iframePageLabelId);

            var uiSref =
              "site-settings.site-setting({" +
              "  siteUrl: " + "'" + _this.webExSiteSettingsObj.siteUrl + "'" + "," +
              "  webexPageId: " + "'" + webexPageId + "'" + "," +
              "  settingPageIframeUrl: " + "'" + iframeUrl + "'" +
              "})";

            var newPageObj = {
              id: webexPageId,
              pageId: pageId,
              label: indexPageLabel,
              iframeUrl: iframeUrl,
              uiSref: uiSref
            };

            logMsg = funcName + ": " + "\n" +
              "newPageObj=" + JSON.stringify(newPageObj);
            // $log.log(logMsg);

            var categoryObj = _this.getCategoryObj(categoryId);
            if (null == categoryObj) {
              logMsg = funcName + ": " +
                categoryId + " cannot be processed!!!";
              $log.log(logMsg);
            } else {
              var pageInsertionDone = false;
              var pageIndex = 0;

              categoryObj.pageObjs.forEach(
                function checkPageObj(pageObj) {
                  if (!pageInsertionDone) {
                    var localeCompareResult = newPageObj.label.localeCompare(
                      pageObj.label,
                      locale
                    );

                    logMsg = funcName + ": " +
                      "pageObj.label=" + pageObj.label + "\n" +
                      "newPageObj.label=" + newPageObj.label + "\n" +
                      "localeCompareResult=" + localeCompareResult;
                    // $log.log(logMsg);

                    if (localeCompareResult < 0) {
                      logMsg = funcName + ": " +
                        "Page obj inserted" + "\n" +
                        "newPageObj=" + JSON.stringify(newPageObj);
                      // $log.log(logMsg);

                      categoryObj.pageObjs.splice(pageIndex, 0, newPageObj);

                      pageInsertionDone = true;
                    } else if (localeCompareResult === 0) {
                      logMsg = funcName + ": " +
                        "Page obj updated" + "\n" +
                        "pageObj=" + JSON.stringify(pageObj) + "\n" +
                        "newPageObj=" + JSON.stringify(newPageObj);
                      $log.log(logMsg);

                      pageObj.id = newPageObj.id;
                      pageObj.pageId = newPageObj.pageId;
                      pageObj.label = newPageObj.label;
                      pageObj.iframeUrl = newPageObj.iframeUrl;
                      pageObj.uiSref = newPageObj.uiSref;

                      pageInsertionDone = true;
                    }
                  }

                  ++pageIndex;
                } // checkPageObj()
              ); // categoryObj.pageObjs.forEach()

              if (!pageInsertionDone) {
                logMsg = funcName + ": " +
                  "Page obj pushed" + "\n" +
                  "newPageObj=" + JSON.stringify(newPageObj);
                // $log.log(logMsg);

                categoryObj.pageObjs.push(newPageObj);
              }
            }
          } // addPage()
        }, // processSettingPagesInfo()

        updateDisplayInfo: function () {
          var funcName = "updateDisplayInfo()";
          var logMsg = "";

          var _this = this;

          updateEmailAllHostsBtnObj();
          updateSiteInfoCardObj();
          updateSiteSettingCardObjs();

          function updateEmailAllHostsBtnObj() {
            var btnLabel = $translate.instant("webexSiteSettingsLabels.emailAllHostsBtnTitle");

            _this.webExSiteSettingsObj.emailAllHostsBtnObj.pageObj = _this.getCategoryObj("EMAIL").pageObjs[0];
          } // updateEmailAllHostsBtnObj()

          function updateSiteInfoCardObj() {
            var funcName = "updateSiteInfoCardObj()";
            var logMsg = "";

            _this.getCategoryObj(_this.webExSiteSettingsObj.siteInfoCardObj.id).pageObjs.forEach(
              function checkPageObj(pageObj) {
                if (pageObj.pageId == "site_info") {
                  _this.webExSiteSettingsObj.siteInfoCardObj.siteInfoPageObj = pageObj;
                } else if (pageObj.pageId == "site_features") {
                  _this.webExSiteSettingsObj.siteInfoCardObj.siteFeaturePageObj = pageObj;
                }
              } // checkPageObj()
            ); // getCategoryObj("siteInfo").pageObjs.forEach()

            logMsg = funcName + ": " + "\n" +
              "siteInfoPageObj=" + JSON.stringify(_this.webExSiteSettingsObj.siteInfoCardObj.siteInfoPageObj);
            // $log.log(logMsg);

            logMsg = funcName + ": " + "\n" +
              "siteFeaturePageObj=" + JSON.stringify(_this.webExSiteSettingsObj.siteInfoCardObj.siteFeaturePageObj);
            // $log.log(logMsg);
          } // updateSiteInfoCardObj()

          function updateSiteSettingCardObjs() {
            var funcName = "updateSiteSettingCardObjs()";
            var logMsg = "";

            _this.webExSiteSettingsObj.siteSettingCardObjs.forEach(
              function updateCenterSettingsCardObj(siteSettingCardObj) {
                var funcName = "updateCenterSettingsCardObj()";
                var logMsg = "";

                var siteSettingCardObjId = siteSettingCardObj.id;

                if ("CommonSettings" == siteSettingCardObjId) {
                  siteSettingCardObj.label = $translate.instant("webexSiteSettingsLabels.commonSettingsCardTitle");
                  siteSettingCardObj.comment = $translate.instant("webexSiteSettingsLabels.commonSettingsCardNote");
                }

                var categoryObj = _this.getCategoryObj(siteSettingCardObjId);
                siteSettingCardObj.pageObjs = categoryObj.pageObjs;

                siteSettingCardObj.subSectionObjs.forEach(
                  function updateSubSectionObj(subSectionObj) {
                    categoryObj = _this.getCategoryObj(subSectionObj.id);
                    subSectionObj.pageObjs = categoryObj.pageObjs;
                  }
                ); // subSectionObjs.forEach()

                logMsg = funcName + ": " + "\n" +
                  "siteSettingCardObjs=" + JSON.stringify(siteSettingCardObj);
                // $log.log(logMsg);
              } // updateCenterSettingsCardObj()
            ); // siteSettingCardObjs.forEach()
          } // updateSiteSettingCardObjs()
        }, // updateDisplayInfo()

        getCenterSettingsCardObj: function (centerId) {
          var funcName = "getCenterSettingsCardObj()";
          var logMsg = "";

          var result = null;

          this.webExSiteSettingsObj.siteSettingCardObjs.forEach(
            function checkCenterSettingxCardObj(siteSettingCardObj) {
              if (centerId == siteSettingCardObj.id) {
                result = siteSettingCardObj;
              }
            } // checkCenterSettingxCardObj()
          ); // siteSettingCardObjs.forEach()

          logMsg = funcName + ": " + "\n" +
            "centerId=" + centerId + "\n" +
            "siteSettingCardObj=" + JSON.stringify(result);
          // $log.log(logMsg);

          return result;
        }, // getCenterSettingsCardObj()

        getCategoryObj: function (categoryId) {
          var funcName = "getCategoryObj()";
          var logMsg = "";

          var result = null;

          this.webExSiteSettingsObj.categoryObjs.forEach(
            function checkCategoryObj(categoryObj) {
              if (categoryId == categoryObj.id) {
                result = categoryObj;
              }
            } // checkCategoryObj()
          ); // categoryObjs.forEach()

          logMsg = funcName + ": " + "\n" +
            "categoryId=" + categoryId + "\n" +
            "categoryObj=" + JSON.stringify(result);
          // $log.log(logMsg);

          return result;
        }, // getCategoryObj()

        getSiteSettingsInfoXml: function () {
          var siteInfoXml = WebExXmlApiFact.getSiteInfo(webExXmlApiInfoObj);
          // var meetingTypesInfoXml = WebExXmlApiFact.getMeetingTypeInfo(webExXmlApiInfoObj);
          var settingPagesInfoXml = WebExXmlApiFact.getAdminPagesInfo(
            true,
            webExXmlApiInfoObj
          );

          return $q.all({
            // siteInfoXml: siteInfoXml,
            // meetingTypesInfoXml: meetingTypesInfoXml,
            settingPagesInfoXml: settingPagesInfoXml
          });
        }, // getSiteSettingsInfoXml()
      }; // return
    } // function()
  ]);
})();
