import moduleName from './index';

describe('Component: editAutoAssignTemplateModal:', () => {
  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies(
      '$httpBackend',
      '$q',
      '$scope',
      '$state',
      'Analytics',
      'Orgservice',
    );
    this.$scope.dismiss = _.noop;
    this.fixtures = {};
    this.fixtures.fakeLicenseUsage = [{
      subscriptionId: 'fake-subscriptionId-2',
    }, {
      subscriptionId: 'fake-subscriptionId-3',
    }, {
      subscriptionId: 'fake-subscriptionId-1',
    }];
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('primary behaviors (view):', () => {
    beforeEach(function () {
      this.compileTemplate('<edit-auto-assign-template-modal dismiss="_.noop()"></edit-auto-assign-template-modal>');
    });

    it('should always render a title, a header, a description, and a tooltip', function () {
      expect(this.view.find('.modal-header > h3[translate]').get(0)).toHaveText('userManage.autoAssignTemplate.edit.title');
      expect(this.view.find('.modal-body > h4[translate]').get(0)).toHaveText('userManage.autoAssignTemplate.edit.header');
      expect(this.view.find('.modal-body > p[translate]').get(0)).toHaveText('userManage.autoAssignTemplate.edit.description');
      expect(this.view.find('.modal-body > p > span[translate]').get(0)).toHaveText('userManage.autoAssignTemplate.edit.note');
      expect(this.view.find('.modal-body > p > a > i.icon-info[tooltip="userManage.autoAssignTemplate.edit.tooltip"]').length).toBe(1);
    });

    it('should always render a back and a next button', function () {
      expect(this.view.find('button.btn.back').length).toBe(1);
      expect(this.view.find('button.btn.next').length).toBe(1);
    });

    it('should render render an "assignable-services" element', function () {
      expect(this.view.find('assignable-services[subscriptions]').length).toBe(1);
      expect(this.view.find('assignable-services[on-update]').length).toBe(1);
      expect(this.view.find('assignable-services[state-data]').length).toBe(1);
    });
  });

  describe('primary behaviors (controller):', () => {
    beforeEach(function () {
      spyOn(this.$state, 'go');
      _.set(this.$state, 'params.prevState', 'fake-previous-state');
      spyOn(this.Analytics, 'trackAddUsers');
      spyOn(this.Orgservice, 'getLicensesUsage').and.returnValue(this.$q.resolve(this.fixtures.fakeLicenseUsage));
      this.compileComponent('editAutoAssignTemplateModal', {
        dismiss: 'dismiss',
      });
    });

    it('should initialize "sortedSubscription" property', function () {
      expect(this.controller.sortedSubscriptions.length).toBe(3);
      expect(_.get(this.controller, 'sortedSubscriptions[0].subscriptionId')).toBe('fake-subscriptionId-1');
      expect(_.get(this.controller, 'sortedSubscriptions[1].subscriptionId')).toBe('fake-subscriptionId-2');
      expect(_.get(this.controller, 'sortedSubscriptions[2].subscriptionId')).toBe('fake-subscriptionId-3');
    });

    it('should navigate to previous state when back button is clicked', function () {
      this.view.find('button.btn.back').click();
      expect(this.$state.go).toHaveBeenCalledWith('fake-previous-state');
    });

    it('should track the event when the modal is dismissed', function () {
      this.view.find('button.close[aria-label="common.close"]').click();
      expect(this.Analytics.trackAddUsers).toHaveBeenCalledWith(this.Analytics.eventNames.CANCEL_MODAL);
    });
  });
});
