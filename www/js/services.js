angular.module('symphonia.services', [])
  .service('ImageService', function () {
    var imageString;

    var saveImage = function (newObj) {
      imageString = newObj;
    };

    var getImage = function () {
      return imageString;
    };

    return {
      saveImage: saveImage,
      getImage: getImage
    };
  });

