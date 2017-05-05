import pstnContactInfo from './index';

describe('Component: PstnContactInfoComponent', () => {
  const FIRST_NAME_INPUT = '#firstName';

  beforeEach(function () {
    this.initModules(pstnContactInfo);
    this.injectDependencies(
      '$scope',
      '$timeout',
    );
    this.$scope.contact = {
      firstName: 'First',
      lastName: 'Last',
    };
  });

  function initComponent() {
    this.compileComponent('ucPstnContactInfo', {
      contact: 'contact',
    });
  }

  describe('init', () => {
    beforeEach(initComponent);

    it('should have first name input with value initialized', function () {
      expect(this.view.find(FIRST_NAME_INPUT)).toExist();
      expect(this.view.find(FIRST_NAME_INPUT).val()).toEqual('First');
    });

  });
});
