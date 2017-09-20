require('./_user-add.scss');

(function () {
  'use strict';

  angular.module('Core')
    .directive('crOnboardUsers', crOnboardUsers);

  function crOnboardUsers() {
    return {
      restrict: 'EA',
      template: require('modules/core/users/userAdd/onboardUsers.tpl.html'),
    };
  }
})();
