/**
 * Created by marosseleng on 09/02/16.
 */

angular.module('symphonia.services')
  .factory('ImageLoadService', function ($log, $cordovaCamera) {
    var imageFileURI = '';
    var filenameWithExtension = '';
    var base64Data = '';
    var mime = 'image/*';

    function savePicture(sourceType, successCallback, failureCallback) {

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
          failureCallback();
          return;
        }

        imageFileURI = newURI;

        window.plugins.Base64.encodeFile(imageFileURI, function (base64Image) {
          base64Data = base64Image;
          successCallback();
        }, function (error) {
          $log.error('Failed to convert to base64: ' + error);
        });
      }, function (error) {
        $log.error('Failed to pick a photo: ' + error);
      });
    }

    function isFileSupported(extension) {
      $log.debug(extension);
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
        savePicture(Camera.PictureSourceType.PHOTOLIBRARY, successCallback, failureCallback)
      },
      take: function (successCallback, failureCallback) {
        savePicture(Camera.PictureSourceType.CAMERA, successCallback, failureCallback);
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
