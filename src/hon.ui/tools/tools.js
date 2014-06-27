(function () {
  "use strict";
  angular.module('hon.ui.tools', []).directive('tools', [function () {
    return {
      restrict:'AE',
      templateUrl: '/templates/tools.html',
      replace: true,
      transclude: true,
      scope: {
        title: '@'
      },
      link: function (scope, elem) {
        elem = elem[0];
                
        var header = elem.querySelector('.tools-header');
        var xOffset, yOffset;

        var mousedownHandler = function (event) {
          var tools = window.document.querySelectorAll('.tools');
          for(var i = 0; i < tools.length; i++) {
            tools[i].style.zIndex = 10;
          } 
          elem.style.zIndex = 99;
          
          window.document.addEventListener('mouseup', mouseupHandler);
          window.document.addEventListener('mousemove', mousemoveHandler);
          
          xOffset = event.clientX - elem.offsetLeft;
          yOffset = event.clientY - elem.offsetTop;

        };
        
        var mouseupHandler = function () {
          window.document.removeEventListener('mouseup', mouseupHandler);
          window.document.removeEventListener('mousemove', mousemoveHandler);
        };
        
        var mousemoveHandler = function (event) {
          
          elem.style.left = (event.clientX - xOffset) + 'px';
          elem.style.top = (event.clientY - yOffset) + 'px';
          
        };

        header.addEventListener('mousedown', mousedownHandler);

      }
      
    };
  
  }]);
}());