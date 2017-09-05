import locaitonRoutingPrefixModule from './index';

describe('Component: locationRoutingPrefix', () => {
  const DESCRIPTION_BLOCK = '.description-block';
  const PREFIX_INPUT = 'input#dialingPrefix';

  beforeEach(function() {
    this.initModules(locaitonRoutingPrefixModule);
    this.injectDependencies(
      '$scope',
    );

    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');

    this.compileComponent('ucLocationRoutingPrefix', {
      ftsw: 'ftsw',
      routingPrefix: 'routingPrefix',
      routingPrefixLength: 'routingPrefixLength',
      onChangeFn: 'onChangeFn(routingPrefix)',
    });
  });

  describe('Use in First Time Setup Wizard', () => {
    beforeEach(function() {
      this.$scope.ftsw = true;
      this.$scope.routingPrefix = null;
      this.$scope.routingPrefixLength = '7';
      this.$scope.$apply();
    });

    it('should not display field description in FTSW', function() {
      expect(this.view).not.toContainElement(DESCRIPTION_BLOCK);
    });

    it('should have a prefix input field', function() {
      expect(this.view).toContainElement(PREFIX_INPUT);
    });

    it('form should not be valid when input is too long', function() {
      this.view.find(PREFIX_INPUT).val('123456789').change();
      expect(this.controller.routingPrefixForm.$valid).toBeFalsy();
    });

    it('form should not be valid when input is invalid', function() {
      this.view.find(PREFIX_INPUT).val('123456%$%&^789').change();
      expect(this.controller.routingPrefixForm.$valid).toBeFalsy();
    });
  });
});