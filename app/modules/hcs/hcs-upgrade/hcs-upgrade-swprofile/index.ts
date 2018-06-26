import { HcsUpgradeSwprofileListComponent } from './hcs-upgrade-swprofile-list.component';
import { HcsUpgradeSwprofileEditComponent } from './hcs-upgrade-swprofile-edit.component';

export default angular
  .module('hcs.swprofilelist', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('hcsUpgradeSwprofileList', new HcsUpgradeSwprofileListComponent())
  .component('hcsUpgradeSwprofileEdit', new HcsUpgradeSwprofileEditComponent())
  .name;