'use strict';
//路由配置
indexApp.config(function($stateProvider,$urlRouterProvider){
    $urlRouterProvider.when('','/index/home');
    $stateProvider
        .state('main',{
            url: '/index',
            abstract: true,
            views: {
                'main' :{
                    templateUrl: '../web/module/nav-box.html'
                }
            }
        })
        .state('main.home',{
            url: '/home',
            views: {
                'header':{
                    templateUrl:'../web/module/header.html'
                },
                'content' :{
                    templateUrl: '../web/module/homePageContent.html',
                    controller: function($scope,$rootScope,scroll){
                        $scope.$on('$stateChangeSuccess',function(){
                            scroll.resize();
                        });
                        $scope.news = [];//清空数据
                    }
                }
            },
            onEnter: function($rootScope){
                $rootScope.headerTitle = '中国海运信息网';  //主页title
                $rootScope.title = '主页';
                $rootScope.headerTitleStyle = 'blockTitle';//主页title样式
                $rootScope.contentShow = true;    //是否显示内容
                $rootScope.headerShow = true;     //是否显示头部
                $rootScope.footerShow = false;    //是否显示页脚
                $rootScope.searchButtonShow = false;//搜索回退按钮
                $rootScope.commentButtonShow = false;//评论回退按钮
                $rootScope.collectNewsButtonShow = false;//收藏回退按钮
                $rootScope.deleteLoading = true;  //是否完全删除加载页
                $rootScope.searchShow = true;     //是否显示搜索栏
                $rootScope.leftButtonShow = false; //是否显示左侧按钮
                $rootScope.leftButton = 'userButton';   //左按钮为用户
                $rootScope.leftUrl = 'main.user';  //左边按钮链接
                $rootScope.rightButShow = true;     //是否显示右边按钮
                $rootScope.rightButton = 'communityButton';  //右边按钮为社区
                $rootScope.rightUrl = 'main.communityContent';  //右边按钮链接
                $rootScope.searchButton = 'searchButton';    //是否显示搜索按钮
                $rootScope.newsImgShow = true; //新闻栏目的图片是否显示
                $rootScope.newsBoxStyle = 'news-box';//新闻栏目的的背景色
                $rootScope.originShow = true;//新闻栏目是否显示来源
            }
        })
        .state('main.mainText',{
            url: '/mainText',
            views: {
                'header':{
                    templateUrl:'../web/module/header.html'
                },
                'content' :{
                    templateUrl: '../web/module/textPageContent.html',
                    controller: function($scope,scroll){
                        $scope.$on('$stateChangeSuccess',function(){
                            scroll.resize();
                        });
                        $scope.news = [];//清空数据
                    }
                },
                'footer' :{
                    templateUrl: '../web/module/textFooter.html'
                }
            },
            onEnter: function($rootScope){
                $rootScope.title = '正文';
                $rootScope.headerTitle = '';     //正文title
                $rootScope.contentShow = true;    //是否显示内容
                $rootScope.headerShow = true;     //是否显示头部
                $rootScope.footerShow = true;    //是否显示页脚
                $rootScope.searchShow = false;     //是否显示搜索栏
                $rootScope.leftButtonShow = true; //是否显示左侧按钮
                $rootScope.leftButton = 'backButton';  //左边按钮为后退按钮
                $rootScope.searchButtonShow = search;//搜索回退按钮
                $rootScope.commentButtonShow = comment;//评论回退按钮
                $rootScope.collectNewsButtonShow = collectNews;//收藏回退按钮
                $rootScope.leftUrl = 'main.home';  //左边按钮链接
                $rootScope.rightButShow = true;     //是否显示右边按钮
                $rootScope.rightButton = 'commentButton';  //右边按钮为聊天按钮
                $rootScope.rightUrl = 'main.viewComments';  //右边按钮链接
                $rootScope.newsImgShow = false; //新闻栏目的图片是否显示
                $rootScope.newsBoxStyle = '';//新闻栏目的的背景色
                $rootScope.originShow = true;//新闻栏目是否显示来源
                $rootScope.fooyerStyle = 'textFooterStyle';//页脚样式
                $rootScope.slideDirection = false; //是否显示侧栏按钮
            }
        })
        .state('main.signIn',{
            url: '/signIn',
            views: {
                'header':{
                    templateUrl:'../web/module/header.html'
                },
                'content' :{
                    templateUrl: '../web/module/signIn.html',
                    controller: function($scope,scroll){
                        $scope.$on('$stateChangeSuccess',function(){
                            scroll.resize();
                        });
                    }
                }
            },
            onEnter: function($rootScope,cookie){
                if(cookie.getCookie('access_token') == null || typeof cookie.getCookie('access_token') == 'undefined'){
                    $rootScope.headerTitle = '登录';  //主页title
                    $rootScope.title = '登录';        //主页title
                    $rootScope.access = false;
                    $rootScope.contentShow = true;    //是否显示内容
                    $rootScope.headerShow = true;    //是否显示头部
                    $rootScope.footerShow = false;    //是否显示页脚
                    $rootScope.searchShow = false;     //是否显示搜索栏
                    $rootScope.rightButShow = false;     //是否显示右边按钮
                    $rootScope.searchButtonShow = false;//搜索回退按钮
                    $rootScope.commentButtonShow = false;//评论回退按钮
                    $rootScope.collectNewsButtonShow = false;//收藏回退按钮
                    $rootScope.leftButtonShow = true; //是否显示左侧按钮
                    $rootScope.leftButton = 'backButton';  //左边按钮为后退按钮
                    $rootScope.leftUrl = 'main.user';    //左边按钮链接
                    $rootScope.slideDirection = false; //是否显示侧栏按钮

                }
                else{
                    $rootScope.access = true;
                    $rootScope.headerTitle = '个人信息';  //主页title
                    $rootScope.contentShow = true;    //是否显示内容
                    $rootScope.headerShow = true;    //是否显示头部
                    $rootScope.footerShow = false;    //是否显示页脚
                    $rootScope.searchShow = false;     //是否显示搜索栏
                    $rootScope.rightButShow = false;     //是否显示右边按钮
                    $rootScope.searchButtonShow = false;//搜索回退按钮
                    $rootScope.commentButtonShow = false;//评论回退按钮
                    $rootScope.collectNewsButtonShow = false;//收藏回退按钮
                    $rootScope.leftButtonShow = true; //是否显示左侧按钮
                    $rootScope.leftButton = 'backButton';  //左边按钮为后退按钮
                    $rootScope.leftUrl = 'main.user';    //左边按钮链接
                    $rootScope.title = '个人信息';
                    $rootScope.thirdLoginShow = false;
                }
            }
        })
        .state('main.userCollection',{
            url: '/userCollection',
            views: {
                'header':{
                    templateUrl:'../web/module/header.html'
                },
                'content' :{
                    templateUrl: '../web/module/userCollection.html',
                    controller: function($scope,scroll){
                        $scope.$on('$stateChangeSuccess',function(){
                            scroll.resize();
                        });
                    }
                }
            },
            onEnter: function($rootScope){
                $rootScope.title = '我的收藏';
                $rootScope.headerTitle = '我的收藏';  //主页title
                $rootScope.contentShow = true;    //是否显示内容
                $rootScope.headerShow = true;    //是否显示头部
                $rootScope.footerShow = false;    //是否显示页脚
                $rootScope.searchShow = false;     //是否显示搜索栏
                $rootScope.rightButShow = false;     //是否显示右边按钮
                $rootScope.searchButtonShow = false;//搜索回退按钮
                $rootScope.commentButtonShow = false;//评论回退按钮
                $rootScope.collectNewsButtonShow = false;//收藏回退按钮
                $rootScope.leftButtonShow = true; //是否显示左侧按钮
                $rootScope.leftButton = 'backButton';  //左边按钮为后退按钮
                $rootScope.leftUrl = 'main.user';    //左边按钮链接
                $rootScope.newsImgShow = false; //新闻栏目的图片是否显示
                $rootScope.newsBoxStyle = '';//新闻栏目的的背景色
                $rootScope.originShow = true;//新闻栏目是否显示来源
                $rootScope.slideDirection = false; //是否显示侧栏按钮
            }
        })
        .state('main.userSetUp',{
            url: '/userSetUp',
            views: {
                'header':{
                    templateUrl:'../web/module/header.html'
                },
                'content' :{
                    templateUrl: '../web/module/userSetUp.html',
                    controller: function($scope,scroll){
                        $scope.$on('$stateChangeSuccess',function(){
                            scroll.resize();
                        });
                    }
                }
            },
            onEnter: function($rootScope){
                $rootScope.title = '设置';
                $rootScope.headerTitle = '设置';  //主页title
                $rootScope.contentShow = true;    //是否显示内容
                $rootScope.headerShow = true;    //是否显示头部
                $rootScope.footerShow = false;    //是否显示页脚
                $rootScope.searchShow = false;     //是否显示搜索栏
                $rootScope.rightButShow = false;     //是否显示右边按钮
                $rootScope.searchButtonShow = false;//搜索回退按钮
                $rootScope.commentButtonShow = false;//评论回退按钮
                $rootScope.collectNewsButtonShow = false;//收藏回退按钮
                $rootScope.leftButtonShow = true; //是否显示左侧按钮
                $rootScope.leftButton = 'backButton';  //左边按钮为后退按钮
                $rootScope.leftUrl = 'main.user';    //左边按钮链接
                $rootScope.slideDirection = false; //是否显示侧栏按钮
            }
        })
        .state('main.userInformation',{
            url: '/userInformation',
            views: {
                'header':{
                    templateUrl:'../web/module/header.html'
                },
                'content' :{
                    templateUrl: '../web/module/userInformation.html',
                    controller: function($scope,scroll){
                        $scope.$on('$stateChangeSuccess',function(){
                            scroll.resize();
                        });
                    }
                }
            },
            onEnter: function($rootScope){
                $rootScope.title = '我的消息';
                $rootScope.headerTitle = '我的消息';  //主页title
                $rootScope.contentShow = true;    //是否显示内容
                $rootScope.headerShow = true;    //是否显示头部
                $rootScope.footerShow = false;    //是否显示页脚
                $rootScope.searchShow = false;     //是否显示搜索栏
                $rootScope.searchButtonShow = false;//搜索回退按钮
                $rootScope.commentButtonShow = false;//评论回退按钮
                $rootScope.collectNewsButtonShow = false;//收藏回退按钮
                $rootScope.rightButShow = false;     //是否显示右边按钮
                $rootScope.leftButtonShow = true; //是否显示左侧按钮
                $rootScope.leftButton = 'backButton';  //左边按钮为后退按钮
                $rootScope.leftUrl = 'main.user';    //左边按钮链接
                $rootScope.slideDirection = false; //是否显示侧栏按钮
            }
        })
        .state('main.userComment',{
            url: '/userComment',
            views: {
                'header':{
                    templateUrl:'../web/module/header.html'
                },
                'content' :{
                    templateUrl: '../web/module/userCommentContent.html',
                    controller: function($scope,scroll){
                        $scope.$on('$stateChangeSuccess',function(){
                            scroll.resize();
                        });
                    }
                }
            },
            onEnter: function($rootScope){
                $rootScope.title = '我的评论';
                $rootScope.headerTitle = '我的评论';  //主页title
                $rootScope.contentShow = true;    //是否显示内容
                $rootScope.headerShow = true;    //是否显示头部
                $rootScope.footerShow = false;    //是否显示页脚
                $rootScope.searchShow = false;     //是否显示搜索栏
                $rootScope.searchButtonShow = false;//搜索回退按钮
                $rootScope.commentButtonShow = false;//评论回退按钮
                $rootScope.collectNewsButtonShow = false;//收藏回退按钮
                $rootScope.rightButShow = false;     //是否显示右边按钮
                $rootScope.leftButtonShow = true; //是否显示左侧按钮
                $rootScope.leftButton = 'backButton';  //左边按钮为后退按钮
                $rootScope.leftUrl = 'main.user';    //左边按钮链接
                $rootScope.slideDirection = false; //是否显示侧栏按钮
            }
        })
        .state('main.communityContent',{
            url: '/communityContent',
            views: {
                'header':{
                    templateUrl:'../web/module/header.html'
                },
                'content' :{
                    templateUrl: '../web/module/communityContent.html',
                    controller: function($scope,scroll){
                        $scope.$on('$stateChangeSuccess',function(){
                            scroll.resize();
                        });
                    }
                },
                'footer' :{
                    templateUrl: '../web/module/textFooter.html'
                }
            },
            onEnter: function($rootScope){
                $rootScope.title = '社区';
                $rootScope.headerTitle = '社区';  //主页title
                $rootScope.contentShow = true;    //是否显示内容
                $rootScope.headerShow = true;    //是否显示头部
                $rootScope.footerShow = false;    //是否显示页脚
                $rootScope.searchShow = false;     //是否显示搜索栏
                $rootScope.searchButtonShow = false;//搜索回退按钮
                $rootScope.commentButtonShow = false;//评论回退按钮
                $rootScope.collectNewsButtonShow = false;//收藏回退按钮
                $rootScope.rightButShow = false;     //是否显示右边按钮
                $rootScope.leftButtonShow = true; //是否显示左侧按钮
                $rootScope.leftButton = 'backButton';  //左边按钮为后退按钮
                $rootScope.leftUrl = 'main.home';    //左边按钮链接
                $rootScope.slideDirection = false; //是否显示侧栏按钮
                $rootScope.fooyerStyle = 'textFooterStyle';//页脚样式
            }
        })
        .state('main.search',{
            url: '/search',
            views: {
                'header':{
                    templateUrl:'../web/module/header.html'
                },
                'content' :{
                    templateUrl: '../web/module/searchContent.html',
                    controller: function($scope,scroll){
                        $scope.$on('$stateChangeSuccess',function(){
                            scroll.resize();
                        });
                    }
                }
            },
            onEnter: function($rootScope){
                $rootScope.title = '搜索';
                $rootScope.headerTitle = '搜索';  //主页title
                $rootScope.contentShow = true;    //是否显示内容
                $rootScope.headerShow = true;    //是否显示头部
                $rootScope.footerShow = false;    //是否显示页脚
                $rootScope.searchButtonShow = false;//搜索回退按钮
                $rootScope.commentButtonShow = false;//评论回退按钮
                $rootScope.collectNewsButtonShow = false;//收藏回退按钮
                $rootScope.searchShow = false;     //是否显示搜索栏
                $rootScope.rightButShow = false;     //是否显示右边按钮
                $rootScope.leftButtonShow = true; //是否显示左侧按钮
                $rootScope.leftButton = 'backButton';  //左边按钮为后退按钮
                $rootScope.leftUrl = 'main.home';    //左边按钮链接
                $rootScope.slideDirection = false; //是否显示侧栏按钮
                $rootScope.newsImgShow = false; //新闻栏目的图片是否显示
                $rootScope.newsBoxStyle = 'news-box';//新闻栏目的的背景色
                $rootScope.originShow = true;//新闻栏目是否显示来源
            }
        })
        .state('main.viewComments',{
            url: '/viewComments',
            views: {
                'header':{
                    templateUrl:'../web/module/header.html'
                },
                'content' :{
                    templateUrl: '../web/module/viewComments.html',
                    controller: function($scope,scroll){
                        $scope.$on('$stateChangeSuccess',function(){
                            scroll.resize();
                        });
                    }
                },
                'footer' :{
                    templateUrl: '../web/module/textFooter.html'
                }
            },
            onEnter: function($rootScope){
                $rootScope.title = '评论';
                $rootScope.headerTitle = '评论';  //主页title
                $rootScope.contentShow = true;    //是否显示内容
                $rootScope.headerShow = true;    //是否显示头部
                $rootScope.footerShow = true;    //是否显示页脚
                $rootScope.searchShow = false;     //是否显示搜索栏
                $rootScope.rightButShow = false;     //是否显示右边按钮
                $rootScope.leftButtonShow = true; //是否显示左侧按钮
                $rootScope.searchButtonShow = false;//搜索回退按钮
                $rootScope.commentButtonShow = false;//评论回退按钮
                $rootScope.collectNewsButtonShow = false;//收藏回退按钮
                $rootScope.leftButton = 'backButton';  //左边按钮为后退按钮
                $rootScope.leftUrl = 'main.mainText';    //左边按钮链接
                $rootScope.slideDirection = false; //是否显示侧栏按钮
                $rootScope.newsImgShow = false; //新闻栏目的图片是否显示
                $rootScope.newsBoxStyle = 'news-box';//新闻栏目的的背景色
                $rootScope.originShow = true;//新闻栏目是否显示来源
                $rootScope.fooyerStyle = 'textFooterStyle';//页脚样式
            }
        })
        .state('main.userReviseUserName',{
            url: '/userReviseUserName',
            views: {
                'header':{
                    templateUrl:'../web/module/header.html'
                },
                'content' :{
                    templateUrl: '../web/module/userReviseUserName.html',
                    controller: function($scope,scroll){
                        $scope.$on('$stateChangeSuccess',function(){
                            scroll.resize();
                        });
                    }
                }
            },
            onEnter: function($rootScope){
                $rootScope.title = '修改姓名';
                $rootScope.headerTitle = '修改姓名';  //主页title
                $rootScope.contentShow = true;    //是否显示内容
                $rootScope.headerShow = true;    //是否显示头部
                $rootScope.footerShow = false;    //是否显示页脚
                $rootScope.searchButtonShow = false;//搜索回退按钮
                $rootScope.commentButtonShow = false;//评论回退按钮
                $rootScope.collectNewsButtonShow = false;//收藏回退按钮
                $rootScope.searchShow = false;     //是否显示搜索栏
                $rootScope.rightButShow = true;     //是否显示右边按钮
                $rootScope.rightButton = 'checkMark';  //右边按钮为聊天按钮
                $rootScope.rightUrl = 'main.userReviseUserName';  //右边按钮链接
                $rootScope.leftButtonShow = true; //是否显示左侧按钮
                $rootScope.leftButton = 'backButton';  //左边按钮为后退按钮
                $rootScope.leftUrl = 'main.signIn';    //左边按钮链接
                $rootScope.slideDirection = false; //是否显示侧栏按钮
            }
        })
        .state('main.userReviseMail',{
            url: '/userReviseMail',
            views: {
                'header':{
                    templateUrl:'../web/module/header.html'
                },
                'content' :{
                    templateUrl: '../web/module/userReviseMail.html',
                    controller: function($scope,scroll){
                        $scope.$on('$stateChangeSuccess',function(){
                            scroll.resize();
                        });
                    }
                }
            },
            onEnter: function($rootScope){
                $rootScope.title = '修改邮箱';
                $rootScope.headerTitle = '修改邮箱';  //主页title
                $rootScope.contentShow = true;    //是否显示内容
                $rootScope.headerShow = true;    //是否显示头部
                $rootScope.footerShow = false;    //是否显示页脚
                $rootScope.searchShow = false;     //是否显示搜索栏
                $rootScope.rightButShow = true;     //是否显示右边按钮
                $rootScope.searchButtonShow = false;//搜索回退按钮
                $rootScope.commentButtonShow = false;//评论回退按钮
                $rootScope.collectNewsButtonShow = false;//收藏回退按钮
                $rootScope.rightButton = 'checkMark';  //右边按钮为聊天按钮
                $rootScope.rightUrl = 'main.userReviseMail';  //右边按钮链接
                $rootScope.leftButtonShow = true; //是否显示左侧按钮
                $rootScope.leftButton = 'backButton';  //左边按钮为后退按钮
                $rootScope.leftUrl = 'main.signIn';    //左边按钮链接
                $rootScope.slideDirection = false; //是否显示侧栏按钮
            }
        })
        .state('main.userReviseCompany',{
            url: '/userReviseCompany',
            views: {
                'header':{
                    templateUrl:'../web/module/header.html'
                },
                'content' :{
                    templateUrl: '../web/module/userReviseCompany.html',
                    controller: function($scope,scroll){
                        $scope.$on('$stateChangeSuccess',function(){
                            scroll.resize();
                        });
                    }
                }
            },
            onEnter: function($rootScope){
                $rootScope.title = '修改工作单位';
                $rootScope.headerTitle = '修改工作单位';  //主页title
                $rootScope.contentShow = true;    //是否显示内容
                $rootScope.headerShow = true;    //是否显示头部
                $rootScope.footerShow = false;    //是否显示页脚
                $rootScope.searchShow = false;     //是否显示搜索栏
                $rootScope.searchButtonShow = false;//搜索回退按钮
                $rootScope.commentButtonShow = false;//评论回退按钮
                $rootScope.collectNewsButtonShow = false;//收藏回退按钮
                $rootScope.rightButShow = true;     //是否显示右边按钮
                $rootScope.rightButton = 'checkMark';  //右边按钮为聊天按钮
                $rootScope.rightUrl = 'main.userReviseCompany';  //右边按钮链接
                $rootScope.leftButtonShow = true; //是否显示左侧按钮
                $rootScope.leftButton = 'backButton';  //左边按钮为后退按钮
                $rootScope.leftUrl = 'main.signIn';    //左边按钮链接
                $rootScope.slideDirection = false; //是否显示侧栏按钮
            }
        })
        .state('main.userReviseJob',{
            url: '/userReviseJob',
            views: {
                'header':{
                    templateUrl:'../web/module/header.html'
                },
                'content' :{
                    templateUrl: '../web/module/userReviseJob.html',
                    controller: function($scope,scroll){
                        $scope.$on('$stateChangeSuccess',function(){
                            scroll.resize();
                        });
                    }
                }
            },
            onEnter: function($rootScope){
                $rootScope.title = '修改职位';
                $rootScope.headerTitle = '修改职位';  //主页title
                $rootScope.contentShow = true;    //是否显示内容
                $rootScope.headerShow = true;    //是否显示头部
                $rootScope.footerShow = false;    //是否显示页脚
                $rootScope.searchShow = false;     //是否显示搜索栏
                $rootScope.searchButtonShow = false;//搜索回退按钮
                $rootScope.commentButtonShow = false;//评论回退按钮
                $rootScope.collectNewsButtonShow = false;//收藏回退按钮
                $rootScope.rightButShow = true;     //是否显示右边按钮
                $rootScope.rightButton = 'checkMark';  //右边按钮为聊天按钮
                $rootScope.rightUrl = 'main.userReviseJob';  //右边按钮链接
                $rootScope.leftButtonShow = true; //是否显示左侧按钮
                $rootScope.leftButton = 'backButton';  //左边按钮为后退按钮
                $rootScope.leftUrl = 'main.signIn';    //左边按钮链接
                $rootScope.slideDirection = false; //是否显示侧栏按钮
            }
        })
        .state('main.thirdPartyLogin',{
            url: '/thirdPartyLogin',
            views: {
                'header':{
                    templateUrl:'../web/module/header.html'
                },
                'content' :{
                    templateUrl: '../web/module/thirdPartyLogin.html',
                    controller: function($scope,scroll){
                        $scope.$on('$stateChangeSuccess',function(){
                            scroll.resize();
                        });
                    }
                }
            },
            onEnter: function($rootScope){
                $rootScope.title = '第三方登录';
                $rootScope.headerTitle = '第三方登录';  //主页title
                $rootScope.contentShow = true;    //是否显示内容
                $rootScope.headerShow = true;    //是否显示头部
                $rootScope.footerShow = false;    //是否显示页脚
                $rootScope.searchShow = false;     //是否显示搜索栏
                $rootScope.rightButShow = false;     //是否显示右边按钮
                $rootScope.searchButtonShow = false;//搜索回退按钮
                $rootScope.commentButtonShow = false;//评论回退按钮
                $rootScope.collectNewsButtonShow = false;//收藏回退按钮
                $rootScope.rightButton = 'checkMark';  //右边按钮为聊天按钮
                $rootScope.rightUrl = 'main.userReviseJob';  //右边按钮链接
                $rootScope.leftButtonShow = true; //是否显示左侧按钮
                $rootScope.leftButton = 'backButton';  //左边按钮为后退按钮
                $rootScope.leftUrl = 'main.home';    //左边按钮链接
                $rootScope.slideDirection = false; //是否显示侧栏按钮
            }
        })
        .state('main.aboutUs',{
            url: '/aboutUs',
            views: {
                'header':{
                    templateUrl:'../web/module/header.html'
                },
                'content' :{
                    templateUrl: '../web/module/aboutUs.html',
                    controller: function($scope,scroll){
                        $scope.$on('$stateChangeSuccess',function(){
                            scroll.resize();
                        });
                    }
                }
            },
            onEnter: function($rootScope){
                $rootScope.title = '关于我们';
                $rootScope.headerTitle = '关于我们';  //主页title
                $rootScope.contentShow = true;    //是否显示内容
                $rootScope.headerShow = true;    //是否显示头部
                $rootScope.footerShow = false;    //是否显示页脚
                $rootScope.searchButtonShow = false;//搜索回退按钮
                $rootScope.commentButtonShow = false;//评论回退按钮
                $rootScope.collectNewsButtonShow = false;//收藏回退按钮
                $rootScope.searchShow = false;     //是否显示搜索栏
                $rootScope.rightButShow = false;     //是否显示右边按钮
                $rootScope.leftButtonShow = true; //是否显示左侧按钮
                $rootScope.leftButton = 'backButton';  //左边按钮为后退按钮
                $rootScope.leftUrl = 'main.userSetUp';    //左边按钮链接
                $rootScope.slideDirection = false; //是否显示侧栏按钮
            }
        })
        .state('main.imgCrop',{
            url: '/imgCrop',
            views: {
                'header':{
                    templateUrl:'../web/module/header.html'
                },
                'content' :{
                    templateUrl: '../web/module/imgCrop.html'
                }
            },
            onEnter: function($rootScope){
                $rootScope.title = '自定义头像';
                $rootScope.headerTitle = '自定义头像';  //主页title
                $rootScope.contentShow = true;    //是否显示内容
                $rootScope.headerShow = true;    //是否显示头部
                $rootScope.footerShow = false;    //是否显示页脚
                $rootScope.searchButtonShow = false;//搜索回退按钮
                $rootScope.commentButtonShow = false;//评论回退按钮
                $rootScope.collectNewsButtonShow = false;//收藏回退按钮
                $rootScope.searchShow = false;     //是否显示搜索栏
                $rootScope.rightButShow = false;     //是否显示右边按钮
                $rootScope.leftButtonShow = true; //是否显示左侧按钮
                $rootScope.leftButton = 'backButton';  //左边按钮为后退按钮
                $rootScope.leftUrl = 'main.signIn';    //左边按钮链接
                $rootScope.slideDirection = false; //是否显示侧栏按钮
            }
        })
        .state('main.user',{
            url: '/user',
            views: {
                'header':{
                    templateUrl:'../web/module/header.html'
                },
                'content' :{
                    templateUrl: '../web/module/sideMenu.html'
                }
            },
            onEnter: function($rootScope){
                $rootScope.title = '';
                $rootScope.headerTitle = '';  //主页title
                $rootScope.contentShow = true;    //是否显示内容
                $rootScope.headerShow = true;    //是否显示头部
                $rootScope.footerShow = false;    //是否显示页脚
                $rootScope.searchButtonShow = false;//搜索回退按钮
                $rootScope.commentButtonShow = false;//评论回退按钮
                $rootScope.collectNewsButtonShow = false;//收藏回退按钮
                $rootScope.searchShow = false;     //是否显示搜索栏
                $rootScope.rightButShow = false;     //是否显示右边按钮
                $rootScope.leftButtonShow = true; //是否显示左侧按钮
                $rootScope.leftButton = 'backButton';  //左边按钮为后退按钮
                $rootScope.leftUrl = 'main.home';    //左边按钮链接
                $rootScope.slideDirection = false; //是否显示侧栏按钮
            }
        });
});