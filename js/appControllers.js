//controllers
app.controller('projectCtrl', ['$scope', '$routeParams', function($scope, $routeParams) {
    $scope.projectname = $routeParams.project;
    $scope.projectURL = 'app/partials/project-'+$scope.projectname+'.html';
    //console.log($scope.projectname);
}]);

app.controller('contractCtrl', ['$scope', '$routeParams', function($scope, $routeParams) {
    $scope.contractname = $routeParams.contract;
    $scope.contractURL = 'app/partials/contract-'+$scope.contractname+'.html';
    //console.log($scope.projectname);
}]);

app.controller('exampleCtrl', ['$scope', function($scope) {
    $scope.$watch('maxValue', function(value) {
        if(parseInt(value) > 100) {
            $scope.gtMax = true;
        } else {
            $scope.gtMax = false;
        }
    });
}]);