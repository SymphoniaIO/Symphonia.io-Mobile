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
  .factory('ImageLoadService', function ($log, $cordovaCamera) {
    var imageFileURI = '';
    var filenameWithExtension = '';
    var base64Data = '';
    var mime = 'image/*';

    function getPicture(sourceType, successCallback, failureCallback) {

      var options = {
        destinationType: Camera.DestinationType.FILE_URI,
        saveToPhotoAlbum: true,
        mediaType: Camera.MediaType.PICTURE
      };
      options.sourceType = sourceType;

      $cordovaCamera.getPicture(options).then(function (newURI) {

        var filenameAndExtension = newURI.substr(newURI.lastIndexOf('/') + 1);
        filenameWithExtension = filenameAndExtension.lastIndexOf('.') < 0 ? "wildcard.jpg" : filenameAndExtension;
        var extension = filenameWithExtension.substr(filenameWithExtension.lastIndexOf('.') + 1);

        if (!isFileSupported(extension)) {
          failureCallback('File type not supported!');
          return;
        }

        imageFileURI = newURI;

        window.plugins.Base64.encodeFile(imageFileURI, function (base64Image) {
          base64Data = base64Image;
          successCallback();
        }, function (error) {
          $log.error('Failed to convert to base64: ' + error);
          failureCallback('Error while processing a picture.');
        });
      }, function (error) {
        $log.error('Failed to pick a photo: ' + error);
        failureCallback('Error while processing a picture.')
      });
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

    return {
      upload: function (successCallback, failureCallback) {
        getPicture(Camera.PictureSourceType.PHOTOLIBRARY, successCallback, failureCallback)
      },
      take: function (successCallback, failureCallback) {
        getPicture(Camera.PictureSourceType.CAMERA, successCallback, failureCallback);
      },
      getImageURI: function () {
        return imageFileURI;
      },
      getBase64: function () {
        return base64Data;
      },
      getFilenameWithExtension: function () {
        return filenameWithExtension;
      },
      getMime: function () {
        return mime;
      }
    };
  });