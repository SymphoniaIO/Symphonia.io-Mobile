angular.module('symphonia.controllers', ['ngCordova', 'ng-walkthrough'])

  .controller('MainCtrl', function ($scope, $cordovaCamera, $ionicPlatform, $state, ImageService) {
    $ionicPlatform.ready(function () {
      $scope.uploadPicture = function () {
        var options = {
          destinationType: Camera.DestinationType.DATA_URL,
          sourceType: Camera.PictureSourceType.PHOTOLIBRARY
        };

        $cordovaCamera.getPicture(options).then(function (imageData) {
          ImageService.saveImage(imageData);
          $state.go('options');
        }, function (err) {
          // error
        });
      };

      $scope.takeAPicture = function () {
        var new_options = {
          destinationType: Camera.DestinationType.DATA_URL,
          sourceType: Camera.PictureSourceType.CAMERA
        };

        $cordovaCamera.getPicture(new_options).then(function (imageData) {
          ImageService.saveImage(imageData);
          $state.go('options');
        }, function (err) {
          // error
        });
      }
    });
  })

  .controller('OptionsCtrl', function ($scope, $ionicLoading, $timeout, $state, ImageService) {
    $scope.outputFormatList = [
      {text: 'Music XML', value: 'mxl'},
      {text: 'PDF', value: 'pdf'}
    ];

    $scope.data = {
      outputFormat: 'mxl',
      imageData: "data:image/jpeg;base64," + ImageService.getImage()
    };

    $scope.show = function () {
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

  .controller('SuccessCtrl', function ($state, $scope, $ionicPlatform, $cordovaEmailComposer, ImageService) {
    $ionicPlatform.ready(function () {
      $cordovaEmailComposer.isAvailable().then(function () {
        $scope.emailAvailable = true;
        // is available
      }, function () {
        $scope.emailAvailable = false;
        // not available
      });
    });

    $scope.sendEmail = function () {
      var emailDetails = {
        app: 'mailto',
        attachments: [
          'base64:picture.jpg//' + ImageService.getImage()
          //,'file://README.pdf'
        ],
        subject: 'Digitalized music scores',
        body: 'This email contains file with music scores, that was produced by the <a href="https://www.symphonia.io">SYMPHONIA.IO</a> service.',
        isHtml: true
      };

      $cordovaEmailComposer.open(emailDetails).then(function() {

      }, function () {
        // user cancelled email
      });
    };
  })

  .controller('FailureCtrl', function () {

  });
