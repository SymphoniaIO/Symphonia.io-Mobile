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
  //TODO rewrite all the logging messages using $log service!
  .factory('ImageLoadService', function ($cordovaCamera) {
    var imageFileURI = '';
    var base64Data = '';
    //TODO find out why this is not reloading when going back to main screen with cancel button
    //this bug happens only when going back from the success screen, not the options screen

    function savePicture(sourceType, callback) {
      var options = {destinationType: Camera.DestinationType.FILE_URI};
      options.sourceType = sourceType;
      $cordovaCamera.getPicture(options).then(function (newURI) {
        console.log('FILE_URI:' + newURI);
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
      url = 'http://192.168.0.11:8080/api/omr';
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

  .factory('SaveAndSendService', function ($log, $cordovaDevice, $cordovaFile, $cordovaEmailComposer) {
    var outputData = '';
    var format = '';
    var tmpName = 'tmpData';
    var cacheFolder = undefined;
    var savedFileDetails = {
      path: undefined,
      name: undefined//WITHOUT EXTENSION!!
    };

    function alreadySaved() {
      console.log('Picking a file \'' + savedFileDetails.name + '.' + format + '\' from \'' + savedFileDetails.path + '\' instead of caching one.');
      selectAttachment(savedFileDetails.path, savedFileDetails.name);
    }

    function selectAttachment(directory, fileName) {
      console.log('Selecting a file \'' + fileName + '.' + format + '\' from \'' + directory + '\' as an attachment.');
      $cordovaFile.readAsDataURL(directory, fileName + '.' + format)
        .then(function (success) {
          var data64 = success.split(';base64,').pop();
          openComposer(data64);
        }, function (error) {
          console.log('File (\'' + fileName + '.' + format + '\' in \'' + directory + '\') to send NOT read:\n' + error);
        });
    }

    function openComposer(data) {
      var attachment = 'base64:scores.' + format + '//' + data;
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
          //TODO show some toast
        }, function () {
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
          console.log('TMP file moved from cache to proper storage.');
          savedFileDetails.path = newDestination;
          savedFileDetails.name = newName;
        }, function (error) {
          console.log('Error while moving file from cache: ' + error);
        })
    }

    return {
      setOutputDataAndFormat: function (data, dataFormat) {
        outputData = data;
        cacheFolder = undefined;
        savedFileDetails.path = undefined;
        savedFileDetails.name = undefined;
        if (dataFormat == 'musicxml') {
          format = 'xml';
        } else {
          format = 'pdf';
        }
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
      sendToEmail: function() {
        if (savedFileDetails.path !== undefined) {
          //file already saved!
          alreadySaved();
        } else {
          cacheFolder = getCacheDir();
          console.log('Cache DIR: ' + cacheFolder);
          $cordovaFile.writeFile(cacheFolder, tmpName + '.' + format, outputData, true)
            .then(function () {
              console.log('File \'' + tmpName + '.' + format + '\' saved at: \'' + cacheFolder + '\'.');
              savedFileDetails.path = cacheFolder;
              savedFileDetails.name = tmpName;
              selectAttachment(cacheFolder, tmpName);
            }, function (error) {
              console.log('Error while saving file to cache!' + error);
            });
        }
      },
      saveData: function (filename) {
        //TODO: check whether an idiotic user did not put there an extension
        var saveDestination = undefined;
        switch ($cordovaDevice.getPlatform()) {
          case 'iOS':
            console.log('Platform detected == iOS');
            saveDestination = cordova.file.dataDirectory;
            break;
          case 'Android':
            console.log('Platform detected == Android');
            saveDestination = cordova.file.externalDataDirectory;
            break;
          default:
            console.log('Not a supported platform!');
            return;
        }
        if (savedFileDetails.path !== undefined) {
          //already saved in the cache folder
          console.log('Moving file from cache to \'' + saveDestination + '\'.');
          alreadyInCache(saveDestination, filename);
        } else {
          $cordovaFile.writeFile(saveDestination, filename + '.' + format, outputData, true)
            .then(function (success) {
              //TODO show where it is saved!
              savedFileDetails.path = saveDestination;
              savedFileDetails.name = filename;
              console.log('File \'' + filename + '.' + format + '\' saved to \'' + saveDestination + '\'.')
            }, function (error) {
              console.log('Error while saving a file:' + error);
              //show something
            });
        }
      }
    }
  });

