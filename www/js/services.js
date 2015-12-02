angular.module('symphonia.services', [])
  .service('ImageUploadService', function () {
    var imageString;

    return {
      saveImage: function (newObj) {
        imageString = newObj;
      },
      getImage: function () {
        return imageString;
      }
    };
  })
  .service('FileDownloadService', function () {

  });

