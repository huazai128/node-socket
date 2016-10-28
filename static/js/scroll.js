angular.module("myApp")
    .directive("autoScrollToBottom",function(){
        return {
            restrict:"A",                        //A������Ԫ������
            link:function(scope,ele,attrs){      //���ڲ���Ԫ��
                scope.$watch(function(){         //$watch�����ڼ���Model��view�����仯��һ�������仯�ͻ��޸�����
                    return ele.children().length;//��ȡ��ǰԪ���µ�������Ԫ��
                },function(){
                    //���ڻ�ȡ��ǰԪ�ع������ĸ߶�
                    ele.animate({scrollTop:ele.prop("scrollHeight")});  //prop:���ڻ�ȡ�����ϵ�����;attr:���ڻ�ȡԪ���ϵ�����
                })
            }
        }
    });