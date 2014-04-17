'use strict';


// Declare app level module which depends on filters, and services
var myApp = angular.module('myApp', [
  'ngRoute',
  'ngAnimate',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/sites/:siteId', {templateUrl: 'partials/siteDetail.html', controller: 'siteDetailCtrl'}).
  when('/goals', {templateUrl: 'partials/goals.html', controller: 'siteDetailCtrl'}).
	otherwise({redirectTo: '/sites/vivo-para'});
}]);



