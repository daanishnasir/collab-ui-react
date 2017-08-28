require('./customer-reports.scss');

export default angular
  .module('core.customer-reports', [
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/config/config'),
  ])
  .constant('LoadingTimeout', 120000)
  .name;
