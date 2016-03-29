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
  .factory('SaveAndSendService', function ($q, $log, $cordovaDevice, $cordovaFile, $cordovaEmailComposer, $cordovaFileOpener2) {
    var outputData = '';
    var format = '';
    var tmpName = 'tmpData';
    var cacheFolder = undefined;
    var savedFileDetails = {
      path: undefined,
      name: undefined // WITHOUT EXTENSION!!
    };

    function _open() {
      var mime = format === 'xml' ? 'text/xml' : 'application/pdf';
      $cordovaFileOpener2.open(savedFileDetails.path + savedFileDetails.name + '.' + format, mime)
        .then(function () {
          //TODO maybe do something here?
        }, function () {
          //TODO maybe do something here?
        });
    }

    function _compose() {
      var deferred = $q.defer();
      if (savedFileDetails.path !== undefined) {
        //file already saved!
        return alreadySaved();
      } else {
        cacheFolder = getCacheDir();
        $cordovaFile.writeFile(cacheFolder, tmpName + '.' + format, outputData, true)
          .then(function () {
            $log.info('File \'' + tmpName + '.' + format + '\' saved at: \'' + cacheFolder + '\'.');
            savedFileDetails.path = cacheFolder;
            savedFileDetails.name = tmpName;
            selectAttachment(cacheFolder, tmpName)
              .then(function() {
                deferred.resolve();
              }, function(errorMsg) {
                deferred.reject(errorMsg);
              });
          }, function (error) {
            $log.error('Failed to save file to cache directory:' + error);
            deferred.reject('An error occurred while saving the file.');
          });

        return deferred.promise;
      }
    }

    function _saveFile(filename) {
      var deferred = $q.defer();
      var saveDestination = $cordovaDevice.getPlatform() === 'iOS' ? cordova.file.dataDirectory : cordova.file.externalDataDirectory;
      if (savedFileDetails.path !== undefined && savedFileDetails.path === getCacheDir()) {
        //already saved in the cache folder
        return alreadyInCache(saveDestination, filename);
      } else {
        $cordovaFile.writeFile(saveDestination, filename + '.' + format, outputData, true)
          .then(function (success) {
            savedFileDetails.path = saveDestination;
            savedFileDetails.name = filename;
            var message = 'File \'' + filename + '.' + format + '\' saved to \'' + saveDestination + '\'.';
            $log.info(message);
            deferred.resolve(message);
          }, function (error) {
            var message = 'Failed to save the file';
            $log.error(message + '\n' + error);
            deferred.reject(message);
          });
        return deferred.promise;
      }
    }

    function alreadySaved() {
      $log.info('Picking a file \'' + savedFileDetails.name + '.' + format + '\' from \'' + savedFileDetails.path + '\' instead of caching one.');
      return selectAttachment(savedFileDetails.path, savedFileDetails.name);
    }

    function selectAttachment(directory, fileName) {
      var deferred = $q.defer();
      $log.info('Selecting a file \'' + fileName + '.' + format + '\' from \'' + directory + '\' as an attachment.');
      $cordovaFile.readAsDataURL(directory, fileName + '.' + format)
        .then(function (success) {
          var data64 = success.split(';base64,').pop();
          openComposer(data64).then(function () {
            deferred.resolve();
          }, function (errorMsg) {
            deferred.reject(errorMsg);
          });
        }, function (error) {
          $log.info('File (\'' + fileName + '.' + format + '\' in \'' + directory + '\') to send NOT read:\n' + error);
          deferred.reject('Failed to read the attachment file.');
        });
      return deferred.promise;
    }

    function openComposer(data) {
      var deferred = $q.defer();
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
          // THIS IS NEVER CALLED
          deferred.resolve();
        }, function () {
          //deferred.reject('An error occurred while composing the mail.');
          deferred.resolve(); // not correct actually, but there is no other way
          // it could be kinda solved by not using the ngCordova's namespace, but plugin's own one.
          // That adds a parameter to callback which says whether email has been sent or not. but it only works on the iOS
          // In order to stay consistent and not use plugins themselves directly I choose this way.
        });
      }, function () {
        deferred.reject('Email composer not available.');
      });
      return deferred.promise;
    }

    function alreadyInCache(newDestination, newName) {
      var deferred = $q.defer();
      $cordovaFile.moveFile(getCacheDir(), tmpName + '.' + format, newDestination, newName + '.' + format)
        .then(function () {
          $log.info('File \'' + tmpName + '.' + format + '\' moved from cache and saved to \'' + newDestination + '\' as \'' + newName + '.' + format + '\'.');
          savedFileDetails.path = newDestination;
          savedFileDetails.name = newName;
          var message = 'File \'' + newName + '.' + format + '\' saved to \'' + newDestination + '\'.';
          deferred.resolve(message);
        }, function (error) {
          $log.error('Failed to move file from cache to storage: ' + error);
          deferred.reject('Failed to save the file.');
        });
      return deferred.promise;
    }

    function getCacheDir() {
      return cordova.file.cacheDirectory;
    }

    return {
      setOutputDataAndFormat: function (data, dataFormat) {
        // FIXME: Is this really a good way?
        outputData = data;
        cacheFolder = undefined;
        savedFileDetails.path = undefined;
        savedFileDetails.name = undefined;
        format = dataFormat == 'musicxml' ? 'xml' : 'pdf';
      },
      open: _open,
      composeEmail: _compose,
      saveFile: _saveFile,
      showSendButton: function () {
        return $cordovaEmailComposer.isAvailable()
      }
    }
  });
