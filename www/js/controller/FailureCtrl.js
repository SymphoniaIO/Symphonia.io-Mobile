/**
 * Created by marosseleng on 09/02/16.
 */

angular.module('symphonia.controllers')
  .controller('FailureCtrl', function ($scope, ProcessingService) {
    $scope.errorMessage = ProcessingService.getErrorMessage();
  });
