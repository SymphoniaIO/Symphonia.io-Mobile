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
  .factory('ImageLoadService', function ($cordovaCamera) {
    var imageFileURI = '';
    var base64Data = '';
    //TODO find out why this is not reloading when going back to main screen with cancel button
    //this bug happens only when going back from the success screen, not the options screen

    function savePicture(sourceType, callback) {
      var options = {destinationType: Camera.DestinationType.FILE_URI};
      options.sourceType = sourceType;
      $cordovaCamera.getPicture(options).then(function (newURI) {
        imageFileURI = newURI;
        window.plugins.Base64.encodeFile(imageFileURI, function (base64Image) {
          base64Data = base64Image;
          callback();
        }, function (error) {
          console.log('Error while converting to base64: ' + error);
          callback();
        });
      }, function (error) {
        console.log('Error while picking a photo: ' + error);
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

  .factory('ProcessingService', function ($cordovaDevice, $cordovaFileTransfer, ImageLoadService, SaveAndSendService) {
    var url = '';
    if ($cordovaDevice.getPlatform() === 'iOS') {
      url = 'http://localhost:8080/api/omr';
    } else if ($cordovaDevice.getPlatform() === 'Android') {
      url = 'http://192.168.1.5:8080/api/omr';
    } else {
      return;
    }
    return {
      process: function (format, successCallback, failureCallback) {
        var endpoint = url + '/' + format;
        var options = new FileUploadOptions();
        options.fileKey = 'attachment';
        options.chunkedMode = false;
        $cordovaFileTransfer.upload(endpoint, ImageLoadService.getImageURI(), options)
          .then(function (result) {
            SaveAndSendService.setOutputDataAndFormat(result.response, format);
            successCallback();
            // Success!
          }, function (error) {
            console.log('Error while uploading a file:\n' + error.code);
            failureCallback();
            // Error
          });
      }
    }
  })

  .factory('SaveAndSendService', function ($cordovaFile, $cordovaEmailComposer, $cordovaDevice, ImageLoadService) {
    var outputData = '';
    var format = '';
    var tmpName = 'tmpData';
    var cacheFolder = undefined;

    function clearMess() {
      //TODO create advanced check, eg. if file has already been saved to dataDirectory, while sending an email, do NOT save it again to cacheDirectory and vice versa
      //and bind THIS method to cancel button on success screen
      //maybe, when cancel button was pressed, clear everything
    }

    function saveTmp() {
      cacheFolder = cordova.file.cacheDirectory;
      console.log('Cache DIR: ' + cacheFolder);
      $cordovaFile.writeFile(cacheFolder, tmpName + '.' + format, outputData, true)
        .then(function () {
          console.log('tmpData file saved at: ' + cacheFolder);
          $cordovaFile.readAsDataURL(cacheFolder, tmpName + '.' + format)
            .then(function (success) {
              var data64 = success.split(';base64,').pop();
              sendMail(data64);
            }, function (error) {
              console.log('TMP File NOT read:\n' + error);
            });
        }, function () {
        });
    }

    function sendMail(data) {
      var attachement = 'base64:scores.' + format + '//' + data;
      console.log('ATTACHEMENT:\n' + attachement);
      $cordovaEmailComposer.isAvailable().then(function () {
        var emailDetails = {
          app: 'mailto',
          attachments: [
            attachement
          ],
          subject: 'Digitized music scores',
          body: 'This email contains file with music scores, that was produced by the <a href="https://www.symphonia.io">SYMPHONIA.IO</a> service.',
          isHtml: true
        };

        $cordovaEmailComposer.open(emailDetails).then(function () {
          //TODO show some toast
          $cordovaFile.removeFile(cacheFolder, tmpName + '.' + format)
            .then(function (success) {
              console.log('TMP file successfully deleted!');
            }, function (error) {
            });
        }, function () {
          // user cancelled email
        });
        // is available
      }, function () {
        // not available
      });
    }

    return {
      setOutputDataAndFormat: function (data, dataFormat) {
        outputData = data;
        if (dataFormat == 'musicxml') {
          format = 'xml';
        } else {
          format = 'pdf';
        }
      },
      getOutputData: function () {
        return outputData;
      },
      getFormat: function () {
        return format;
      },
      showButton: function (ifAvailableCallback, ifNotAvailableCallback) {
        $cordovaEmailComposer.isAvailable().then(function () {
          console.log('cordovaEmail is available!');
          ifAvailableCallback();
        }, function () {
          console.log('cordovaEmail is NOT available!');
          ifNotAvailableCallback();
        });
      },
      sendToEmail: saveTmp,
      saveData: function (filename) {
        var saveDestination;
        if ($cordovaDevice.getPlatform() === 'iOS') {
          console.log('Platform detected == iOS');
          saveDestination = cordova.file.dataDirectory;
        } else if ($cordovaDevice.getPlatform() === 'Android') {
          console.log('Platform detected == Android');
          saveDestination = cordova.file.externalDataDirectory;
        } else {
          return;
        }
        console.log('DEST: ' + saveDestination);
        $cordovaFile.writeFile(saveDestination, filename + '.' + format, outputData, true)
          .then(function (success) {
            //TODO show where it is saved!
          }, function (error) {
            //show something
          });
      }
    }
  });

