/*
 * Copyright 2016 Maroš Šeleng
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

angular.module('symphonia.controllers', ['ngCordova'])

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

    function showErrorDialog() {
      $cordovaDialogs.alert('The type of a file you provided is not supported.','Error')
    }
  })

  .controller('OptionsCtrl', function ($scope, $ionicLoading, $state, $cordovaDevice, ImageLoadService, ProcessingService) {
    $scope.outputFormatList = [
      {text: 'Music XML', value: 'musicxml'},
      {text: 'PDF', value: 'pdf'}
    ];

    //Prevents image from overlaying the statusbar on iOS devices
    $scope.imageDivMarginTop = $cordovaDevice.getPlatform() === 'iOS' ? '20px' : '0px';

    $scope.data = {
      outputFormat: 'musicxml',
      imageData: ImageLoadService.getBase64()
    };

    $scope.processOmr = function () {
      $ionicLoading.show({
        hideOnStateChange: true,
        noBackdrop: true,
        template: '<ion-spinner icon="circles"></ion-spinner>'
      });

      ProcessingService.process($scope.data.outputFormat, function () {
        $ionicLoading.hide();
        $state.go('success');
      }, function () {
        $ionicLoading.hide();
        $state.go('failure');
      });
    };
  })

  .controller('AboutCtrl', function () {

  })

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
  })

  .controller('FailureCtrl', function ($scope, ProcessingService) {
    $scope.errorMessage = ProcessingService.getErrorMessage();
  });
