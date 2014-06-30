(function () {
  
  var Progress = require('progress');

  var ProgressBar = (function (pTotal) {
    var ProgressBar = function (pTotal) {
      this.progress = new Progress('    [:bar] :percent :current/:total', {
                        complete: '=',
                        incomplete: ' ',
                        width: 40,
                        total: pTotal
                      });

    }

    ProgressBar.prototype.tick = function(pLength) {
      this.progress.tick(pLength);
    }

    return ProgressBar;

  }());

  module.exports = ProgressBar;

}());