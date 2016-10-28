var myApp = angular.module("myApp",["ngRoute","angularMoment"]);  //模块加载
myApp.run(function($window,$rootScope,$http,$location){   //运行块，时加载完后第一个执行的模块;
    $window.moment.locale("zh-cn");
    $http.get("/api/validate")                   //请求后台链接；是根据用户ID判断
        .success(function(data,status,headers,config){
            if(data == null){
                $location.path("/login");         //跳转到登录页面
            }else{
                $rootScope.me = data;              //$rootScope:在顶级作用域中添加对象，可以在任何地方访问
                $location.path("/");               //跳转到首页
            }
        })
        .error(function(data,status,headers,cinfig){
            $location.path("/login");             //跳转到登录页面
        });
    $rootScope.logout = function(){               //在顶级作用域中添加一个方法；当触发这个方法时，就会调用
        $http.get("/api/logout")
            .success(function(data,status,headers,config){

                $rootScope.me = null;
                $location.path("/login");
            })
    };
    $rootScope.$on("login",function(e,me){         //在顶级作用域中自定义一个login事件;接受emit()触发是的数据；回调函数(e,me);me:接受触发时返回的参数，e:自定义函数名，
        $rootScope.me = me;
    })
});