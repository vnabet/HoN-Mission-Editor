(function () {
  'use strict';
  console.log('ESSAI');
  
  var myApp = angular.module('myApp', ['ui.bootstrap']);
  
  myApp.controller('myController', function ($scope/*, $modal*/) {
    $scope.essai = 'titi';
    /*$scope.test = function() {
      $modal.open({
      templateUrl: 'myModalContent.html',
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });
      
    };*/
});
  
}());
