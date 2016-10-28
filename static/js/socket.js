/**
 * 自定义socket服务，在服务中返回两个事件，on(绑定)，emit(触发)
 */
angular.module("myApp")
    .factory("socket",function($rootScope){    //自定义工厂服务
        var socket = io();                        //客服端socket链接
        return {
            on:function(eventName,callback){     //在工厂服务中定义一个事件绑定的函数
                socket.on(eventName,function(){  //客服端socket事件绑定
                    var args = arguments;
                    console.log(args);           //
                    $rootScope.$apply(function(){
                        console.log("=============================");
                        callback.apply(socket,args);
                    })
                })
            },
            emit:function(eventName,data,callback){       //触发绑定事件
                socket.emit(eventName,data,function(){    //客服端socket事件触发
                    var args = arguments;                  //伪数组
                    console.log();
                    $rootScope.$apply(function(){         //$apply：用于传播Model的变化
                        console.log("我触发了函数...");
                        if(callback){
                            callback.apply(socket,args);
                        }
                    })
                })
            }
        }
    });