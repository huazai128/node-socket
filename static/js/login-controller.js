angular.module("myApp")
    .controller("LoginCtrl",["$scope","$http","$location",function($scope,$http,$location){
        $scope.login = function(){
            $http({
                url:"/api/login",
                method:"POST",
                data:{email:$scope.email}
            }).success(function(data,status,headers,config){
                    $scope.$emit("login",data);      //angular���Զ����¼�������һ��login�¼�
                    $location.path("/");
                }).error(function(){
                    $location.path('/login')
                })
        }
    }]);
