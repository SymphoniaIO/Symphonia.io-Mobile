/**
 * Created by marosseleng on 09/02/16.
 */

angular.module('symphonia.services')
  .factory('ProcessingService', function ($log, $cordovaDevice, $cordovaFileTransfer, $cordovaToast, ImageLoadService, SaveAndSendService) {
    //TODO with stable symphonia service, remove this workaround
    var url = $cordovaDevice.getPlatform() === 'iOS' ? 'http://localhost:8080/api/omr' : 'http://192.168.0.12:8080/api/omr';
    //var url = 'http://46.101.224.141:8080/api/omr';
    var errorMessage = '';

    return {
      process: function (format, successCallback, failureCallback) {
        var endpoint = url + '/' + format;
        var options = new FileUploadOptions();
        options.fileKey = 'attachment';
        options.chunkedMode = false;
        options.fileName = ImageLoadService.getFilenameWithExtension();
        options.mimeType = ImageLoadService.getMime();

        //TODO maybe try different framework/plugin or do something to fix thiSHAREs
        $cordovaFileTransfer.upload(endpoint, ImageLoadService.getImageURI(), options)
          .then(function (result) {
            if ($cordovaDevice.getPlatform() === 'Android' && result.response.length == 0) {
              errorMessage = "Provide image with higher resolution.";
              failureCallback()
            } else {
              SaveAndSendService.setOutputDataAndFormat(result.response, format);
              switch (result.responseCode) {
                case 500:
                  errorMessage = "Error processing input image.";
                  failureCallback();
                  break;
                case 204:
                  errorMessage = "No supported image provided.";
                  failureCallback();
                  break;
                default:
                  successCallback();
                  break;
              }
            }
            // Success!
          }, function (error) {
            $log.error('Failed to upload a file:\n' + error.code);
            errorMessage = "Failed to upload a file.\nCheck your internet connection.";
            failureCallback();
            // Error
          });
      },
      getErrorMessage: function () {
        return errorMessage;
      }
    }
  });
