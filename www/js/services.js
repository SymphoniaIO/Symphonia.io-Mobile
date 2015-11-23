angular.module('symphonia.services', [])
  .service('ImageService', function () {
    var imageString;

    return {
      saveImage: function (newObj) {
        imageString = newObj;
      },
      getImage: function () {
        return imageString;
      }
    };
  });

