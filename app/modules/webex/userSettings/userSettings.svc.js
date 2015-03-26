'use strict';

angular.module('WebExUserSettings')
  .service('WebexUserSettingsSvc', [
    function WebexUserSettingsModel() {
      return {
        sessionTypes: null,

        meetingCenter: {
          id: "MC",
          label: "Meeting Center",
          serviceType: "MeetingCenter",
          isSiteEnabled: false
        }, // meetingCenter

        trainingCenter: {
          id: "TC",
          label: "Training Center",
          serviceType: "TrainingCenter",
          isSiteEnabled: false,

          handsOnLabAdmin: {
            id: "handsOnLabAdmin",
            label: "Hands-on Lab Admin (effective only when hands-on lab is enabled)",
            value: false,
            isSiteEnabled: false
          }
        }, // trainingCenter

        eventCenter: {
          id: "EC",
          label: "Event Center",
          serviceType: "EventCenter",
          isSiteEnabled: false,

          optimizeBandwidthUsage: {
            id: "optimizeBandwidthUsage",
            label: "Optimized bandwidth usage for attendees within the same network **", // TODO
            isSiteEnabled: true, // TODO
            value: false // TODO
          }
        }, // eventCenter

        supportCenter: {
          id: "SC",
          label: "Support Center",
          serviceType: "SupportCenter",
          isSiteEnabled: false
        }, // supportCenter

        collabMeetingRoom: {
          id: "collabMeetingRoom",
          label: "Collabration Room Cloud Service",
          isSiteEnabled: false,
          value: false
        }, // collabMeetingRoom

        generalSettings: {
          label: "General Settings",

          hiQualVideo: {
            id: "hiQualVideo",
            label: "Turn on high-quality video (360p) **",
            isSiteEnabled: true, // TODO
            value: false, // TODO

            hiDefVideo: {
              id: "hiDefVideo",
              label: "Turn on high-definition video video (720p) **", // TODO
              value: false // TODO
            }
          }
        }, // generalSettings

        telephonyPriviledge: {
          label: "Telephony Privilege",

          callInTeleconf: {
            id: "callInTeleconf",
            label: "Call-in teleconferencing",
            value: true,
            isSiteEnabled: false,
            selectedCallInTollType: 0,

            callInTollTypes: [{
              label: "Toll",
              value: 1,
              id: "tollOnly",
              name: "callInTollType",
              isDisabled: true
            }, {
              label: "Toll free",
              value: 2,
              id: "tollFreeOnly",
              name: "callInTollType",
              isDisabled: true
            }, {
              label: "Toll & Toll free",
              value: 3,
              id: "tollAndTollFree",
              name: "callInTollType",
              isDisabled: true
            }],

            teleconfViaGlobalCallin: {
              id: "teleconfViaGlobalCallin",
              label: "Allow access to teleconference via global call-in numbers *", // TODO
              isSiteEnabled: true, // TODO
              value: false
            },

            cliAuth: {
              id: "cliAuth",
              label: "Enable teleconferencing CLI authentication **",
              isSiteEnabled: true, // TODO
              value: false, // TODO

              reqPinEnabled: {
                id: "reqPinEnabled",
                label: "Host and attendees must have PIN enabled **", // TODO
                value: false // TODO
              }
            }
          }, // callInTeleconf

          callBackTeleconf: {
            id: "callBackTeleconf",
            label: "Call-back teleconferencing",
            isSiteEnabled: false,
            value: false,

            globalCallBackTeleconf: {
              id: "globalCallBackTeleconf",
              label: "Global call-back teleconferencing",
              value: false
            },
          },

          otherTeleconfServices: {
            id: "otherTeleconfServices",
            label: "Other teleconference services *", // TODO
            isSiteEnabled: true, // TODO
            value: false
          },

          integratedVoIP: {
            id: "integratedVoIP",
            label: "Integrated VoIP",
            isSiteEnabled: false,
            value: false
          },

          teleConfCallIn: false,
          teleConfTollFreeCallIn: false,
        }, // telephonyPriviledges
      }; // return
    } // WebexUserSettingsModel
  ]); // service
