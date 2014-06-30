(function () {

  var util = require('util');

  var Logger = (function () {
      function Logger(level, enabled) {
          if (typeof level === "undefined") { level = 3; }
          if (typeof enabled === "undefined") { enabled = true; }
          this.level = level;
          this.enabled = enabled;
          if (!Logger._LOGGER) {
              Logger._LOGGER = this;
          }

          return Logger._LOGGER;
      }
      Logger.prototype.debug = function (pMessage) {
          this._log('debug', pMessage);
      };

      Logger.prototype.info = function (pMessage) {
          this._log('info', pMessage);
      };

      Logger.prototype.warn = function (pMessage) {
          this._log('warn', pMessage);
      };

      Logger.prototype.error = function (pMessage) {
          this._log('error', pMessage);
      };

      Logger.prototype._log = function (pStatus, pMessage) {
          var lStatus = 'debug';
          var lMessage = '---';

          if (pMessage) {
              lStatus = pStatus;
              lMessage = pMessage;
          } else {
              lMessage = pStatus;
          }

          if(typeof lMessage === 'object') {
              lMessage = JSON.stringify(lMessage);
          };

          if (this.enabled && Logger._LEVELS.indexOf(lStatus) <= this.level) {
              console.log('>>> \u001b[' + Logger._COLORS[Logger._LEVELS.indexOf(lStatus)] + 'm' + lMessage + '\u001b[0m');
          }
      };
      Logger._LEVELS = ['error', 'warn', 'info', 'debug'];
      Logger._COLORS = [31, 33, 36, 90];

      Logger.DEBUG = 'debug';
      Logger.WARNING = 'warn';
      Logger.ERROR = 'error';
      Logger.INFO = 'info';
      return Logger;
  }());

  module.exports = new Logger();

}());