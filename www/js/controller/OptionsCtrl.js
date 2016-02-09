/**
 * Created by marosseleng on 09/02/16.
 */

angular.module('symphonia.controllers')
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
  });
