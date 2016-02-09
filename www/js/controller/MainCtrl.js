/**
 * Created by marosseleng on 09/02/16.
 */

angular.module('symphonia.controllers')
  .controller('MainCtrl', function ($scope, $ionicPlatform, $cordovaDialogs, $state, ImageLoadService) {
    $ionicPlatform.ready(function () {
      $scope.uploadPicture = function () {
        ImageLoadService.upload(function () {
          $state.go('options');
        }, showErrorDialog);
      };

      $scope.takeAPicture = function () {
        ImageLoadService.take(function () {
          $state.go('options');
        }, showErrorDialog);
      };
    });

    function showErrorDialog(message) {
      $cordovaDialogs.alert(message, 'An error has occurred')
    }
  });
