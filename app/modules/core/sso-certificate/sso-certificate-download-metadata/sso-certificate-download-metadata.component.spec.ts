import ssoCertificateDownloadMetadataModuleName from './index';
import { SsoCertificateService } from 'modules/core/sso-certificate/shared/index';
import { SsoCertificateDownloadMetadataController } from './sso-certificate-download-metadata.component';
import { MultiStepModalComponent } from 'modules/core/shared/multi-step-modal/multi-step-modal.component';

type Test = atlas.test.IComponentTest<SsoCertificateDownloadMetadataController, {
  SsoCertificateService: SsoCertificateService;
}, {
  components: {
    multiStepModal: atlas.test.IComponentSpy<MultiStepModalComponent>;
  };
}>;

describe('Component: downloadMetadataFile:', () => {
  const DIALOG_CONTENT = '.sso-certificate-content-download-metadata';
  const CONTENT_BUTTON = '.sso-certificate-content__button';
  const CONTENT_TITLE = '.sso-certificate-content__paragraph-title';
  const CONTENT_ACTION2 = '.sso-certificate-content__paragraph-action2';

  beforeEach(function (this: Test) {
    this.components = {
      multiStepModal: this.spyOnComponent('multiStepModal'),
    };
    this.initModules(
      ssoCertificateDownloadMetadataModuleName,
      this.components.multiStepModal,
    );
    this.injectDependencies(
      'SsoCertificateService',
    );

    spyOn(this.SsoCertificateService, 'addLatestCertificateToOrg').and.returnValue(this.$q.resolve());
    spyOn(this.SsoCertificateService, 'downloadMetadata');
  });

  function initComponent(this: Test) {
    this.compileComponent('ssoCertificateDownloadMetadata', {});
  }

  describe('initial state', () => {
    beforeEach(initComponent);
    it('should have title and dismiss functionality', function (this: Test) {
      expect(this.components.multiStepModal.bindings[0].l10nTitle).toBe('ssoCertificateModal.updateCertificate');

      spyOn(this.controller, 'dismiss');
      this.components.multiStepModal.bindings[0].dismiss();
      expect(this.controller.dismiss).toHaveBeenCalled();
    });

    it('should show dialog content', function (this: Test) {
      expect(this.view.find(DIALOG_CONTENT)).toExist();
    });

    it('should show content title', function (this: Test) {
      expect(this.view.find(CONTENT_TITLE)).toExist();
    });

    it('should show content action2 text', function (this: Test) {
      expect(this.view.find(CONTENT_ACTION2)).toExist();
    });

    it('should show the download button', function (this: Test) {
      expect(this.view.find(CONTENT_BUTTON)).toExist();
    });
  });

  describe('component behavior for multiple certificates', () => {
    function initComponent() {
      this.compileComponent('ssoCertificateDownloadMetadata', {
        isMultiple: true,
      });
    }

    beforeEach(function () {
      initComponent.call(this);
    });

    it('should have called function to add the latest certificate to the org', function (this: Test) {
      expect(this.SsoCertificateService.addLatestCertificateToOrg).toHaveBeenCalled();
    });

    it('should have called function to prepare the multiple certificates download metadata', function (this: Test) {
      expect(this.SsoCertificateService.downloadMetadata).toHaveBeenCalledWith(true);
    });
  });

  describe('component behavior for single certificate', () => {
    function initComponent() {
      this.compileComponent('ssoCertificateDownloadMetadata', {
        isMultiple: false,
      });
    }

    beforeEach(function () {
      initComponent.call(this);
    });

    it('should have called function to add the latest certificate to the org', function (this: Test) {
      expect(this.SsoCertificateService.addLatestCertificateToOrg).toHaveBeenCalled();
    });

    it('should have called function to prepare the single certificate download metadata', function (this: Test) {
      expect(this.SsoCertificateService.downloadMetadata).toHaveBeenCalledWith(false);
    });
  });
});
