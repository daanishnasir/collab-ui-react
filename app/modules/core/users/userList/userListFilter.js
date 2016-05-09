(function () {
  'use strict';

  angular.module('Core').filter('userListFilter', userListFilter);

  /* @ngInject */
  function userListFilter($filter) {
    return function (status) {
      return (typeof status === 'undefined' || status === null || status == 'active') ? $filter('translate')('usersPage.active') : $filter('translate')('usersPage.pending');
    };
  }
})();
