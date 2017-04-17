import { PstnSwivelNumbersComponent } from './pstnSwivelNumbers.component';
import notifications from 'modules/core/notifications';

export const TIMEOUT = 100;
export default angular
  .module('huron.pstn-swivelNumbers', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    'huron.telephoneNumberService',
    notifications,
  ])
  .component('ucPstnSwivelNumbers', new PstnSwivelNumbersComponent())
  .name;