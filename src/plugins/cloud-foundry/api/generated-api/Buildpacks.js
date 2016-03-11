/* DO NOT EDIT: This code has been generated by the cf-dotnet-sdk-builder */

(function () {
  'use strict';

  angular
    .module('cloud-foundry.api')
    .factory('cloud-foundry.api.BuildpacksService', BuildpacksServiceFactory);

  function BuildpacksServiceFactory() {
    /* eslint-disable camelcase */
    function BuildpacksService($http) {

      this.ChangePositionOfBuildpack = function (guid, value, params) {
        var config = {};
        config.params = params;
        config.url = "/v2/buildpacks/" + guid + "";
        config.method = 'PUT';
        config.data = value;
        $http(config);
      };

      this.CreatesAdminBuildpack = function (value, params) {
        var config = {};
        config.params = params;
        config.url = "/v2/buildpacks";
        config.method = 'POST';
        config.data = value;
        $http(config);
      };

      this.DeleteBuildpack = function (guid, params) {
        var config = {};
        config.params = params;
        config.url = "/v2/buildpacks/" + guid + "";
        config.method = 'DELETE';
        $http(config);
      };

      this.EnableOrDisableBuildpack = function (guid, value, params) {
        var config = {};
        config.params = params;
        config.url = "/v2/buildpacks/" + guid + "";
        config.method = 'PUT';
        config.data = value;
        $http(config);
      };

      this.ListAllBuildpacks = function (params) {
        var config = {};
        config.params = params;
        config.url = "/v2/buildpacks";
        config.method = 'GET';
        $http(config);
      };

      this.LockOrUnlockBuildpack = function (guid, value, params) {
        var config = {};
        config.params = params;
        config.url = "/v2/buildpacks/" + guid + "";
        config.method = 'PUT';
        config.data = value;
        $http(config);
      };

      this.RetrieveBuildpack = function (guid, params) {
        var config = {};
        config.params = params;
        config.url = "/v2/buildpacks/" + guid + "";
        config.method = 'GET';
        $http(config);
      };

    }

    return BuildpacksService;
    /* eslint-enable camelcase */
  }

})();
