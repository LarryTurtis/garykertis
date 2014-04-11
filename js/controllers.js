'use strict';

/* Controllers */

var myAppControllers = angular.module('myApp.controllers', []);

myAppControllers.controller('siteCtrl', ['$scope', '$http', '$location',
  function($scope, $http, $location) {
    $http.get('sites/sites.json').success(function(data) {
      $scope.sites = data;

    $scope.getClass = function(path) {
     if ($location.path().substr(0, path.length) == path) {
      return "active"
    } else {
      return ""
    }
    };

    });
    $scope.orderProp = 'age';
  }]);

myAppControllers.controller('siteDetailCtrl', ['$scope', '$routeParams', '$http',
  function($scope, $routeParams, $http) {
    $http.get('sites/' + $routeParams.siteId + '.json').success(function(data) {
      $scope.site = data;
      fire();
    });
  
  }]);