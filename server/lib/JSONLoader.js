(function () {
  "use strict";

  var Q = require('q');
  var fs = require('fs');

  var JSONLoader = (function () {

    JSONLoader = function (pFile) {
      this.deferred = Q.defer();
      this.file = pFile;
      this.data;
      var _this = this;
      fs.exists(pFile, function (pExists) {
        if(pExists) {
          fs.readFile(_this.file, null, function (pErr, pData) {
              if (!pErr) {
                  _this.data = JSON.parse(pData);
                  _this.deferred.resolve(_this.data);
              } else {
                  _this.deferred.reject('UNABLE TO READ FILE ' + _this.file);
              }
          });

        } else {
          _this.deferred.reject('FILE NOT FOUND ' + _this.file);
        }
      })

    }

    JSONLoader.prototype.load = function() {
      return this.deferred.promise;

    }

    return JSONLoader;
  }());

  module.exports = JSONLoader;


}());