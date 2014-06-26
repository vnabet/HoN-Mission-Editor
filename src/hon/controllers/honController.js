(function () {
  "use strict";
  angular.module('hon').controller('honController', ['$modal', '$scope', '$compile', function ($modal, $scope, $compile) {
    
    this.test = function () {
      console.log('essai');
      $modal.open({
        templateUrl: '/templates/modal.html'
      });
    
    };
    
    this.outils = function() {
      $scope.toto = 'REJRZEKJRZEKREZKRJREEZJKRE ';
    
      var elem = $compile('<div title="{{toto}}" data-tools>{{toto}}</div>')($scope);

      //$document.append(elem);
      angular.element(window.document.body).append(elem);


      console.log(elem);
      
    };
    

  }]);
}());