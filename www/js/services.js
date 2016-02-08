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

angular.module('symphonia.services', ['ngCordova'])
  .factory('ImageLoadService', function ($log, $cordovaCamera) {
    var imageFileURI = '';
    var base64Data = '';

    function savePicture(sourceType, callback) {
      //TODO we need more details!!!
      var options = {destinationType: Camera.DestinationType.FILE_URI};
      options.sourceType = sourceType;
      $cordovaCamera.getPicture(options).then(function (newURI) {
        imageFileURI = newURI;
        window.plugins.Base64.encodeFile(imageFileURI, function (base64Image) {
          base64Data = base64Image;
          callback();
        }, function (error) {
          $log.error('Failed to convert to base64: ' + error);
          callback();
        });
      }, function (error) {
        $log.error('Failed to pick a photo: ' + error);
      });
    }

    return {
      upload: function (callback) {
        savePicture(Camera.PictureSourceType.PHOTOLIBRARY, callback)
      },
      take: function (callback) {
        savePicture(Camera.PictureSourceType.CAMERA, callback);
      },
      getImageURI: function () {
        return imageFileURI;
      },
      getBase64: function () {
        return base64Data;
      }
    };
  })

  .factory('ProcessingService', function ($log, $cordovaDevice, $cordovaFileTransfer, ImageLoadService, SaveAndSendService) {
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
        //TODO maybe try different framework/plugin or do something to fix this
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
  })

  .factory('SaveAndSendService', function ($log, $cordovaDevice, $cordovaFile, $cordovaEmailComposer, $cordovaToast) {
    var outputData = '';
    var format = '';
    var tmpName = 'tmpData';
    var cacheFolder = undefined;
    var savedFileDetails = {
      path: undefined,
      name: undefined//WITHOUT EXTENSION!!
    };

    function alreadySaved() {
      $log.info('Picking a file \'' + savedFileDetails.name + '.' + format + '\' from \'' + savedFileDetails.path + '\' instead of caching one.');
      selectAttachment(savedFileDetails.path, savedFileDetails.name);
    }

    function selectAttachment(directory, fileName) {
      $log.info('Selecting a file \'' + fileName + '.' + format + '\' from \'' + directory + '\' as an attachment.');
      $cordovaFile.readAsDataURL(directory, fileName + '.' + format)
        .then(function (success) {
          var data64 = success.split(';base64,').pop();
          openComposer(data64);
        }, function (error) {
          $log.info('File (\'' + fileName + '.' + format + '\' in \'' + directory + '\') to send NOT read:\n' + error);
        });
    }

    function openComposer(data) {
      var attachment = 'base64:' + savedFileDetails.name + '.' + format + '//' + data;
      $cordovaEmailComposer.isAvailable().then(function () {
        //email available
        var emailDetails = {
          app: 'mailto',
          attachments: [
            attachment
          ],
          subject: 'Digitized music scores',
          body: 'This email contains file with music scores, that was produced by the <a href="https://www.symphonia.io">SYMPHONIA.IO</a> service.',
          isHtml: true
        };

        $cordovaEmailComposer.open(emailDetails).then(function () {
          $cordovaToast.showShortBottom('Email sent.');
          //TODO show some toast
        }, function () {
          $cordovaToast.showShortBottom('Email not sent.');
          // user cancelled email
        });
      }, function () {
        // not available
      });
    }

    function getCacheDir() {
      return cordova.file.cacheDirectory;
    }

    function alreadyInCache(newDestination, newName) {
      $cordovaFile.moveFile(getCacheDir(), tmpName + '.' + format, newDestination, newName + '.' + format)
        .then(function () {
          $log.info('File \'' + tmpName + '.' + format + '\' moved from cache and saved to \'' + newDestination + '\' as \'' + newName + '.' + format + '\'.');
          savedFileDetails.path = newDestination;
          savedFileDetails.name = newName;
          $cordovaToast.showShortBottom('File \'' + newName + '.' + format + '\' saved to \'' + newDestination + '\'.')
        }, function (error) {
          $log.error('Failed to move file from cache to storage: ' + error);
        })
    }

    return {
      setOutputDataAndFormat: function (data, dataFormat) {
        outputData = data;
        cacheFolder = undefined;
        savedFileDetails.path = undefined;
        savedFileDetails.name = undefined;
        format = dataFormat == 'musicxml' ? 'xml' : 'pdf';
      },
      showButton: function (ifAvailableCallback, ifNotAvailableCallback) {
        $cordovaEmailComposer.isAvailable().then(function () {
          ifAvailableCallback();
        }, function () {
          ifNotAvailableCallback();
        });
      },
      sendToEmail: function () {
        if (savedFileDetails.path !== undefined) {
          //file already saved!
          alreadySaved();
        } else {
          cacheFolder = getCacheDir();
          $cordovaFile.writeFile(cacheFolder, tmpName + '.' + format, outputData, true)
            .then(function () {
              $log.info('File \'' + tmpName + '.' + format + '\' saved at: \'' + cacheFolder + '\'.');
              savedFileDetails.path = cacheFolder;
              savedFileDetails.name = tmpName;
              selectAttachment(cacheFolder, tmpName);
            }, function (error) {
              $log.error('Failed to save file to cache directory:' + error);
            });
        }
      },
      saveData: function (filename) {
        var saveDestination = $cordovaDevice.getPlatform() === 'iOS' ? cordova.file.dataDirectory : cordova.file.externalDataDirectory;
        if (savedFileDetails.path !== undefined && savedFileDetails.path === getCacheDir()) {
          //already saved in the cache folder
          alreadyInCache(saveDestination, filename);
        } else {
          $cordovaFile.writeFile(saveDestination, filename + '.' + format, outputData, true)
            .then(function (success) {
              savedFileDetails.path = saveDestination;
              savedFileDetails.name = filename;
              var message = 'File \'' + filename + '.' + format + '\' saved to \'' + saveDestination + '\'.';
              $cordovaToast.showShortBottom(message);
              $log.info(message)
            }, function (error) {
              var message = 'Failed to save the file';
              $log.error(message + '\n' + error);
              $cordovaToast.showShortBottom(message);
            });
        }
      }
    }
  });

