'use strict';

/* Controllers */

var myAppControllers = angular.module('myApp.controllers', []);

myAppControllers.controller('siteCtrl', ['$scope', '$http',
  function($scope, $http) {
    $http.get('sites/sites.json').success(function(data) {
      $scope.sites = data;
    });

    $scope.orderProp = 'age';
  }]);

myAppControllers.controller('MyCtrl2', [function() {
}]);