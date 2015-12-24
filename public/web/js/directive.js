'use strict';

//指令配置
//加载指令
indexApp.directive('point',function(){
    return {
        restrict: 'AE',
        template: '<div ng-if="deleteLoading"></div>',
        replace: false,
        compile: function(tele,tattr){
            return{
                pre: function($scope,tele,tattr){
                    tele[0].innerText = '正在载入，请稍侯';
                },
                post: function($scope,iele,iattr){
                    $scope.deleteLoading = true;
                    setInterval(function(){
                        if(iele[0].innerText == '正在载入，请稍侯'){
                            iele[0].innerText = '正在载入，请稍侯.'
                        }
                        else if(iele[0].innerText == '正在载入，请稍侯.'){
                            iele[0].innerText = '正在载入，请稍侯..';
                        }
                        else if(iele[0].innerText == '正在载入，请稍侯..'){
                            iele[0].innerText = '正在载入，请稍侯...';
                        }
                        else if(iele[0].innerText = '正在载入，请稍侯...'){
                            iele[0].innerText = '正在载入，请稍侯';
                        }
                    },800);
                }
            }
        }
    };
});

//长条新闻指令home
indexApp.directive('homenews',function(){
    return {
        restrict: 'AE',
        templateUrl: '../web/module/homeNews.html',
        replace: true,
        compile: function(tele,tattr){
            return{
                pre: function($scope,tele,tattr){

                },
                post: function($scope,iele,iattr){

                }
            }
        }
    };
});

//长条新闻指令text
indexApp.directive('textnews',function(){
    return {
        restrict: 'AE',
        templateUrl: '../web/module/textNews.html',
        replace: true,
        compile: function(tele,tattr){
            return{
                pre: function($scope,tele,tattr){

                },
                post: function($scope,iele,iattr){

                }
            }
        }
    };
});

//主页滚动条指令
indexApp.directive('slidebox',function(){
    return {
        restrict: 'AE',
        templateUrl: '../web/module/homeSlideBox.html',
        replace: false,
        compile: function(tele,tattr){
            return{
                pre: function($scope,tele,tattr){

                },
                post: function($scope,iele,iattr){

                }
            }
        }
    };
});

//主页下拉框指令
indexApp.directive('slideDown',function(){
    return {
        restrict: 'AE',
        templateUrl: '../web/module/slideDown.html',
        replace: false,
        compile: function(tele,tattr){
            return{
                pre: function($scope,tele,tattr){

                },
                post: function($scope,iele,iattr){

                }
            }
        }
    };
});

//头部标签指令
indexApp.directive('newsbar',function(){
    return {
        restrict: 'AE',
        templateUrl: '../web/module/homeNewsBar.html',
        replace: false,
        compile: function(tele,tattr){
            return{
                pre: function($scope,tele,tattr){

                },
                post: function($scope,iele,iattr){

                }
            }
        }
    };
});

//一些内容提示标签
indexApp.directive('contentbar',function(){
    return {
        restrict: 'AE',
        scope: {
            content :"@"
        },
        templateUrl: '../web/module/contentBar.html',
        replace: false,
        compile: function(tele,tattr){
            return{
                pre: function($scope,tele,tattr){

                },
                post: function($scope,iele,iattr){

                }
            }
        }
    };
});

//评论指令
indexApp.directive('comment',function(){
    return {
        restrict: 'AE',
        templateUrl: '../web/module/comment.html',
        replace: false,
        compile: function(tele,tattr){
            return{
                pre: function($scope,tele,tattr){

                },
                post: function($scope,iele,iattr){

                }
            }
        }
    };
});

//其他评论指令
indexApp.directive('commentOthers',function(){
    return {
        restrict: 'AE',
        templateUrl: '../web/module/commentOthers.html',
        replace: false,
        compile: function(tele,tattr){
            return{
                pre: function($scope,tele,tattr){

                },
                post: function($scope,iele,iattr){

                }
            }
        }
    };
});

//登录用户按钮指令
indexApp.directive('loadinbut',function(){
    return {
        restrict: 'AE',
        templateUrl: '../web/module/userBut.html',
        replace: false,
        compile: function(tele,tattr){
            return{
                pre: function($scope,tele,tattr){

                },
                post: function($scope,iele,iattr){

                }
            }
        }
    };
});

//第三方登录指令
indexApp.directive('thirdLogin',function(){
    return {
        restrict: 'AE',
        templateUrl: '../web/module/thirdLogin.html',
        replace: false,
        compile: function(tele,tattr){
            return{
                pre: function($scope,tele,tattr){

                },
                post: function($scope,iele,iattr){

                }
            }
        }
    };
});

//登录框指令
indexApp.directive('userTable',function(){
    return {
        restrict: 'AE',
        templateUrl: '../web/module/userTable.html',
        replace: false,
        compile: function(tele,tattr){
            return{
                pre: function($scope,tele,tattr){

                },
                post: function($scope,iele,iattr){

                }
            }
        }
    };
});

//我的收藏指令
indexApp.directive('userollectioncnews',function(){
    return {
        restrict: 'AE',
        templateUrl: '../web/module/userCollectionNews.html',
        replace: false,
        compile: function(tele,tattr){
            return{
                pre: function($scope,tele,tattr){

                },
                post: function($scope,iele,iattr){

                }
            }
        }
    };
});

//用户信息指令
indexApp.directive('userInformationBox',function(){
    return {
        restrict: 'AE',
        templateUrl: '../web/module/informationBox.html',
        replace: false,
        compile: function(tele,tattr){
            return{
                pre: function($scope,tele,tattr){

                },
                post: function($scope,iele,iattr){

                }
            }
        }
    };
});

//我的评论指令
indexApp.directive('usercomment',function(){
    return {
        restrict: 'AE',
        templateUrl: '../web/module/userCommentBox.html',
        replace: false,
        compile: function(tele,tattr){
            return{
                pre: function($scope,tele,tattr){

                },
                post: function($scope,iele,iattr){

                }
            }
        }
    };
});

//我的评论指令
indexApp.directive('commentThis',function(){
    return {
        restrict: 'AE',
        templateUrl: '../web/module/commentThis.html',
        replace: false,
        compile: function(tele,tattr){
            return{
                pre: function($scope,tele,tattr){

                },
                post: function($scope,iele,iattr){

                }
            }
        }
    };
});

//浮动栏指令
indexApp.directive('communityFloatBox',function(){
    return {
        restrict: 'AE',
        templateUrl: '../web/module/communityFloatBox.html',
        replace: false,
        compile: function(tele,tattr){
            return{
                pre: function($scope,tele,tattr){

                },
                post: function($scope,iele,iattr){

                }
            }
        }
    };
});

//社区 && 新闻文章评论指令
indexApp.directive('communityComment',function(){
    return {
        restrict: 'AE',
        templateUrl: '../web/module/communityComment.html',
        replace: false,
        compile: function(tele,tattr){
            return{
                pre: function($scope,tele,tattr){

                },
                post: function($scope,iele,iattr){

                }
            }
        }
    };
});

//搜索指令
indexApp.directive('search',function(){
    return {
        restrict: 'AE',
        templateUrl: '../web/module/search.html',
        replace: false,
        compile: function(tele,tattr){
            return{
                pre: function($scope,tele,tattr){

                },
                post: function($scope,iele,iattr){

                }
            }
        }
    };
});

//用户名重复指令
indexApp.directive('userNameCheck',function(){
    return {
        restrict: 'AE',
        require: '?^ngModel',
        replace: false,
        compile: function(tele,tattr){
            return{
                pre: function($scope,tele,tattr){

                },
                post: function($scope,iele,iattr,c){
                    $scope.$watch(iattr.ngModel,function(){

                    });
                }
            }
        }
    };
});