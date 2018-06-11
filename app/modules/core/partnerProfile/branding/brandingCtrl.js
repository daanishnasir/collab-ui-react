/* @ngInject */
module.exports = function BrandingCtrl($log, $state, $modal, $scope, $translate, $timeout,
  Authinfo, Notification, Log, UserListService, BrandService, Orgservice) {
  var brand = this;
  var orgId = Authinfo.getOrgId();
  var isDirectCustomer = Authinfo.isDirectCustomer();
  var isPartner = Authinfo.isPartner();

  brand.isDirectCustomer = isDirectCustomer;
  brand.isPartner = isPartner;
  brand.usePartnerLogo = true;
  brand.allowCustomerLogos = false;
  brand.progress = 0;
  brand.logoCriteria = {
    pattern: '.png',
    width: {
      min: '100',
    },
    size: {
      max: '1MB',
    },
  };

  brand.init = function () {
    brand.rep = null; // cs admin rep
    brand.partner = {};

    brand.logoUrl = '';
    brand.logoError = null;

    UserListService.listPartners(orgId, function (data) {
      for (var partner in data.partners) {
        var currentPartner = data.partners[partner];
        if (!isPartner && currentPartner.userName.indexOf('@cisco.com') === -1) {
          brand.partner = currentPartner;
        } else if (currentPartner.userName.indexOf('@cisco.com') > -1) {
          brand.rep = currentPartner;
        }
      }
    });

    var params = {
      disableCache: true,
      basicInfo: true,
    };

    Orgservice.getOrg(function (data, status) {
      if (data.success) {
        var settings = data.orgSettings;
        if (!_.isUndefined(settings.usePartnerLogo)) {
          brand.usePartnerLogo = settings.usePartnerLogo;
        }

        if (!_.isUndefined(settings.allowCustomerLogos)) {
          brand.allowCustomerLogos = settings.allowCustomerLogos;
        }

        if (!_.isUndefined(settings.logoUrl)) {
          brand.logoUrl = settings.logoUrl;
        }
      } else {
        Log.debug('Get existing org failed. Status: ' + status);
      }
    }, orgId, params);

    BrandService.getLogoUrl(orgId).then(function (logoUrl) {
      brand.tempLogoUrl = logoUrl;
    });
  };

  brand.init();

  brand.upload = function (file) {
    if (validateLogo(file)) {
      openModal();
      brand.progress = 0;
      BrandService.upload(orgId, file)
        .then(uploadSuccess, uploadError, uploadProgress);
    }
  };

  function openModal() {
    brand.uploadModal = $modal.open({
      type: 'small',
      scope: $scope,
      modalClass: 'modal-logo-upload',
      template: require('modules/core/partnerProfile/branding/brandingUpload.tpl.html'),
    });
  }

  brand.toggleLogo = _.debounce(function (value) {
    if (value) {
      BrandService.usePartnerLogo(orgId);
    } else {
      BrandService.useCustomLogo(orgId);
    }
  }, 2000, {
    leading: true,
    trailing: false,
  });

  brand.toggleAllowCustomerLogos = _.debounce(function (value) {
    if (value) {
      BrandService.enableCustomerLogos(orgId);
    } else {
      BrandService.disableCustomerLogos(orgId);
    }
  }, 2000, {
    leading: true,
    trailing: false,
  });

  // Add branding example static page
  brand.showBrandingExample = function (type) {
    $state.go('brandingExample', {
      modalType: type,
    });
  };

  function validateLogo(logo) {
    // avoid sencond click upload panel, trigger upload direct,
    if (!logo) {
      return false;
    }

    var error = logo.$error;
    if (error === 'maxWidth' || error === 'minWidth') {
      brand.logoError = 'dimensions';
    } else if (error === 'minSize' || error === 'maxSize') {
      brand.logoError = 'size';
    } else {
      brand.logoError = logo.$error;
    }

    if (logo && !logo.$error) {
      return true;
    } else {
      openModal();
    }
  }

  function uploadSuccess() {
    var orgId = Authinfo.getOrgId();
    $timeout(function () {
      if (brand.uploadModal) {
        brand.uploadModal.close();
      }
    }, 3000);
    // Automatically start using the custom logo
    BrandService.resetCdnLogo(orgId).then(function () {
      BrandService.getLogoUrl(orgId).then(function (logoUrl) {
        brand.tempLogoUrl = logoUrl;
        brand.usePartnerLogo = false;
        brand.toggleLogo(false);
      }).catch(uploadError);
    }).catch(uploadError);
  }

  function uploadError(response) {
    var errorKey;
    brand.logoFile = null;
    if (brand.uploadModal) {
      brand.uploadModal.close();
    }
    if (_.get(response, 'data.name') === 'SecurityError') {
      errorKey = 'partnerProfile.imageUploadFailedSecurity';
    } else {
      errorKey = 'partnerProfile.imageUploadFailed';
    }
    Notification.errorResponse(response, errorKey);
  }

  function uploadProgress(evt) {
    brand.progress = parseInt((100.0 * evt.loaded) / evt.total, 10);
  }
};
