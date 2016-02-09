/**
 * Created by marosseleng on 09/02/16.
 */

angular.module('symphonia.services')
  .factory('SaveAndSendService', function ($log, $cordovaDevice, $cordovaFile, $cordovaEmailComposer, $cordovaToast) {
    var outputData = '';
    var format = '';
    var tmpName = 'tmpData';
    var cacheFolder = undefined;
    var savedFileDetails = {
      path: undefined,
      name: undefined // WITHOUT EXTENSION!!
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
        }, function () {
          // user cancelled email
          $cordovaToast.showShortBottom('Email not sent.');
        });
      }, function () {
        // not available
      });
    }

    function getCacheDir() {
      return cordova.file.cacheDirectory;
    }

    function alreadyInCache(newDestination, newName, didSaveCallback) {
      $cordovaFile.moveFile(getCacheDir(), tmpName + '.' + format, newDestination, newName + '.' + format)
        .then(function () {
          didSaveCallback();
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
      saveData: function (filename, didSaveCallback) {
        var saveDestination = $cordovaDevice.getPlatform() === 'iOS' ? cordova.file.dataDirectory : cordova.file.externalDataDirectory;
        if (savedFileDetails.path !== undefined && savedFileDetails.path === getCacheDir()) {
          //already saved in the cache folder
          alreadyInCache(saveDestination, filename, didSaveCallback);
        } else {
          $cordovaFile.writeFile(saveDestination, filename + '.' + format, outputData, true)
            .then(function (success) {
              didSaveCallback();
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
