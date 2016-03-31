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
      return $cordovaFileOpener2.open(savedFileDetails.path + savedFileDetails.name + '.' + format, mime);
    }

    function _compose() {
      if (savedFileDetails.path !== undefined) {
        //file already saved!
        return alreadySaved();
      } else {
        cacheFolder = getCacheDir();
        return $cordovaFile.writeFile(cacheFolder, tmpName + '.' + format, outputData, true)
          .then(function () {
            $log.info('File \'' + tmpName + '.' + format + '\' saved at: \'' + cacheFolder + '\'.');
            savedFileDetails.path = cacheFolder;
            savedFileDetails.name = tmpName;
            return selectAttachment(cacheFolder, tmpName);
          }, function (error) {
            $log.error('Failed to save file to cache directory:' + error);
            return $q.reject('An error occurred while saving the file.');
          });
      }
    }

    function _saveFile(filename) {
      var saveDestination = $cordovaDevice.getPlatform() === 'iOS' ? cordova.file.dataDirectory : cordova.file.externalDataDirectory;
      if (savedFileDetails.path !== undefined && savedFileDetails.path === getCacheDir()) {
        //already saved in the cache folder
        return alreadyInCache(saveDestination, filename);
      } else {
        return $cordovaFile.writeFile(saveDestination, filename + '.' + format, outputData, true)
          .then(function (success) {
            savedFileDetails.path = saveDestination;
            savedFileDetails.name = filename;
            var message = 'File \'' + filename + '.' + format + '\' saved to \'' + saveDestination + '\'.';
            $log.info(message);
            return $q.resolve(message);
          }, function (error) {
            var message = 'Failed to save the file';
            $log.error(message + '\n' + error);
            return $q.reject(message);
          });
      }
    }

    function alreadySaved() {
      $log.info('Picking a file \'' + savedFileDetails.name + '.' + format + '\' from \'' + savedFileDetails.path + '\' instead of caching one.');
      return selectAttachment(savedFileDetails.path, savedFileDetails.name);
    }

    function selectAttachment(directory, fileName) {
      $log.info('Selecting a file \'' + fileName + '.' + format + '\' from \'' + directory + '\' as an attachment.');
      return $cordovaFile.readAsDataURL(directory, fileName + '.' + format)
        .then(function (success) {
          var data64 = success.split(';base64,').pop();
          return openComposer(data64);
        }, function (error) {
          $log.info('File (\'' + fileName + '.' + format + '\' in \'' + directory + '\') to send NOT read:\n' + error);
          return $q.reject('Failed to read the attachment file.');
        });
    }

    function openComposer(data) {
      var attachment = 'base64:' + savedFileDetails.name + '.' + format + '//' + data;
      return $cordovaEmailComposer.isAvailable()
        .then(function () {
          var emailDetails = {
            app: 'mailto',
            attachments: [
              attachment
            ],
            subject: 'Digitized music scores',
            body: 'This email contains file with music scores, that was produced by the <a href="https://www.symphonia.io">SYMPHONIA.IO</a> service.',
            isHtml: true
          };
          return $cordovaEmailComposer.open(emailDetails)
            .catch(function () {
              return $q.resolve();
              // because the open() function always goes to the error callback; no matter if success or not.
            });
        }, function () {
          return $q.reject('Email composer not available.');
        });
    }

    function alreadyInCache(newDestination, newName) {
      return $cordovaFile.moveFile(getCacheDir(), tmpName + '.' + format, newDestination, newName + '.' + format)
        .then(function () {
          $log.info('File \'' + tmpName + '.' + format + '\' moved from cache and saved to \'' + newDestination + '\' as \'' + newName + '.' + format + '\'.');
          savedFileDetails.path = newDestination;
          savedFileDetails.name = newName;
          var message = 'File \'' + newName + '.' + format + '\' saved to \'' + newDestination + '\'.';
          return $q.resolve(message);
        }, function (error) {
          $log.error('Failed to move file from cache to storage: ' + error);
          return $q.reject('Failed to save the file.');
        });
    }

    function getCacheDir() {
      return cordova.file.cacheDirectory;
    }

    function fuckIt(buffer) {
      return new Blob([buffer], {type: 'application/pdf'});
    }

    return {
      setOutputDataAndFormat: function (data, dataFormat) {
        // FIXME: Is this really a good way?
        outputData = fuckIt(data);
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
