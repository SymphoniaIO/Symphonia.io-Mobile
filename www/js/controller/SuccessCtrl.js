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
  .controller('SuccessCtrl', function ($log, $scope, $ionicPlatform, $cordovaDialogs, $cordovaToast, SaveAndSendService) {
    $ionicPlatform.ready(function () {

      SaveAndSendService.showSendButton().then(function () {
        $scope.emailAvailable = true;
        $scope.sendEmail = sendEmail;
      }, function () {
        $scope.emailAvailable = false;
      });

      $scope.saveImage = function () {
        $cordovaDialogs.prompt('Enter the name of a file, WITHOUT suffix', 'Filename', ['Cancel', 'Save'], 'scores')
          .then(function (result) {
            switch (result.buttonIndex) {
              case 2:
                SaveAndSendService.saveFile(result.input1)
                  .then(showToast, showErrorDialog);
                break;
              default:
                break;
            }
          });
      };

      function sendEmail() {
        SaveAndSendService.composeEmail().then(function () {
          $cordovaToast.showShortBottom('Email sent.');
        }, function (errorMsg) {
          $cordovaToast.showLongBottom(errorMsg);
        })
      }

      function showToast(message) {
        message += '\n\nTap here to open it!';
        window.plugins.toast.showWithOptions({
          message: message,
          duration: 8000,
          position: 'bottom'
        }, openSavedOr)
      }

      function openSavedOr(result) {
        if (result && result.event) {
          SaveAndSendService.open();
        }
      }

      function showErrorDialog(message) {
        $cordovaDialogs.alert(message, 'An error has occurred.');
      }
    });
  });
