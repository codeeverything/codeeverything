//app config and routing
var app = angular.module('siteApp', ['ngRoute']);

app.config(['$routeProvider', function($routeProvider) {
    console.log($routeProvider);

    //set routes up
    $routeProvider.when('/about', {
        redirectTo: '/'
    }).when('/currentProjects', {
        templateUrl: 'app/partials/currentprojects.html',
        controller: ''
    }).when('/projects/:project', {
        templateUrl: 'app/partials/project.html',
        controller: 'projectCtrl'
    }).when('/keyskills', {
        templateUrl: 'app/partials/keyskills.html',
        controller: ''
    }).when('/contracts/:contract', {
        templateUrl: 'app/partials/contract.html',
        controller: 'contractCtrl'
    }).when('/', {
        templateUrl: 'app/partials/index.html',
        controller: ''
    }).when('/angular-examples', {
        templateUrl: 'app/partials/angular-examples.html',
        controller: 'exampleCtrl'
    }).otherwise({
        redirectTo: '/'
    });

}]);



