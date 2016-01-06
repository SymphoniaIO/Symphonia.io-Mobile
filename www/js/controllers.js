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

angular.module('symphonia.controllers', ['ngCordova', 'ng-walkthrough'])

  .controller('MainCtrl', function ($scope, $ionicPlatform, $state, ImageLoadService) {
    $ionicPlatform.ready(function () {
      $scope.uploadPicture = function () {
        ImageLoadService.upload(function () {
          $state.go('options');
        });
      };

      $scope.takeAPicture = function () {
        ImageLoadService.take(function () {
          $state.go('options');
        });
      };
    });
  })

  .controller('OptionsCtrl', function ($scope, $ionicLoading, $state, ImageLoadService, ProcessingService) {
    $scope.outputFormatList = [
      {text: 'Music XML', value: 'musicxml'},
      {text: 'PDF', value: 'pdf'}
    ];

    $scope.data = {
      outputFormat: 'musicxml',
      imageData: ImageLoadService.getBase64()
    };

    $scope.processOmr = function () {
      $ionicLoading.show({
        template: '<div class="loader"><svg class="circular">' +
        '<circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/>' +
        '</svg></div>'
        //template: '<ion-spinner icon="dots" class="spinner-dark"></ion-spinner>'
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

      $scope.sendEmail = function () {
        SaveAndSendService.sendToEmail();
      };

      $scope.downloadWatImage = function () {
        $cordovaDialogs.prompt('Enter the name of a file, WITHOUT suffix', 'Filename', ['Cancel', 'Save'], 'scores')
          .then(function (result) {
            SaveAndSendService.saveData(result.input1);
          });
      };
    });
  })

  .controller('FailureCtrl', function () {

  });
