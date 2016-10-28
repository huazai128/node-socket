//·������
var myApp = angular.module("myApp");
myApp.config(function($routeProvider,$locationProvider){
    $locationProvider.html5Mode(true);                 //��HTML5�������ӣ�������ҳ������һ��<base href="/" />�Ų��ᱨ��
    $routeProvider
        .when("/",{
            templateUrl:"/pages/room.html",
            controller:"RoomCtrl"
        })
        .when("/login",{
            templateUrl:"/pages/login.html",    //·����ͼ·��
            controller:"LoginCtrl"                 //�ڵ�ǰ·���ж��������
        })
        .otherwise({                                  //����·�ɾ��ض��򵽵�¼ҳ��
            redirectTo:"/login"                    //�ض��򵽵�¼
        })
});
