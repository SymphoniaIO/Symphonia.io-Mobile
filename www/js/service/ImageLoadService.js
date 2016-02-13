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
  .factory('ImageLoadService', function ($log, $cordovaCamera, $cordovaDevice) {
    var imageFileUri = '';
    var filenameWithExtension = '';
    var base64Data = '';
    var mime = 'image/*';

    function getPicture(sourceType, successCallback, failureCallback) {

      var options = {
        destinationType: Camera.DestinationType.FILE_URI,
        saveToPhotoAlbum: true,
        mediaType: Camera.MediaType.PICTURE,
        sourceType: sourceType
      };

      $cordovaCamera.getPicture(options).then(function (newUri) {
        switch ($cordovaDevice.getPlatform()) {
          case 'iOS':
            isIos(newUri, successCallback, failureCallback);
            break;
          case 'Android':
            isAndroid(newUri, successCallback, failureCallback);
            break;
          default:
            return;
        }
      }, function (error) {
        $log.error('Failed to pick a photo: ' + error);
        failureCallback('Error while processing a picture.')
      });
    }

    function isIos(uri, successCallback, failureCallback) {
      setFieldsAndData(uri, successCallback, failureCallback);
    }

    function isAndroid(uri, successCallback, failureCallback) {
      window.FilePath.resolveNativePath(uri, function (correctUri) {
        setFieldsAndData(correctUri, successCallback, failureCallback);
      }, function (error) {
        $log.error('Failed to get the correct FILE_URI: ' + error);
        failureCallback('Error while processing a picture.');
      });
    }

    function setFieldsAndData(uri, successCallback, failureCallback) {
      filenameWithExtension = uri.substr(uri.lastIndexOf('/') + 1);
      var extension = filenameWithExtension.substr(filenameWithExtension.lastIndexOf('.') + 1);

      if (!isFileSupported(extension)) {
        failureCallback('File type not supported!');
      } else {
        imageFileUri = uri;
        toBase64(imageFileUri, successCallback, failureCallback);
      }
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

    function toBase64(uri, successCallback, failureCallback) {
      window.plugins.Base64.encodeFile(uri, function (base64) {
        base64Data = base64;
        successCallback()
      }, function (error) {
        $log.error('Failed to convert to base64: ' + error);
        failureCallback('Error while processing a picture.');
      });
    }

    function getImageUri() {
      return imageFileUri;
    }

    function getBase64() {
      return base64Data;
    }

    function getFilenameWithExtension() {
      return filenameWithExtension;
    }

    function getMime() {
      return mime;
    }

    return {
      upload: function (successCallback, failureCallback) {
        getPicture(Camera.PictureSourceType.PHOTOLIBRARY, successCallback, failureCallback)
      },
      take: function (successCallback, failureCallback) {
        getPicture(Camera.PictureSourceType.CAMERA, successCallback, failureCallback);
      },
      getImageUri: getImageUri,
      getBase64: getBase64,
      getFilenameWithExtension: getFilenameWithExtension,
      getMime: getMime
    };
  });
