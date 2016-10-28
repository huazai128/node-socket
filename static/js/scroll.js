angular.module("myApp")
    .directive("autoScrollToBottom",function(){
        return {
            restrict:"A",                        //A：代表元素属性
            link:function(scope,ele,attrs){      //用于操作元素
                scope.$watch(function(){         //$watch：用于监听Model和view发生变化；一旦发生变化就会修改数据
                    return ele.children().length;//获取当前元素下的所有子元素
                },function(){
                    //用于获取当前元素滚动条的高度
                    ele.animate({scrollTop:ele.prop("scrollHeight")});  //prop:用于获取对象上的属性;attr:用于获取元素上的属性
                })
            }
        }
    });