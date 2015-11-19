angular.module('symphonia.controllers', ['ngCordova'])

  .controller('MainCtrl', function ($scope, $cordovaCamera, $ionicPlatform) {
    $ionicPlatform.ready(function () {
      $scope.uploadPicture = function () {
        var options = {
          destinationType: Camera.DestinationType.DATA_URL,
          sourceType: Camera.PictureSourceType.PHOTOLIBRARY
          //popoverOptions: CameraPopoverOptions
        };

        $cordovaCamera.getPicture(options).then(function (imageData) {
          var image = document.getElementById('myImage');
          image.src = "data:image/jpeg;base64," + imageData;
        }, function (err) {
          // error
        });
      };

      $scope.takeAPicture = function () {
        var new_options = {
          destinationType: Camera.DestinationType.DATA_URL,
          sourceType: Camera.PictureSourceType.CAMERA
          //popoverOptions: CameraPopoverOptions
        };

        $cordovaCamera.getPicture(new_options).then(function (imageData) {
          var image = document.getElementById('myImage');
          image.src = "data:image/jpeg;base64," + imageData;
        }, function (err) {
          // error
        });
      }
    });
  })

  .controller('OptionsCtrl', function ($scope, $ionicLoading, $timeout) {
    $scope.outputFormatList = [
      {text: 'Music XML', value: 'mxl'},
      {text: 'PDF', value: 'pdf'}
    ];

    $scope.data = {
      clientSide: 'mxl'
    };

    $scope.show = function () {
      $ionicLoading.show({
        template: '<div class="loader"><svg class="circular">' +
        '<circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/>' +
        '</svg></div>'
      });
      $timeout(function () {
        $ionicLoading.hide();
      }, 2000);
    };
  });
