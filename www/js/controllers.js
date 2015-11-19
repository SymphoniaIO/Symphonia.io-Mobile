angular.module('symphonia.controllers', [])

  .controller('MainCtrl', function () {

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
