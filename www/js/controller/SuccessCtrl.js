/**
 * Created by marosseleng on 09/02/16.
 */

angular.module('symphonia.controllers')
  .controller('SuccessCtrl', function ($scope, $ionicPlatform, $cordovaDialogs, ImageLoadService, SaveAndSendService) {
    $ionicPlatform.ready(function () {
      SaveAndSendService.showButton(function () {
        $scope.emailAvailable = true;
      }, function () {
        $scope.emailAvailable = false;
      });

      $scope.resultSaved = false;

      $scope.sendEmail = function () {
        SaveAndSendService.sendToEmail();
      };

      $scope.saveImage = function () {
        $cordovaDialogs.prompt('Enter the name of a file, WITHOUT suffix', 'Filename', ['Cancel', 'Save'], 'scores')
          .then(function (result) {
            switch (result.buttonIndex) {
              case 2:
                SaveAndSendService.saveData(result.input1, function () {
                  $scope.resultSaved = true;
                });
                break;
              default:
                break;
            }
          });
      };

      $scope.openInExternal = function () {

      }
    });
  });
