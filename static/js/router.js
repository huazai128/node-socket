//路由配置
var myApp = angular.module("myApp");
myApp.config(function($routeProvider,$locationProvider){
    $locationProvider.html5Mode(true);                 //用HTML5解析链接，必须在页面配置一个<base href="/" />才不会报错
    $routeProvider
        .when("/",{
            templateUrl:"/pages/room.html",
            controller:"RoomCtrl"
        })
        .when("/login",{
            templateUrl:"/pages/login.html",    //路由视图路径
            controller:"LoginCtrl"                 //在当前路由中定义控制器
        })
        .otherwise({                                  //其他路由就重定向到登录页面
            redirectTo:"/login"                    //重定向到登录
        })
});
