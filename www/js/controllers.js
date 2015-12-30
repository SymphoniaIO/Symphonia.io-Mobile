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
  //TODO move logic to services!

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

  .controller('OptionsCtrl', function ($scope, $ionicLoading, $timeout, $state, ImageLoadService) {
    $scope.outputFormatList = [
      {text: 'Music XML', value: 'mxl'},
      {text: 'PDF', value: 'pdf'}
    ];

    $scope.data = {
      outputFormat: 'mxl',
      imageData: ImageLoadService.getBase64()
    };

    $scope.show = function () {
      console.log("imageData:\n" + $scope.data.imageData);
      $ionicLoading.show({
        template: '<div class="loader"><svg class="circular">' +
        '<circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/>' +
        '</svg></div>'
      });
      $timeout(function () {
        $ionicLoading.hide();
        $state.go('success');
      }, 2000);
    };


  })

  .controller('AboutCtrl', function () {

  })

  .controller('SuccessCtrl', function ($state, $http, $scope, $ionicPlatform, $cordovaDevice, $cordovaFile, $cordovaEmailComposer, $cordovaDialogs, $cordovaFileTransfer, ImageLoadService) {
    $ionicPlatform.ready(function () {
      $cordovaEmailComposer.isAvailable().then(function () {
        $scope.emailAvailable = true;

        $scope.sendEmail = function () {
          var emailDetails = {
            app: 'mailto',
            attachments: [
              'base64:picture.jpg//' + ImageLoadService.getImageURI()
              //,'file://README.pdf'
            ],
            subject: 'Digitalized music scores',
            body: 'This email contains file with music scores, that was produced by the <a href="https://www.symphonia.io">SYMPHONIA.IO</a> service.',
            isHtml: true
          };

          $cordovaEmailComposer.open(emailDetails).then(function () {

          }, function () {
            // user cancelled email
          });
        };// is available
      }, function () {
        $scope.emailAvailable = false;
        // not available
      });

      $scope.downloadWatImage = function () {
        $cordovaDialogs.prompt('Enter the name of a file, WITHOUT suffix', 'Filename', ['Cancel', 'Save'], 'scores')
          .then(function (result) {
            var saveDestination;
            if ($cordovaDevice.getPlatform() === 'iOS') {
              saveDestination = cordova.file.tempDirectory;
            } else if ($cordovaDevice.getPlatform() === 'Android') {
              saveDestination = cordova.file.externalDataDirectory;
            } else {
              return;
            }


            var options = new FileUploadOptions();
            options.fileKey = 'attachment';
            options.fileName = 'blablabla.png';


            var fd = new FormData();
            fd.append('attachment', 'base64:picture.jpg//' + ImageLoadService.getImageURI());
            $http.post('http://demo5941478.mockable.io/image', fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
              })
              .then(function () {
                console.log("blablabla")
                console.log('base64:picture.jpg//' + ImageLoadService.getImageURI());
              }, function () {
              });
            //$http.post('http://demo5941478.mockable.io/image', {'attachment':'base64:picture.jpg//' + ImageLoadService.getImageURI()}, {responseType: 'arraybuffer'})
            //  .then(function (response) {
            //  //$cordovaFile.writeFile(saveDestination, result.input1 + '.pdf', response.data, true);
            //  console.log("blablabla");
            //}, function () {
            //
            //});
            //$http.get('http://www.cypherpunks.to/~peter/06_random.pdf', {responseType: 'arraybuffer'}).then(function (response) {
            //  $cordovaFile.writeFile(saveDestination, result.input1 + '.pdf', response.data, true);
            //}, function () {
            //
            //});
            // no button = 0, 'OK' = 1, 'Cancel' = 2
            //var btnIndex = result.buttonIndex;
          });

      };
    });
  })

  .controller('FailureCtrl', function () {

  });
