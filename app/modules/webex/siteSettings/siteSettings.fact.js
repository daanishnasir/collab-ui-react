(function () {
  'use strict';

  angular.module('WebExSiteSettings').factory('WebExSiteSettingsFact', [
    '$q',
    '$log',
    '$stateParams',
    '$translate',
    'Authinfo',
    'WebExUtilsFact',
    'WebExXmlApiFact',
    'WebExXmlApiInfoSvc',
    function (
      $q,
      $log,
      $stateParams,
      $translate,
      Authinfo,
      WebExUtilsFact,
      WebExXmlApiFact,
      webExXmlApiInfoObj
    ) {
      return {
        newWebExSiteSettingsObj: function (
          siteUrl,
          siteName,
          pageTitle,
          pageTitleFull
        ) {
          var infoCardObj = WebExUtilsFact.getNewInfoCardObj(
            siteUrl,
            "icon icon-circle-webex",
            "icon icon-circle-star"
          );

          var webExSiteSettingsObj = {
            viewReady: false,
            hasLoadError: false,
            sessionTicketError: false,
            errMsg: "",
            pageTitle: pageTitle,
            pageTitleFull: pageTitleFull,

            siteUrl: siteUrl,
            siteName: siteName,
            cardsSectionId: siteUrl + "-" + "cardsSection",

            // siteInfo: null,
            // meetingTypesInfo: null,
            // sessionTypesInfo: null,
            settingPagesInfo: null,

            emailAllHostsBtnObj: {
              id: "emailAllHostsBtn",
              pageObj: null,
            }, // emailAllHostsBtnObj

            siteInfoCardObj: infoCardObj,

            siteSettingCardObjs: [],
            categoryObjs: [],
          }; // webExSiteSettingsObj

          webExSiteSettingsObj.siteSettingCardObjs.push(newCardObj("CommonSettings", null));
          webExSiteSettingsObj.siteSettingCardObjs.push(newCardObj("MC", "Meeting Center"));
          webExSiteSettingsObj.siteSettingCardObjs.push(newCardObj("TC", "Training Center"));
          webExSiteSettingsObj.siteSettingCardObjs.push(newCardObj("SC", "Support Center"));
          webExSiteSettingsObj.siteSettingCardObjs.push(newCardObj("EC", "Event Center"));

          webExSiteSettingsObj.categoryObjs.push(newCategoryObj("EMAIL", ""));
          webExSiteSettingsObj.categoryObjs.push(newCategoryObj("SiteInfo", ""));
          webExSiteSettingsObj.categoryObjs.push(newCategoryObj("CommonSettings", "common_options"));
          webExSiteSettingsObj.categoryObjs.push(newCategoryObj("MC", "mc_options"));
          webExSiteSettingsObj.categoryObjs.push(newCategoryObj("EC", "ec_options"));
          webExSiteSettingsObj.categoryObjs.push(newCategoryObj("SC", "sc_options"));
          webExSiteSettingsObj.categoryObjs.push(newCategoryObj("TC", "tc_options"));
          webExSiteSettingsObj.categoryObjs.push(newCategoryObj("RA", "remote_options"));
          webExSiteSettingsObj.categoryObjs.push(newCategoryObj("WebACD", "webacd_settings"));

          return webExSiteSettingsObj;

          function newCardObj(
            cardId,
            cardLabel
          ) {
            var cardObj = {
              id: cardId,
              label: cardLabel,
              comment: null,
              pageObjs: null,
              lang: null,

              subSectionObjs: []
            };

            if ("SC" == cardId) {
              cardObj.subSectionObjs.push({
                id: "WebACD",
                label: "WebACD",
                lang: null,
                pageObjs: null
              });

              cardObj.subSectionObjs.push({
                id: "RA",
                label: "Remote Access",
                lang: null,
                pageObjs: null
              });
            }

            return cardObj;
          } // newCardObj()

          function newCategoryObj(
            categoryId,
            categoryPinPageId
          ) {

            var categoryObj = {
              id: categoryId,
              pinPageId: categoryPinPageId,
              pinPageObj: null,
              pageObjs: []
            };

            return categoryObj;
          } // newCategoryObj()
        }, // newWebExSiteSettingsObj()

        initSiteSettingsObj: function () {
          var funcName = "initSiteSettingsObj()";
          var logMsg = funcName;

          var _this = this;

          var siteUrl = $stateParams.siteUrl || "";
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

          _this.webExSiteSettingsObj = _this.newWebExSiteSettingsObj(
            siteUrl,
            siteName,
            pageTitle,
            pageTitleFull
          );

          _this.webExSiteSettingsObj.pageTitle = pageTitle;
          _this.webExSiteSettingsObj.pageTitleFull = pageTitleFull;

          WebExXmlApiFact.getSessionTicket(siteUrl).then(
            function getSessionTicketSuccess(sessionTicket) {
              var funcName = "initSiteSettingsModel().getSessionTicketSuccess()";
              var logMsg = "";

              webExXmlApiInfoObj.xmlApiUrl = "https://" + siteUrl + "/WBXService/XMLService";
              webExXmlApiInfoObj.webexSiteName = WebExUtilsFact.getSiteName(siteUrl);
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
              _this.webExSiteSettingsObj.hasLoadError = true;
            } // getSessionTicketError()
          ); // _this.getSessionTicket().then()

          return _this.webExSiteSettingsObj;
        }, // initSiteSettingsObj

        getSiteSettingsInfo: function () {
          var funcName = "getSiteSettingsInfo()";
          var logMsg = "";

          var _this = this;

          WebExUtilsFact.getWebexLicenseInfo(_this.webExSiteSettingsObj.siteUrl).then(
            function getWebexLicenseInfoSuccess(licenseInfo) {
              var funcName = "getWebexLicenseInfoSuccess()";
              var logMsg = "";

              WebExUtilsFact.setInfoCardLicenseInfo(
                licenseInfo,
                _this.webExSiteSettingsObj.siteInfoCardObj
              );

              logMsg = funcName + ": " + "\n" +
                "siteInfoCardObj=" + JSON.stringify(_this.webExSiteSettingsObj.siteInfoCardObj);
              // $log.log(logMsg);
            }, // getWebexLicenseInfoSuccess()

            function getWebexLicenseInfoError(result) {
              var funcName = "getWebexLicenseInfoError()";
              var logMsg = "";

              logMsg = funcName + ": " + "\n" +
                "result=" + JSON.stringfy(result);
              $log.log(logMsg);
            } // getWebexLicenseInfoError()
          );

          _this.getSiteSettingsInfoXml().then(
            function getSiteSettingsInfoXmlSuccess(getInfoResult) {
              var funcName = "getSiteSettingsInfoXmlSuccess()";
              var logMsg = "";

              logMsg = funcName + ": " + "getInfoResult=" + JSON.stringify(getInfoResult);
              // $log.log(logMsg);

              var settingPagesInfo = WebExUtilsFact.validateAdminPagesInfoXmlData(getInfoResult.settingPagesInfoXml);
              _this.webExSiteSettingsObj.settingPagesInfo = settingPagesInfo;

              if (
                ("" !== settingPagesInfo.errId) ||
                ("" !== settingPagesInfo.errReason)
              ) {

                _this.webExSiteSettingsObj.hasLoadError = true;
              } else {
                _this.processSettingPagesInfo(settingPagesInfo);
                _this.pinPageInCategory();
                _this.updateDisplayInfo();
                _this.webExSiteSettingsObj.viewReady = true;
              }
            },

            function getSiteSettingsInfoXmlError(getInfoResult) {
              var funcName = "getSiteSettingsInfoXmlError()";
              var logMsg = "";

              logMsg = funcName + ": " + "getInfoResult=" + JSON.stringify(getInfoResult);
              $log.log(logMsg);

              _this.webExSiteSettingsObj.hasLoadError = true;
            } // getSiteSettingsInfoXmlError()
          ); // _this.getSiteSettingsInfoXml().then()
        }, // getSiteSettingsInfo()

        processSettingPagesInfo: function (settingPagesInfo) {
          var funcName = "processSettingPagesInfo()";
          var logMsg = "";

          var _this = this;

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
          ); // siteInfoCategoryObj.pageObjs.forEach()

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
              "site-list.site-setting({" +
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
              var pinPageId = categoryObj.pinPageId;

              if (
                (null != pinPageId) &&
                (pinPageId == newPageObj.pageId)
              ) {

                categoryObj.pinPageObj = newPageObj;
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
                        // $log.log(logMsg);

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
            }
          } // addPage()
        }, // processSettingPagesInfo()

        pinPageInCategory: function () {
          var funcName = "pinPageInCategory()";
          var logMsg = "";

          this.webExSiteSettingsObj.categoryObjs.forEach(
            function checkCategoryObj(categoryObj) {
              var funcName = "pinPageInCategory().checkCategoryObj()";
              var logMsg = "";

              if (null != categoryObj.pinPageObj) {
                categoryObj.pageObjs.splice(0, 0, categoryObj.pinPageObj);
              }
            } // checkCategoryObj()
          ); // this.webExSiteSettingsObj.categoryObjs.forEach()
        }, // pinPageInCategory()

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
                  _this.webExSiteSettingsObj.siteInfoCardObj.iframeLinkObj1.iframePageObj = pageObj;
                } else if (pageObj.pageId == "site_features") {
                  _this.webExSiteSettingsObj.siteInfoCardObj.iframeLinkObj2.iframePageObj = pageObj;
                }
              } // checkPageObj()
            ); // getCategoryObj("siteInfo").pageObjs.forEach()

            logMsg = funcName + ": " + "\n" +
              "iframeLinkObj1.iframePageObj=" + JSON.stringify(_this.webExSiteSettingsObj.siteInfoCardObj.iframeLinkObj1.iframePageObj);
            // $log.log(logMsg);

            logMsg = funcName + ": " + "\n" +
              "iframeLinkObj2.iframePageObj=" + JSON.stringify(_this.webExSiteSettingsObj.siteInfoCardObj.iframeLinkObj2.iframePageObj);
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
                } else {
                  siteSettingCardObj.lang = "en"; //Centre names are in English
                }

                var categoryObj = _this.getCategoryObj(siteSettingCardObjId);
                siteSettingCardObj.pageObjs = categoryObj.pageObjs;

                siteSettingCardObj.subSectionObjs.forEach(
                  function updateSubSectionObj(subSectionObj) {
                    categoryObj = _this.getCategoryObj(subSectionObj.id);
                    subSectionObj.pageObjs = categoryObj.pageObjs;
                    subSectionObj.lang = "en"; //WebACD, Remote Acces are in English
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

        getCategoryObj: function (targetCategoryId) {
          var funcName = "getCategoryObj()";
          var logMsg = "";

          var result = null;

          this.webExSiteSettingsObj.categoryObjs.forEach(
            function checkCategoryObj(categoryObj) {
              if (targetCategoryId == categoryObj.id) {
                result = categoryObj;
              }
            } // checkCategoryObj()
          ); // categoryObjs.forEach()

          logMsg = funcName + ": " + "\n" +
            "targetCategoryId=" + targetCategoryId + "\n" +
            "categoryObj=" + JSON.stringify(result);
          // $log.log(logMsg);

          return result;
        }, // getCategoryObj()

        getSiteSettingsInfoXml: function () {
          // var siteInfoXml = WebExXmlApiFact.getSiteInfo(webExXmlApiInfoObj);
          // var meetingTypesInfoXml = WebExXmlApiFact.getMeetingTypeInfo(webExXmlApiInfoObj);
          var settingPagesInfoXml = WebExXmlApiFact.getSettingPagesInfo(webExXmlApiInfoObj);

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
