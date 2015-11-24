angular.module('symphonia.controllers', ['ngCordova','ng-walkthrough'])

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

  .controller('OptionsCtrl', function ($scope, $ionicLoading, $timeout, ImageService) {
    //$ionicPlatform.ready(function () {
    //  $cordovaEmailComposer.isAvailable().then(function() {
    //    // is available
    //  }, function () {
    //    // not available
    //    $state.go('main');
    //  });
    //
    //  $scope.sendEmail = function () {
    //    var emailDetails = {
    //      to: 'marosseleng@gmail.com',
    //      attachments: [
    //        'base64:picture.jpg//' + ImageService.getImage()
    //        //,'file://README.pdf'
    //      ],
    //      subject: 'Greetings from app!',
    //      body: 'This email was sent from my app!',
    //      isHtml: false
    //    };
    //
    //    $cordovaEmailComposer.open(emailDetails).then(function () {
    //      //this.show();
    //    }, function () {
    //      this.show();
    //      // user cancelled email
    //    });
    //  };
    //});

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
      }, 2000);
    };
  })
  .controller('AboutCtrl', function() {

  });
