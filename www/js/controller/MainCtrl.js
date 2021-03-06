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
  .controller('MainCtrl', function ($scope, $ionicPlatform, $cordovaDialogs, $state, ImageLoadService) {
    $ionicPlatform.ready(function () {
      $scope.uploadPicture = function () {
        ImageLoadService.upload().then(goToOptions, showErrorDialog);
      };

      $scope.takeAPicture = function () {
        ImageLoadService.take().then(goToOptions, showErrorDialog);
      };
    });

    function goToOptions() {
      $state.go('options');
    }
    function showErrorDialog(message) {
      if (message !== 'ignore') {
        // when message === ignore don't show any dialog
        // this could happen if user cancel selection or closes camera
        $cordovaDialogs.alert(message, 'An error has occurred')
      }
    }
  });
