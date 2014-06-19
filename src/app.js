(function () {
  'use strict';
  console.log('ESSAI');
  
  var myApp = angular.module('myApp', []);
  
  myApp.controller('myController', function ($scope) {
    $scope.essai = 'titi';
});
  
}());
