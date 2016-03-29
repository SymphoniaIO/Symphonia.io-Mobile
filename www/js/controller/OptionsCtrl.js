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

angular.module('symphonia.controllers')
  .controller('OptionsCtrl', function ($scope, $ionicLoading, $state, $cordovaDevice, $cordovaDialogs, ImageLoadService, ProcessingService) {
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

      ProcessingService.process($scope.data.outputFormat).then(function () {
        $ionicLoading.hide();
        $state.go('success');
      }, function (message) {
        $ionicLoading.hide();
        message += ' Please try again later.';
        $cordovaDialogs.alert(message, 'An error has occurred.');
      });
    };
  });
