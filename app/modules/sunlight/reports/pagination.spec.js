describe('tabindex toggle directive', function () {
  beforeEach(angular.mock.module('Sunlight.tabindex'));
  beforeEach((function () {
    this.compileTemplate('<a href sl-tabindex-toggle ng-disabled="disabled">foo</a>');
  }));

  afterAll(function () {
    this.$scope = undefined;
  });

  it('should toggle the tabindex on disabled toggle', function () {
    expect(this.view).toBeDefined();
    expect(this.view.prop('tabindex')).toBe(0);

    this.$scope.disabled = true;
    this.$scope.$digest();

    expect(this.view.prop('tabindex')).toBe(-1);

    this.$scope.disabled = false;
    this.$scope.$digest();

    expect(this.view.prop('tabindex')).toBe(0);
  });
});

describe('paging factory', function () {
  var $rootScope, $scope, ctrl, attrs;

  beforeEach(angular.mock.module('Sunlight.paging'));
  beforeEach(inject(function (_$rootScope_, slPaging) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    ctrl = {};
    attrs = {};

    slPaging.create(ctrl, $scope, attrs);
  }));

  afterEach(function () {
    $rootScope = $scope = ctrl = attrs = undefined;
  });

  describe('init', function () {
    var ngModelCtrl, config;

    beforeEach(function () {
      ngModelCtrl = {};
      config = {
        foo: 'bar',
        itemsPerPage: 12,
      };
    });

    afterEach(function () {
      ngModelCtrl = config = undefined;
    });

    describe('without itemsPerPage', function () {
      beforeEach(function () {
        ctrl.init(ngModelCtrl, config);
      });

      it('should set the ngModel and config', function () {
        expect(ctrl.ngModelCtrl).toBe(ngModelCtrl);
        expect(ctrl.config).toBe(config);
      });

      it('should properly render the model', function () {
        spyOn(ctrl, 'render');

        ngModelCtrl.$render();

        expect(ctrl.render).toHaveBeenCalled();
      });

      it('should set to default itemsPerPage', function () {
        expect(ctrl.itemsPerPage).toBe(12);
      });

      it('should update the page when total items changes', function () {
        spyOn(ctrl, 'calculateTotalPages').and.returnValue(5);
        spyOn(ctrl, 'updatePage');
        $rootScope.$digest();

        expect(ctrl.calculateTotalPages.calls.count()).toBe(0);
        expect(ctrl.updatePage.calls.count()).toBe(0);

        $scope.totalItems = 10;
        $rootScope.$digest();

        expect(ctrl.calculateTotalPages.calls.count()).toBe(1);
        expect(ctrl.updatePage.calls.count()).toBe(1);
        expect($scope.totalPages).toBe(5);

        $scope.totalItems = undefined;
        $scope.totalPages = 2;
        $rootScope.$digest();

        expect(ctrl.calculateTotalPages.calls.count()).toBe(2);
        expect(ctrl.updatePage.calls.count()).toBe(2);
        expect($scope.totalPages).toBe(5);
      });
    });

    describe('with itemsPerPage', function () {
      beforeEach(function () {
        attrs.itemsPerPage = 'abc';
        $rootScope.abc = 10;

        ctrl.init(ngModelCtrl, config);
      });

      it('should update the page when itemsPerPage changes', function () {
        spyOn(ctrl, 'calculateTotalPages').and.returnValue(5);
        spyOn(ctrl, 'updatePage');
        $rootScope.$digest();

        expect(ctrl.itemsPerPage).toBe(10);
        expect($scope.totalPages).toBe(5);
        expect(ctrl.updatePage).toHaveBeenCalled();
      });
    });
  });

  describe('calculate totalPages', function () {
    it('when itemsPerPage is less than 1', function () {
      ctrl.itemsPerPage = 0;
      $scope.totalItems = 101;
      expect(ctrl.calculateTotalPages()).toBe(1);
    });

    it('when itemsPerPage is greater than 1', function () {
      ctrl.itemsPerPage = 10;
      $scope.totalItems = 101;
      expect(ctrl.calculateTotalPages()).toBe(11);
    });
  });

  describe('render', function () {
    it('should set page to 1 when invalid', function () {
      ctrl.ngModelCtrl.$viewValue = 'abcd';
      $scope.page = 10;

      ctrl.render();

      expect($scope.page).toBe(1);
    });

    it('should set page to view value when valid', function () {
      ctrl.ngModelCtrl.$viewValue = '3';
      $scope.page = 10;

      ctrl.render();

      expect($scope.page).toBe(3);
    });
  });

  describe('select page', function () {
    beforeEach(function () {
      spyOn(ctrl.ngModelCtrl, '$setViewValue');
      ctrl.ngModelCtrl.$render = jasmine.createSpy('ctrl.ngModelCtrl.$render');
      $scope.page = 5;
      $scope.totalPages = 20;
    });

    it('should change the page', function () {
      $scope.selectPage(12);

      expect(ctrl.ngModelCtrl.$setViewValue).toHaveBeenCalledWith(12);
      expect(ctrl.ngModelCtrl.$render).toHaveBeenCalled();
    });

    it('should not change the page to one out of range', function () {
      $scope.selectPage(-1);

      expect(ctrl.ngModelCtrl.$setViewValue).not.toHaveBeenCalled();
      expect(ctrl.ngModelCtrl.$render).not.toHaveBeenCalled();

      $scope.selectPage(21);

      expect(ctrl.ngModelCtrl.$setViewValue).not.toHaveBeenCalled();
      expect(ctrl.ngModelCtrl.$render).not.toHaveBeenCalled();
    });

    describe('on click', function () {
      var evt;

      beforeEach(function () {
        evt = {
          preventDefault: jasmine.createSpy('evt.preventDefault'),
          target: {
            blur: jasmine.createSpy('evt.target.blur'),
          },
        };
      });

      afterEach(function () {
        evt = undefined;
      });

      it('should prevent default behavior', function () {
        $scope.selectPage(12, evt);

        expect(evt.preventDefault).toHaveBeenCalled();
      });

      it('should not change the page if disabled and from an event', function () {
        $scope.ngDisabled = true;

        $scope.selectPage(12, evt);

        expect(ctrl.ngModelCtrl.$setViewValue).not.toHaveBeenCalled();
        expect(ctrl.ngModelCtrl.$render).not.toHaveBeenCalled();
      });

      it('should blur the element clicked', function () {
        $scope.selectPage(12, evt);

        expect(evt.target.blur).toHaveBeenCalled();
      });
    });
  });

  it('should get the text', function () {
    $scope.fooText = 'bar';

    expect($scope.getText('foo')).toBe('bar');
  });

  it('should get the default text', function () {
    ctrl.config = {
      fooText: 'bar',
    };

    expect($scope.getText('foo')).toBe('bar');
  });

  it('should disable previous button', function () {
    $scope.page = 1;

    expect($scope.noPrevious()).toBe(true);
  });

  it('should enable previous button', function () {
    $scope.page = 2;

    expect($scope.noPrevious()).toBe(false);
  });

  it('should disable next button', function () {
    $scope.page = 10;
    $scope.totalPages = 10;

    expect($scope.noNext()).toBe(true);
  });

  it('should enable next button', function () {
    $scope.page = 9;
    $scope.totalPages = 10;

    expect($scope.noNext()).toBe(false);
  });

  describe('update page', function () {
    beforeEach(function () {
      spyOn($scope, 'selectPage');
      ctrl.ngModelCtrl.$render = jasmine.createSpy('ctrl.ngModelCtrl.$render');
      ctrl.setNumPages = jasmine.createSpy('ctrl.setNumPages');
      $scope.totalPages = 10;
    });

    it('should select the last page if page is above total', function () {
      $scope.page = 12;

      ctrl.updatePage();

      expect(ctrl.setNumPages).toHaveBeenCalledWith($rootScope, 10);
      expect($scope.selectPage).toHaveBeenCalledWith(10);
      expect(ctrl.ngModelCtrl.$render).not.toHaveBeenCalled();
    });

    it('should execute render if page is within range', function () {
      $scope.page = 5;

      ctrl.updatePage();

      expect(ctrl.setNumPages).toHaveBeenCalledWith($rootScope, 10);
      expect($scope.selectPage).not.toHaveBeenCalled();
      expect(ctrl.ngModelCtrl.$render).toHaveBeenCalled();
    });
  });

  describe('gc', function () {
    it('should clear watchers', function () {
      var watcher1 = jasmine.createSpy('watcher1'),
        watcher2 = jasmine.createSpy('watcher2');
      ctrl._watchers = [watcher1, watcher2];

      $scope.$destroy();

      expect(ctrl._watchers.length).toBe(0);
      expect(watcher1).toHaveBeenCalled();
      expect(watcher2).toHaveBeenCalled();
    });
  });
});

describe('Pagination controller test', function () {
  var $parse, slPaging, slPaginationConfig, elementDef, view, $rootScope, $scope;
  beforeEach(angular.mock.module('Sunlight.pagination'));
  beforeEach(inject(function (_$parse_, _slPaging_, _slPaginationConfig_, _$rootScope_) {
    $rootScope = _$rootScope_;
    $rootScope.currentPage = 1;
    $rootScope.total = 200;

    elementDef = '<div sl-pagination total-items="total" items-per-page="5" max-size="3" previous-text="Previous;" next-text="Next" ng-model="currentPage">  </div>';
    this.compileTemplate(elementDef);
    view = this.view;
    this.$scope.currentPage = $rootScope.currentPage;
    this.$scope.total = $rootScope.total;
    $scope = this.$scope;
    $parse = _$parse_;
    slPaginationConfig = _slPaginationConfig_;
    slPaging = _slPaging_;
  }));

  afterEach(function () {
    this.$scope = $parse = slPaging = slPaginationConfig = elementDef = view = $rootScope = $scope = undefined;
  });

  function getPaginationBarSize() {
    return view.find('button').length;
  }

  function getPaginationEl(index) {
    return view.find('button').eq(index);
  }

  function getPaginationSpanEl(elem, index) {
    return elem.find('button').eq(index).find('span');
  }

  function clickPaginationEl(index) {
    getPaginationEl(index).click();
  }

  function updateCurrentPage(value) {
    $scope.currentPage = value;
    $scope.$digest();
  }

  it('Basic test', function () {
    expect(this.$scope).toBeDefined();
    expect(view).toBeDefined();
    expect($parse).toBeDefined();
    expect(slPaginationConfig).toBeDefined();
    expect(slPaging).toBeDefined();
  });

  it('contains num-pages + 2 button elements', function () {
    expect(getPaginationBarSize()).toBe(5);
  });

  it('has the number of the page as text in each page item', function () {
    for (var i = 1; i <= 3; i++) {
      expect(getPaginationSpanEl(view, i).text().trim()).toEqual('' + i);
    }
  });

  it('changes currentPage if a page link is clicked', function () {
    clickPaginationEl(2);
    expect(this.$scope.currentPage).toBe(2);
  });

  it('changes currentPage if the "previous" link is clicked', function () {
    clickPaginationEl(0);
    expect(this.$scope.currentPage).toBe(1);
  });

  it('changes currentPage if the "next" link is clicked', function () {
    clickPaginationEl(-1);
    expect(this.$scope.currentPage).toBe(2);
  });

  it('does not change the current page on "previous" click if already at first page', function () {
    updateCurrentPage(1);
    clickPaginationEl(0);
    expect(this.$scope.currentPage).toBe(1);
  });

  it('does not change the current page on "next" click if already at last page', function () {
    updateCurrentPage(5);
    clickPaginationEl(-1);
    expect(this.$scope.currentPage).toBe(6);
  });

  it('changes the number of pages when `total-items` changes', function () {
    this.$scope.total = 78;
    this.$scope.$digest();

    expect(getPaginationBarSize()).toBe(5);
    expect(getPaginationEl(0).hasClass('icon-chevron-left')).toBe(true);
    expect(getPaginationEl(-1).hasClass('icon-chevron-right')).toBe(true);
  });

  it('does not "break" when `total-items` is undefined', function () {
    this.$scope.total = undefined;
    this.$scope.$digest();

    expect(getPaginationBarSize()).toBe(3);
    expect(getPaginationEl(0).attr('disabled')).toBeDefined();
    expect(getPaginationEl(1)).toHaveClass('btn--primary');
    expect(getPaginationEl(2).attr('disabled')).toBeDefined();
  });

  it('does not "break" when `total-items` is negative', function () {
    this.$scope.total = -1;
    this.$scope.$digest();

    expect(getPaginationBarSize()).toBe(3);
    expect(getPaginationEl(0).attr('disabled')).toBeDefined();
    expect(getPaginationEl(1)).toHaveClass('btn--primary');
    expect(getPaginationEl(2).attr('disabled')).toBeDefined();
  });

  it('does not change the current page when `total-items` changes but is valid', function () {
    this.$scope.currentPage = 1;
    this.$scope.total = 18;
    this.$scope.$digest();

    expect(this.$scope.currentPage).toBe(1);
  });

  describe('with `max-size` option', function () {
    beforeEach(function () {
      this.$scope.total = 98;
      this.$scope.currentPage = 3;
      this.$scope.maxSize = 5;
      elementDef = '<div sl-pagination total-items="total" ng-model="currentPage" max-size="maxSize"></div>';
      this.compileTemplate(elementDef);
      view = this.view;
    });

    it('contains maxsize + 2 button elements', function () {
      expect(getPaginationBarSize()).toBe(this.$scope.maxSize + 2);
      expect(getPaginationEl(0).hasClass('icon-chevron-left')).toBe(true);
      expect(getPaginationEl(-1).hasClass('icon-chevron-right')).toBe(true);
    });

    it('shows the page number even if it can\'t be shown in the middle', function () {
      updateCurrentPage(1);
      expect(getPaginationEl(1)).toHaveClass('btn--primary');

      updateCurrentPage(10);
      expect(getPaginationEl(-2)).toHaveClass('btn--primary');
    });

    it('shows the page number in middle after the next link is clicked', function () {
      updateCurrentPage(6);
      clickPaginationEl(-1);

      expect(this.$scope.currentPage).toBe(7);
      expect(getPaginationEl(3)).toHaveClass('btn--primary');
      expect(getPaginationEl(3).text().trim()).toBe('' + this.$scope.currentPage);
    });

    it('shows the page number in middle after the prev link is clicked', function () {
      updateCurrentPage(7);
      clickPaginationEl(0);

      expect(this.$scope.currentPage).toBe(6);
      expect(getPaginationEl(3)).toHaveClass('btn--primary');
      expect(getPaginationEl(3).text().trim()).toBe('' + this.$scope.currentPage);
    });

    it('changes pagination bar size when max-size value changed', function () {
      this.$scope.maxSize = 7;
      this.$scope.$digest();
      expect(getPaginationBarSize()).toBe(9);
    });

    it('sets the pagination bar size to num-pages, if max-size is greater than num-pages ', function () {
      this.$scope.maxSize = 15;
      this.$scope.$digest();
      expect(getPaginationBarSize()).toBe(12);
    });

    it('should not change value of max-size expression, if max-size is greater than num-pages ', function () {
      this.$scope.maxSize = 15;
      this.$scope.$digest();
      expect(this.$scope.maxSize).toBe(15);
    });

    it('should not display page numbers, if max-size is zero', function () {
      this.$scope.maxSize = 0;
      this.$scope.$digest();
      expect(getPaginationBarSize()).toBe(2);
      expect(getPaginationEl(0).hasClass('icon-chevron-left')).toBe(true);
      expect(getPaginationEl(-1).hasClass('icon-chevron-right')).toBe(true);
    });
  });

  describe('with just boundary & number links', function () {
    beforeEach(function () {
      this.$scope.directions = false;
      this.$scope.total = 100;
      this.$scope.currentPage = 7;
      elementDef = '<div sl-pagination boundary-links="true" direction-links="directions" total-items="total" ng-model="currentPage"></div>';
      this.compileTemplate(elementDef);
      view = this.view;
    });

    it('contains number of pages + 2 button elements', function () {
      expect(getPaginationBarSize()).toBe(12);
      expect(getPaginationEl(0).text().trim()).toBe('First');
      expect(getPaginationEl(1).text().trim()).toBe('1');
      expect(getPaginationEl(-2).text().trim()).toBe('10');
      expect(getPaginationEl(-1).text().trim()).toBe('Last');
    });

    it('disables the "first" & activates "1" link if current page is 1', function () {
      updateCurrentPage(1);

      expect(getPaginationEl(0).attr('disabled')).toBeDefined();
      expect(getPaginationEl(1)).toHaveClass('btn--primary');
    });

    it('disables the "last" & "next" link if current page is num-pages', function () {
      updateCurrentPage(10);

      expect(getPaginationEl(-2)).toHaveClass('btn--primary');
      expect(getPaginationEl(-1).attr('disabled')).toBeDefined();
    });
  });
});
