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

angular.module('symphonia.services')
  .factory('ProcessingService', function ($log, $cordovaDevice, $cordovaFileTransfer, $cordovaToast, ImageLoadService, SaveAndSendService) {
    var errorMessage = '';

    function _process(format, successCallback, failureCallback) {
      // TODO with stable symphonia service, uncomment the following line
      //var url = 'http://46.101.224.141:8080/api/omr'; // and delete the next one
      var url = $cordovaDevice.getPlatform() === 'iOS' ? 'http://localhost:8080/api/omr' : 'http://192.168.1.6:8080/api/omr';

      var endpoint = url + '/' + format;

      var options = new FileUploadOptions();
      options.fileKey = 'attachment';
      options.chunkedMode = false;
      options.fileName = ImageLoadService.getFilenameWithExtension();
      options.mimeType = ImageLoadService.getMime();

      // TODO maybe try different framework/plugin or do something to fix this
      $cordovaFileTransfer.upload(endpoint, ImageLoadService.getImageUri(), options)
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
        }, function (error) {
          $log.error('Failed to upload a file:\n' + error.code);
          errorMessage = "Failed to upload a file.\nCheck your internet connection.";
          failureCallback();
        });
    }

    function _getErrorMessage() {
      return errorMessage;
    }

    return {
      process: _process,
      getErrorMessage: _getErrorMessage
    }
  });
