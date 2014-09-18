'use strict';

angular.module('Squared')
  .controller('SpacesCtrl', ['$scope', '$location', 'Auth', 'Storage', 'Log', 'Utils', '$filter', 'SpacesService', 'Authinfo', 'Notification', 'Config',
    function($scope, $location, Auth, Storage, Log, Utils, $filter, SpacesService, Authinfo, Notification, Config) {

      //Populating authinfo data if empty.
      var token = Storage.get('accessToken');
      if (Auth.isAuthorized($scope)) {
        Log.debug('Authinfo data is loaded.');
      }

      var rooms = [];
      var getDummyData = function() {
        rooms.push({'room': 'Moroni', 'code': 1234, 'activationDate': ''});
        rooms.push({'room': 'Tiancum', 'code': 1234, 'activationDate':''});
        rooms.push({'room': 'Jacob', 'code': '', 'activationDate': 'Jan 4 2014'});
        rooms.push({'room': 'Nephi', 'code': '', 'activationDate': 'Jan 7 2014'});
        rooms.push({'room': 'Enos', 'code': '', 'activationDate': 'Jan 14 2014'});
        rooms.push({'room': 'Mars', 'code': 1234, 'activationDate': ''});
        rooms.push({'room': 'Jupiter', 'code': 1234, 'activationDate': ''});
        rooms.push({'room': 'Venus', 'code': '', 'activationDate': 'Jun 18 2014'});
        rooms.push({'room': 'Saturn', 'code': '', 'activationDate': 'Jun 12 2014'});
        rooms.push({'room': 'Earth', 'code': 1234, 'activationDate': ''});

        return rooms;
      };

      SpacesService.listRooms(function(data, status){
        if(data.success === true ){
          $scope.roomData = getDummyData();
        }
        else{
          Log.error('Error getting rooms. Status: ' + status);
          $scope.roomData = getDummyData();
        }
      });

      $scope.newRoomName = null;
      $scope.gridOptions = {
        data: 'roomData',
        multiSelect: false,
        showFilter: true,
        sortInfo: { fields: ['activationDate','room'],
                    directions: ['asc']},

        columnDefs: [{field:'room', displayName:'Room'},
                     {field:'code', displayName:'Activation Code'},
                     {field:'activationDate', displayName:'Activation Date'}]
      };


      Notification.init($scope);
      $scope.popup = Notification.popup;

      $scope.clearRoom = function() {
        angular.element('#newRoom').val('');
        $scope.newRoomName = null;
      };

      $scope.addRoom = function(){
        SpacesService.addRoom($scope.newRoomName, function(data, status){
          if(data.success === true ){
            var successMessage = [$scope.newRoomName + ' added successfully.'];
            Notification.notify(successMessage, 'success');
            $scope.myData = SpacesService.listRooms();
            $scope.clearRoom();
          }
          else{
            var errorMessage = ['Error adding ' + $scope.newRoomName + '. Status: ' + status];
            Notification.notify(errorMessage, 'error');
            rooms.push({'room': $scope.newRoomName, 'code': 1234, 'activationDate': ''});
          }
        });
      };
    }
]);
