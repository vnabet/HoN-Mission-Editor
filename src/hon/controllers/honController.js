(function () {
  "use strict";
  angular.module('hon').controller('honController', ['$modal', function ($modal) {
    
    this.test = function () {
      console.log('essai');
      $modal.open({
        templateUrl: '/templates/modal.html'
      });
    
    };
  }]);
}());