angular.module("myApp")
    .directive("ctrlEnterBreakLine",function(){
        return {
            restrict:"A",
            link:function(scope,ele,attrs){      //scope:������ele:Ԫ�� attrs������
                var flag =  false;
                ele.bind("keydown",function(e){
                    if(e.which === 17){
                        flag = true;
                        setTimeout(function(){
                            flag = false
                        },300)
                    }
                    if(e.which === 13){
                        if(flag){
                            ele.val(ele.val() +"\n");
                        }else{
                            scope.$apply(function(){
                                scope.$eval(attrs.ctrlEnterBreakLine);
                            });
                            e.preventDefault();
                        }
                    }
                })
            }
        }
    });