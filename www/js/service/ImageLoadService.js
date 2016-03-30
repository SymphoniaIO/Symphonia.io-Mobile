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
  .factory('ImageLoadService', function ($q, $log, $cordovaCamera, $cordovaDevice) {
    var imageFileUri = '';
    var filenameWithExtension = '';
    var base64Data = '';
    var mime = 'image/*';

    function getPicture(sourceType) {
      var options = {
        destinationType: Camera.DestinationType.FILE_URI,
        mediaType: Camera.MediaType.PICTURE,
        sourceType: sourceType,
        saveToPhoroAlbum: sourceType === Camera.PictureSourceType.CAMERA
      };

      return $cordovaCamera.getPicture(options).then(function (newUri) {
        switch ($cordovaDevice.getPlatform()) {
          case 'iOS':
            return isIos(newUri);
          case 'Android':
            return isAndroid(newUri);
          default:
            return $q.reject('');
        }
      }, function (error) {
        if (error.toUpperCase() === 'Selection cancelled.'.toUpperCase() ||
          error.toUpperCase() === 'Camera cancelled.'.toUpperCase() ||
          error.toUpperCase() === 'no image selected'.toUpperCase()) {
          // When cancelled by user, we do not want to show error dialog.
          // FIXME: maybe there is some another error message when camera cancelled on iOS.
          // #wontfix until there is a opportunity to try on the real iOS device (not just simulator)
          return $q.when();
        }
        $log.error('Failed to pick a photo: ' + error);
        return $q.reject('Error while processing a picture.');
      });
    }

    function isIos(uri) {
      return getCorrectFileUriAndBase64Data(uri).then(function (uriAndRawBase64) {
        base64Data = uriAndRawBase64.base64;
        imageFileUri = uriAndRawBase64.uri;
        return $q.when();
      }, function (message) {
        return $q.reject(message);
      });
    }

    function isAndroid(uri) {
      var deferred = $q.defer();

      $log.debug('URI before edition:' + uri);
      window.FilePath.resolveNativePath(uri, function (correctUri) {
        // FIXME newest security update will probably crash this workaround
        $log.debug('URI after edition' + correctUri);
        getCorrectFileUriAndBase64Data(correctUri).then(function (uriAndRawBase64) {
          base64Data = uriAndRawBase64.base64;
          imageFileUri = uriAndRawBase64.uri;
          deferred.resolve();
        }, function (message) {
          deferred.reject(message);
        });
      }, function (error) {
        $log.error('Failed to get the correct FILE_URI: ' + error);
        deferred.reject('Error while processing a picture.');
      });

      return deferred.promise;
    }

    function getCorrectFileUriAndBase64Data(uri) {
      var deferred = $q.defer();

      filenameWithExtension = uri.substr(uri.lastIndexOf('/') + 1);
      var extension = filenameWithExtension.substr(filenameWithExtension.lastIndexOf('.') + 1);

      if (!isFileSupported(extension)) {
        $log.error('Selected file\'s extension is not supported: ' + extension);
        deferred.reject('File type not supported');
      } else {
        window.plugins.Base64.encodeFile(uri, function (base64) {
          deferred.resolve({base64: base64, uri: uri});
        }, function (error) {
          $log.error('Failed to convert to base64: ' + error);
          deferred.reject('Error while processing a picture.');
        })
      }

      return deferred.promise;
    }

    function isFileSupported(extension) {
      switch (extension) {
        case 'bmp':
          mime = 'image/bmp';
          return true;
        case 'gif':
          mime = 'image/gif';
          return true;
        case 'jpeg':
          mime = 'image/jpeg';
          return true;
        case 'jpg':
          mime = 'image/jpeg';
          return true;
        case 'png':
          mime = 'image/png';
          return true;
        case 'tiff':
          mime = 'image/tiff';
          return true;
        default:
          return false;
      }
    }

    function _upload() {
      return getPicture(Camera.PictureSourceType.PHOTOLIBRARY);
    }

    function _take() {
      return getPicture(Camera.PictureSourceType.CAMERA);
    }

    function _getImageUri() {
      return imageFileUri;
    }

    function _getBase64() {
      return base64Data;
    }

    function _getFilenameWithExtension() {
      return filenameWithExtension;
    }

    function _getMime() {
      return mime;
    }

    return {
      upload: _upload,
      take: _take,
      getImageUri: _getImageUri,
      getBase64: _getBase64,
      getFilenameWithExtension: _getFilenameWithExtension,
      getMime: _getMime
    };
  });
