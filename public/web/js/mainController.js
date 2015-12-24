'use strict';
var indexApp = angular.module('indexApp',['ionic','cookie','ngAnimate','httpSever','sever','LoadingApp',
    'jqLite','scrollResize','browser','arrayBox','popBox','NoSQL','loading',
    'Base64','url','angular-cache','ngImgCrop']);

//设置LRU算法，访问的页面写入内存，在60秒内重新访问之前页面无需耗费流量
indexApp.run(function ($http, CacheFactory) {
    $http.defaults.cache = CacheFactory('myCache', {
        capacity: 5, //最大缓存数量
        maxAge: 60 * 1000, //新插入的缓存过期时间
        cacheFlushInterval: 60 * 1000, //所有缓存过期时间
        deleteOnExpire: 'aggressive', //删除过期缓存
        storageMode: 'memory' //缓存写入内存
    });
});

var dataBase;
var SQLName = 'mydb';
var signIn = false;
var commentId;//回复id
var commentIndex;//评论或者回复
var search = false;
var comment = false;
var collectNews = false;

//主控制器
indexApp.controller('mainController',function($scope,$cacheFactory,$rootScope,urlBox,$location,loading,browser,promise,
                                              jQuery,scroll,cookie,popBox,NoSQL,$timeout,loadPop,arrayBox,CacheFactory){
    cookie.setCookie('newsId',1);
    $scope.$on('$stateChangeSuccess',function(){
        if($location.$$path == '/index/mainText' || $location.$$path == '/index/viewComments'){
            $scope.footerShow = true;    //是否显示页脚
        }
        else{
            $scope.footerShow = false;    //是否显示页脚
        }
        if($location.$$path == '/index/thirdPartyLogin'){
            $scope.but2Show = false;
        }
        else{
            $scope.but2Show = true;
        }
        if($location.$$path == '/index/home'){
            if(urlBox.getUrl('token')){
                promise.getThirdToken(urlBox.getUrl('token')).success(function(data){
                    promise.accessToken(data).success(function(data){
                        cookie.setCookie('access_token',data.access_token, 's' + data.expires_in);
                        $timeout(function(){
                            popBox.showConfirm('提示','登录成功!');
                        },5000)
                    });
                });
            }
        }
    });
    //判断初始是否登录
    if(cookie.getCookie('access_token')){
        signIn = true;
    }
    else{
        signIn = false;
    }
    //数据库控制器
    if(sql){
        var db = NoSQL.openSQL(SQLName,1);
        db.onsuccess=function(e){
            dataBase = e.target.result;
        };
        NoSQL.createObjectStore(db,'user','cid',true);
    }
    else{
        dataBase = NoSQL.openSQL(SQLName,'1.0', 'Test', 2 * 1024);
    }
    // 加载框
    if($location.$$path == '/index/home'){
        loading.showLoading();
        $timeout(function(){
            loading.hideLoading();
            $scope.deleteLoading = false;
        },5000);
    }
    else{
        $scope.deleteLoading = false;
        loading.hideLoading();
    }
    //左侧滑动栏宽度
    $scope.sideWidh = browser.factory()[0] * 4 / 5;
    //页脚控制器
    var footerCommentShow = false;
    //footer变换
    $scope.footerCommentShow = footerCommentShow;
    //隐藏遮罩层
    $scope.footerMaskLayerShow = footerCommentShow;
    var close = function(){
        if($location.$$path == '/index/communityContent'){
            $scope.footerShow = false;
        }
        $scope.footerMaskLayerShow = false;
        $scope.footerCommentShow = false;
        $scope.footerStyle = {
            height: '44px'
        };
    };
    $scope.closeFooter = function(){
        var len = jQuery.$('commentText').length;
        for(var i = 0;i < len;i++){
            if(jQuery.$('commentText')[i].value){
                jQuery.$('commentText')[i].value = '';
            }
        }
        close();
    };
    //新闻详情内容
    $scope.$on('$stateChangeSuccess',function(){
        if(cookie.getCookie('access_token') && $location.$$path == '/index/mainText'){
            loadPop.spinningBubbles();
            $scope.textTitle = '';
            $scope.textOrigin = '';
            $scope.textAuthor = '';
            $scope.textCreated = '';
            $scope.textThumbnail = '';
            if(jQuery.$('textImg')[0]){
                jQuery.$('textImg')[0].src = ''
            }
            $scope.comments = [];
            $scope.newsMain = [];
            if(jQuery.$('textContentMain')[0]){
                jQuery.$('textContentMain')[0].innerHTML = '';
            }
            promise.getArticles('',cookie.getCookie('newsId'),cookie.getCookie('access_token')).success(function(data) {
                //详情文章的内容
                cookie.setCookie('OperType',data.article.OperType);
                var body = '';
                var len = data.article.Body.length;
                if(len <= 100){
                    for(var i = 0;i < len;i++){
                        body += data.article.Body[i];
                    }
                }
                else{
                    for(var i = 0;i < 100;i++){
                        body += data.article.Body[i];
                    }
                }
                var des = '中国海运信息网: ' + body + ' ...';
                mobShare.config( {
                    appkey: 'ab27042c2b50',
                    params: {
                        url: data.article.ShareLink,
                        title: data.article.Title,
                        description: des,
                        pic: data.article.PicName
                    }
                });
                var textData = data.article;
                $scope.textTitle = textData.Title;
                $scope.textOrigin = textData.Source;
                $scope.textAuthor = textData.Author;
                $scope.textCreated = textData.PublishUtcDate;
                $scope.textThumbnail = textData.PicName;
                textData.Body = '<p>' + textData.Body + '</p>';
                jQuery.$('textContentMain').append(textData.Body);
                //聊天内容
                $scope.comments = data.hot_comments;
                //相关文章
                $scope.newsMain = data.related_articles;
                //增加收藏
                if(textData.is_starred){
                    jQuery.$('collectionbut').addClass('collectionbutAction');
                }
                else{
                    jQuery.$('collectionbut').removeClass('collectionbutAction');
                }
                loadPop.stopAll();
                //重载滚动条
                scroll.resize();
            }).error(function(){
                popBox.showConfirm('警告!','获取新闻失败!');
                loadPop.stopAll();
            });
        }
        else if($location.$$path == '/index/mainText'){
            loadPop.spinningBubbles();
            promise.getArticles('',cookie.getCookie('newsId')).success(function(data) {
                cookie.setCookie('OperType',data.article.OperType);
                $scope.textTitle = '';
                $scope.textOrigin = '';
                $scope.textAuthor = '';
                $scope.textCreated = '';
                $scope.textThumbnail = '';
                if(jQuery.$('textImg')[0]){
                    jQuery.$('textImg')[0].src = ''
                }
                $scope.comments = [];
                $scope.newsMain = [];
                if(jQuery.$('textContentMain')[0]){
                    jQuery.$('textContentMain')[0].innerHTML = '';
                }
                //详情文章的内容
                var body = '';
                var len = data.article.Body.length;
                if(len <= 100){
                    for(var i = 0;i < len;i++){
                        body += data.article.Body[i];
                    }
                }
                else{
                    for(var i = 0;i < 100;i++){
                        body += data.article.Body[i];
                    }
                }
                var des = '中国海运信息网: ' + body + ' ...';
                mobShare.config( {
                    appkey: 'ab27042c2b50',
                    params: {
                        url: data.article.ShareLink,
                        title: data.article.Title,
                        description: des,
                        pic: data.article.PicName
                    }
                });
                var textData = data.article;
                $scope.textTitle = textData.Title;
                $scope.textOrigin = textData.Source;
                $scope.textAuthor = textData.Author;
                $scope.textCreated = textData.PublishUtcDate;
                $scope.textThumbnail = textData.PicName;
                textData.Body = '<p>' + textData.Body + '</p>';
                jQuery.$('textContentMain').append(textData.Body);
                //聊天内容
                $scope.comments = data.hot_comments;
                //相关文章
                $scope.newsMain = data.related_articles;
                loadPop.stopAll();
                //重载滚动条
                scroll.resize();
            }).error(function(){
                popBox.showConfirm('警告!','获取新闻失败!');
                loadPop.stopAll();
            });
        }
    });
    //搜索新闻
    $scope.searchFor = function(id,OperType){
        comment = false;
        search = true;
        collectNews = false;
        loadPop.spinningBubbles();
        cookie.setCookie('newsId',id);
        if(OperType){
            cookie.setCookie('OperType',OperType);
        }
        else{
            cookie.setCookie('OperType','');
        }
        jQuery.$('backdrop').css({background:'black',opacity:'0.5'});
    };
    //新闻
    $scope.mainTextData = function(msg,OperType){
        comment = false;
        search = false;
        collectNews = false;
        cookie.setCookie('newsId',msg);
        if(OperType){
            cookie.setCookie('OperType',OperType);
        }
        else{
            cookie.setCookie('OperType','');
        }
        jQuery.$('backdrop').css({background:'black',opacity:'0.5'});
    };
    //用户评论
    $scope.userComment = function(msg,OperType){
        comment = true;
        search = false;
        collectNews = false;
        cookie.setCookie('newsId',msg);
        if(OperType){
            cookie.setCookie('OperType',OperType);
        }
        else{
            cookie.setCookie('OperType','');
        }
        jQuery.$('backdrop').css({background:'black',opacity:'0.5'});
    };
    $scope.popBox = function(index){
        //性别
        if(index == 2 && $location.$$path == '/index/signIn'){
            popBox.choicePopup($rootScope,'<span class="genderTitle">性别</span>');
        }
        //清理缓存
        else if(index == 1 && $location.$$path == '/index/userSetUp'){
            //清除cookie
            CacheFactory.clearAll(); //清理http缓存
            cookie.delCookie('newsId');  //清除新闻cookie
            cookie.delCookie('img_token');  //清除图片的token
            cookie.delCookie('OperType');
            //清除indexedDB数据库资料
            $timeout(function(){
                location.reload();
            })
        }
    };
    //本文评论
    var proThisData = function(){
        if($location.$$path == '/index/viewComments' && cookie.getCookie('newsId')) {
            loadPop.spinningBubbles();
            promise.getArticlesComments(cookie.getCookie('newsId')).success(function (data) {
                $scope.commentThisData = data.lists;
                scroll.resize();
            }).error(function (data) {
                popBox.showConfirm('警告!',data.error_description);
            });
        }
    };
    proThisData();
    //其他评论
    var proOthers = function(){
        if($location.$$path == '/index/viewComments' && cookie.getCookie('newsId')) {
            promise.getArticlesComments(cookie.getCookie('newsId')).success(function (data) {
                $scope.commentOthers = data.extras;
                loadPop.stopAll();
                scroll.resize();
            }).error(function (data) {
                popBox.showConfirm('警告!',data.error_description);
            });
        }
    };
    proOthers();
    $scope.$on('$stateChangeSuccess',function(){
        //收藏
        if(cookie.getCookie('access_token') && cookie.getCookie('newsId')) {
            if($location.$$path == '/index/mainText' || $location.$$path == '/index/viewComments'){
                promise.getArticles('', cookie.getCookie('newsId'), cookie.getCookie('access_token')).success(function (data) {
                    var textData = data.article;
                    //增加收藏
                    if(textData.is_starred){
                        jQuery.$('collectionbut').addClass('collectionbutAction');
                    }
                    else{
                        jQuery.$('collectionbut').removeClass('collectionbutAction');
                    }
                })
            }
        }
        proThisData();
    });
    $scope.$on('$stateChangeSuccess',function(){
        $scope.footerMaskLayerShow = false;
        proOthers();
    });
    $scope.shareShow = false; //是否显示分享
    //尾页评论框
    $scope.sendOutBox = function(index,id,e,flag) {
        if(flag && flag != 'undefined'){
            cookie.setCookie('flags',flag);
        }
        $scope.footerShow = true;
        if(id){
            commentId = id;
        }
        $timeout(function(){
            if(jQuery.$('footer')[0].offsetHeight == 129 && commentIndex == 'commentReplies' && index == 'commentThis'){
                commentIndex = 'commentReplies'
            }
            else{
                commentIndex = index;
            }
            $scope.footerMaskLayerShow = true;
            $scope.footerCommentShow = true;
            $scope.footerStyle = {
                height: '129px'
            };
        })
    };
    //社区
    var slideDownIndex = true;
    var slideDownIndexBut = true;
    $scope.slideDownIndex = false;
    $scope.slideDownIndexBut = slideDownIndexBut;
    //热门标签
    promise.getType({type: 'hot'}).success(function(data){
        $scope.floatBoxs = data;
        $scope.heightFix = {};
    }).error(function(data){
        popBox.showConfirm('警告!',data.error_description);
    });
    //点击浮动按钮增加评论
    var commentsBox = [];
    var commentTitle = [];
    $scope.addComments = function(id,event){
        commentsBox.push(id);
        commentTitle.push(event.target.innerText);
        //写入title
        var writeTitle = function(){
            commentTitle = arrayBox.delSame(commentTitle);
            if(commentTitle.length == 1){
                jQuery.$('communityItemLeft')[1].innerText = commentTitle[0];
            }
            else if(commentTitle.length != 1 && commentTitle.length != 0){
                var dataMain = commentTitle[0];
                for(var i = 1;i < commentTitle.length;i++){
                    dataMain = dataMain + '+' +commentTitle[i];
                }
                jQuery.$('communityItemLeft')[1].innerText = dataMain;
            }
            else if(commentTitle.length == 0){
                jQuery.$('communityItemLeft')[1].innerText = '';
                $scope.slideDownIndex = false;
            }
        };
        //判断是否选择
        if(angular.element(event.target).hasClass('choice')){
            angular.element(event.target).removeClass('choice');
            for(var i = 0;i < commentsBox.length;i++){
                if(commentsBox[i] == id){
                    commentsBox.splice(i,1);
                }
            }
            if(commentsBox[0] == id){
                commentsBox.splice(0,1);
            }
            if(commentsBox[commentsBox.length - 1] == id){
                commentsBox.splice(commentsBox.length - 1,1);
            }
            for(var h = 0;h < commentTitle.length;h++){
                if(commentTitle[h] == event.target.innerText){
                    commentTitle.splice(h,1);
                }
            }
            if(commentTitle[0] == event.target.innerText){
                commentTitle.splice(0,1);
            }
            if(commentTitle[commentTitle.length - 1] == event.target.innerText){
                commentTitle.splice(commentTitle.length - 1,1);
            }
            writeTitle();
        }
        else{
            angular.element(event.target).addClass('choice');
            writeTitle();
        }
        if(commentsBox.length != 0){
            loadPop.spinningBubbles();
            promise.getTypeComments(commentsBox).success(function(data){
                if(data.length != 0 && slideDownIndex){
                    $scope.slideDownIndex = true;
                }
                $scope.comComments = data;
                $timeout(function(){
                    //修复滚动条高度
                    $scope.heightFix = {
                        height: (
                        jQuery.$('list')[1].scrollHeight +
                        jQuery.$('commLineHeight')[0].children[0].scrollHeight +
                        jQuery.$('commLineHeight')[1].children[0].scrollHeight)  + 'px'
                    };

                    loadPop.stopAll();
                    scroll.resize();
                });
            }).error(function(data){
                popBox.showConfirm('警告!',data.error_description);
                loadPop.stopAll();
            });
        }
    };
    $scope.tabSlideDown = function(){
        //所有标签
        if(slideDownIndex){
            jQuery.$('communityItemLeft')[0].innerText = '所有标签';
            promise.getType({type: 'all'}).success(function(data){
                $scope.floatBoxs = data;
                slideDownIndex = !slideDownIndex;
                slideDownIndexBut = !slideDownIndexBut;
                $scope.slideDownIndex = slideDownIndex;
                $scope.slideDownIndexBut = slideDownIndexBut;
                $timeout(function(){
                    for(var i = 0;i < commentsBox.length;i++){
                        for(var k = 0;k < jQuery.$('float').length;k++){
                            if(jQuery.$('float')[k].attributes[3].value == commentsBox[i]){
                                jQuery.$('float').eq(k).addClass('choice');
                            }
                        }
                    }
                    scroll.resize();
                });
                scroll.resize();
            }).error(function(data){
                popBox.showConfirm('警告!',data.error_description);
            });
        }
        //热门标签
        else{
            jQuery.$('communityItemLeft')[0].innerText = '热门标签';
            promise.getType({type: 'hot'}).success(function(data){
                $scope.floatBoxs = data;
                slideDownIndex = !slideDownIndex;
                slideDownIndexBut = !slideDownIndexBut;
                $scope.slideDownIndex = slideDownIndex;
                $scope.slideDownIndexBut = slideDownIndexBut;
                if(jQuery.$('communityItemLeft')[1].innerText == ''){
                    $scope.slideDownIndex = false;
                }
                $timeout(function(){
                    for(var i = 0;i < commentsBox.length;i++){
                        for(var k = 0;k < jQuery.$('float').length;k++){
                            if(jQuery.$('float')[k].attributes[3].value == commentsBox[i]){
                                jQuery.$('float').eq(k).addClass('choice');
                            }
                        }
                    }
                    scroll.resize();
                });
                scroll.resize();
            }).error(function(data){
                popBox.showConfirm('警告!',data.error_description);
            });
        }
    };
    //发表评论
    $scope.sendOut = function(flag){
        cookie.setCookie('flag',flag);
        //评论本文
        if(commentIndex && commentIndex == 'commentThis'){
            if(cookie.getCookie('access_token') && cookie.getCookie('newsId')){
                loadPop.spinningBubbles();
                promise.postArticlesComments(cookie.getCookie('newsId'),{content: jQuery.$('commentTextArea')[0].value},cookie.getCookie('access_token'))
                    .success(function(){
                        if($location.$$path == '/index/viewComments' || '/index/mainText'){
                            promise.getArticlesComments(cookie.getCookie('newsId')).success(function(data){
                                if($location.$$path == '/index/mainText'){
                                    promise.getArticles('',cookie.getCookie('newsId')).success(function(data){
                                        $scope.comments = data.hot_comments;
                                    });
                                }
                                $scope.commentThisData = data.lists;
                                $scope.commentOthers = data.extras;
                                scroll.resize();
                                var len = jQuery.$('commentText').length;
                                for(var i = 0;i < len;i++){
                                    if(jQuery.$('commentText')[i].value){
                                        jQuery.$('commentText')[i].value = '';
                                    }
                                }
                                close();
                                loadPop.stopAll();
                            }).error(function(data){
                                loadPop.stopAll();
                                popBox.showConfirm('警告!',data.error_description);
                            });
                        }
                    })
                    .error(function(data){
                        loadPop.stopAll();
                        popBox.showConfirm('警告!',data.error_description);
                    });
            }
            else{
                popBox.showPopup($scope,'验证消息','请输入验证码');
            }
        }
        //回复本文评论
        else if(commentIndex && commentIndex == 'commentReplies' && typeof commentId =='number'){
            if(cookie.getCookie('access_token') && cookie.getCookie('newsId')){
                loadPop.spinningBubbles();
                promise.postArticlesReplies(commentId,{content: jQuery.$('commentTextArea')[0].value},cookie.getCookie('access_token'))
                    .success(function(){
                        if($location.$$path == '/index/viewComments' || $location.$$path == '/index/mainText'){
                            promise.getArticlesComments(cookie.getCookie('newsId')).success(function(data){
                                if($location.$$path == '/index/mainText'){
                                    promise.getArticles('',cookie.getCookie('newsId')).success(function(data){
                                        $scope.comments = data.hot_comments;
                                    });
                                }
                                $scope.commentThisData = data.lists;
                                $scope.commentOthers = data.extras;
                                scroll.resize();
                                var len = jQuery.$('commentText').length;
                                for(var i = 0;i < len;i++){
                                    if(jQuery.$('commentText')[i].value){
                                        jQuery.$('commentText')[i].value = '';
                                    }
                                }
                                close();
                                loadPop.stopAll();
                            }).error(function(data){
                                loadPop.stopAll();
                                popBox.showConfirm('警告!',data.error_description);
                            });
                        }
                        else if($location.$$path == '/index/communityContent'){
                            $scope.footerShow = false;    //是否显示页脚
                            $scope.footerMaskLayerShow = false;
                            if(comments.length != 0){
                                loadPop.spinningBubbles();
                                promise.getTypeComments(comments).success(function(data){
                                    if(data.length != 0 && slideDownIndex){
                                        $scope.slideDownIndex = true;
                                    }
                                    $scope.comComments = data;
                                    $timeout(function(){
                                        //修复滚动条高度
                                        $scope.heightFix = {
                                            height: (
                                            jQuery.$('list')[1].scrollHeight +
                                            jQuery.$('commLineHeight')[0].children[0].scrollHeight +
                                            jQuery.$('commLineHeight')[1].children[0].scrollHeight)  + 'px'
                                        };
                                        loadPop.stopAll();
                                        scroll.resize();
                                    });
                                }).error(function(data){
                                    popBox.showConfirm('警告!',data.error_description);
                                    loadPop.stopAll();
                                });
                            }
                        }
                    })
                    .error(function(data){
                        loadPop.stopAll();
                        popBox.showConfirm('警告!',data.error_description);
                    });
            }
            else{
                popBox.showPopup($scope,'验证消息','请输入验证码');
            }
        }
    };
    $scope.closeShare = function(){
        jQuery.$('sharebut').removeClass('shareReady');
        $scope.footerMaskLayerShow = false;
        $scope.shareShow = false;
    };
    $scope.textNews = function(id){
        cookie.setCookie('newsId',id);
        if ($location.$$path == '/index/mainText' && cookie.getCookie('newsId') != 0 && cookie.getCookie('newsId')){
            promise.getArticles('',cookie.getCookie('newsId')).success(function(data){
                //详情文章的内容
                cookie.setCookie('newsId',data.article.Id);
                var textData = data.article;
                $scope.textTitle = textData.Title;
                $scope.textOrigin = textData.Source;
                $scope.textAuthor = textData.Author;
                $scope.textCreated = textData.PublishUtcDate;
                $scope.textThumbnail = textData.PicName;
                jQuery.$('textContentMain')[0].innerHTML = '';
                jQuery.$('textContentMain').append(textData.Body);
                //聊天内容
                $scope.comments = data.hot_comments;
                //相关文章
                $scope.newsMain = data.related_articles;
                //重载滚动条
                scroll.resize();
            });
        }
    };
    //个人消息写入数据库
    if(cookie.getCookie('access_token')){
        if(sql){
            promise.getUserInformations(cookie.getCookie('access_token')).success(function(data){
                var base = [];
                for(var i = 0;i < data.length;i++){
                    base.push(data[i].id);
                }
                base = [
                    {
                        cid: -2,
                        userInformation: base
                    }
                ];
                NoSQL.insert(dataBase,base,'user',1);
            });
        }
    }
});

//修改头像控制器
indexApp.controller('imgCropController',function($scope,popBox,promise,$location){
    $scope.size='small';
    $scope.type='circle';
    $scope.imageDataURI='';
    $scope.resImageDataURI='';
    $scope.resImgFormat='image/png';
    $scope.resImgQuality=1;
    $scope.selMinSize=100;
    $scope.resImgSize=200;
    $scope.cropData = '点击上传您的头像';
    $scope.onLoadDone=function() {
        $scope.submit = true;
        $scope.cropData = '重新选择';
    };
    $scope.onLoadError=function() {
        popBox.showConfirm('警告','头像上传失败！');
    };

    var handleFileSelect=function(evt) {
        var file=evt.currentTarget.files[0];
        var reader = new FileReader();
        reader.onload = function (evt) {
            $scope.$apply(function($scope){
                $scope.imageDataURI=evt.target.result;
            });
        };
        reader.readAsDataURL(file);
    };
    angular.element(document.querySelector('#fileInput')).on('change',handleFileSelect);
    var key = true;
    $scope.saveImg = function(){
        if(key){
            key = false;
            promise.postImgCrop($scope.resImageDataURI).success(function(){
                key = true;
                popBox.showConfirm('提示','修改成功！');
                $location.path('/index/signIn');
            },function(){
                key = true;
                popBox.showConfirm('提示','修改失败！');
            });
        }
        else{
            alert('服务器延迟请稍等！');
        }
    };
});

//页脚控制器
indexApp.controller('footerController',function($scope,$rootScope,promise,cookie,jQuery,popBox){
    //收藏
    $scope.collect = function(){
        if(cookie.getCookie('access_token') && cookie.getCookie('newsId')){
            if(jQuery.$('collectionbut').hasClass('collectionbutAction')){
                promise.deleteArticlesStars(cookie.getCookie('newsId'),cookie.getCookie('access_token')).success(function(){
                    jQuery.$('collectionbut').removeClass('collectionbutAction');
                }).error(function(){
                    popBox.showConfirm('警告!','取消收藏失败!');
                });
            }
            else{
                promise.putArticlesStars(cookie.getCookie('newsId'),cookie.getCookie('access_token')).success(function(){
                    jQuery.$('collectionbut').addClass('collectionbutAction');
                }).error(function(){
                    popBox.showConfirm('警告!','收藏失败!');
                });
            }
        }
        else{
            popBox.showConfirm('警告!','请先登录!');
        }
    };
});

//验证码弹出框控制器
indexApp.controller('popImg',function($scope,promise,cookie){
    promise.generateToken().success(function(data){
        $scope.imagesGet = '/generate_captcha?token=' + data;
        cookie.setCookie('img_token',data);
    });
    $scope.changeImg = function(){
        promise.generateToken().success(function(data){
            $scope.imagesGet = '/generate_captcha?token=' + data;
            cookie.setCookie('img_token',data);
        });
    };
});

//home首页
indexApp.controller('homeController',function($scope,$rootScope,$location,$timeout,loading,http,jQuery,scroll,promise,$ionicSlideBoxDelegate,$ionicScrollDelegate,browser,$animate,cookie,NoSQL,loadPop){
    //头部标签
    $scope.refresherShow = true;
    //下拉框是否显示
    var slideUpShow = false;
    $scope.slideUpShow = slideUpShow; //一开始显示标题
    //下拉按钮
    $scope.slideUp = function(){
        $scope.refresherShow = slideUpShow;
        slideUpShow = !slideUpShow;
        if(slideUpShow){
            jQuery.$('scroll').eq(0).addClass('slideDelet');
        }
        else{
            jQuery.$('scroll').eq(0).removeClass('slideDelet');
        }
        $scope.slideUpShow = slideUpShow;
        if(!slideUpShow){
            floatIndex();
        }
        //动画
        if(jQuery.$('slideDown').length == 0){
            jQuery.$('slidePage').removeClass('slideUp');
            jQuery.$('slidePage').addClass('slideDown');
            $animate['addClass'](jQuery.$('slideDownBox'),'slideDownAct-add',
                setTimeout(function(){
                    jQuery.$('slideDownBox').removeClass('slideDownAct-add');
                    jQuery.$('slideDownBox').css({
                        height: '96%'
                    });
                },1000)
            )
        }
        else{
            jQuery.$('slidePage').removeClass('slideDown');
            jQuery.$('slidePage').addClass('slideUp');
            $animate['addClass'](jQuery.$('slideDownBox'),'slideUpAct-add',
                setTimeout(function(){
                    jQuery.$('slideDownBox').removeClass('slideUpAct-add');
                    jQuery.$('slideDownBox').css({
                        height: '0'
                    });
                },1000)
            );
        }
    };
    //每页10条
    var per_page = 10;
    //首页的新闻
    var newsBox = [];
    var floatIndex = function(){
        //登录后操作
        promise.getArticles({'per_page': per_page}).success(function(data){
            //主页新闻主题标签
            var init_columns = [];
            init_columns.push({
                id: 8,
                name: '推荐'
            });
            promise.getColumns().success(function(data){
                var length = data.length;
                var i = 0;
                var dataHome = function(){
                    if(i < length){
                        if(sql){
                            var dataBox = NoSQL.findBase(dataBase,data[i].cid,'user',1);
                            dataBox.onsuccess = function(e){
                                if(e.target.result.value.selected){
                                    init_columns.push(e.target.result.value);
                                }
                                i++;
                                dataHome();
                            };
                        }
                        else{
                            NoSQL.findBase(dataBase,'user',function(e){
                                if(e[1][i].selected){
                                    init_columns.push(e[1][i]);
                                }
                                i++;
                                dataHome();
                            });
                        }
                    }
                    else{
                        $scope.newsBars = init_columns;
                    }
                };
                dataHome();
            });
            newsBox = data.articles;
            if(data.articles.length < per_page){
                $scope.infiniteShow = false;
            }
            reloading(1);
            //重载滚动条
            scroll.resize();
        });
    };
    floatIndex();
    promise.getArticles({'per_page': per_page}).success(function(data){
        $scope.news = data.articles;
    });
    //查询标签选择索引
    var takeId = function(){
        var id;
        for(var i = 0;i <= jQuery.$('newsBarSlide').length;i++){
            if(jQuery.$('newsBarSlide').eq(i).hasClass('on')){
                id = jQuery.$('newsBarSlide').eq(i)[0].attributes[1].value;
            }
        }
        return id;
    };
    //滚动时触发方式
    $scope.infiniteShow = true;
    //初始翻页
    var pageMove = true; //是否最后一页
    var page = 1; //初始页
    var stateSuccess = true;//是否promise完毕
    $scope.scrollFun = function(){
        //滚动条垂直偏移量 + 屏幕长度 > 尾部垂直位置 + header长度
        if(($ionicScrollDelegate.$getByHandle('mainScroll').getScrollPosition().top + browser.factory()[5] ) > jQuery.$('infinite')[0].offsetTop + 55
            && pageMove
            && stateSuccess
        ){
            stateSuccess = false;
            var id = takeId();
            var res = function(){
                promise.getArticles({'cid': id,'page': page + 1,'per_page': per_page}).success(function(data){
                    if(data.articles.length == 0){
                        $scope.infiniteShow = false;
                        pageMove = false;
                    }
                    else{
                        page += 1;
                        for(var i = 0;i < data.articles.length;i++){
                            newsBox.push(data.articles[i]);
                        }
                        $scope.news = newsBox;
                        //重载滚动条
                        scroll.resize();
                        stateSuccess = true;
                    }
                });
            };
            if(id == 8){
                $timeout(function(){
                    id = takeId();
                    res();
                })
            }
            else{
                res();
            }
        }
    };
    //主页刷新新闻
    $scope.slideDelete = true;
    //重载首页
    $scope.reLoadingHome = function(){
        reloading();
    };
    var reloading = function(msg){
        if($ionicScrollDelegate.$getByHandle('mainScroll').getScrollPosition().top < 0 || msg == 1){
            if(msg == 1){
                id = 8;
            }
            else{
                var id = takeId();
            }
            var reload = function(data){
                //更新新闻
                newsBox = [];
                for(var i = 0;i < data.articles.length;i++){
                    newsBox.push(data.articles[i]);
                }
                //$scope.news = newsBox;
                //判断是否为推荐来完全删除滑动框
                if(id != 8){
                    $scope.slideDelete = false; //在dom删除滑动
                }
                else{
                    $scope.slideDelete = true; //在dom删除滑动
                }
                //更新首页的翻页内容
                if(data.articles.length >= 5){
                    $scope.slideNews = data.articles.slice(0, 4);
                    //重载
                    $ionicSlideBoxDelegate.update();
                    scroll.resize();
                }
                else{
                    $scope.slideNews = data.articles;
                    //重载
                    $ionicSlideBoxDelegate.update();
                    scroll.resize();
                }
                //初始翻页
                page = 1;
                pageMove = true;
                stateSuccess = true;
                $scope.infiniteShow = true;
                scroll.resize();
            };
            //更新首页的新闻标签
            if(cookie.getCookie('access_token')){
                promise.getArticles({'cid': id,'per_page': per_page,'page': 1},'',cookie.getCookie('access_token')).success(function(data){
                    $scope.news = data.articles;
                    //floatIndex();
                    reload(data);
                });
            }
            else{
                promise.getArticles({'cid': id,'per_page': per_page,'page': 1}).success(function(data){
                    $scope.news = data.articles;
                    //floatIndex();
                    reload(data);
                });
            }
        }
    };
    //首页新闻内容点击事件
    $scope.newsBarTouch = function(id,event){
        loadPop.spinningBubbles();
        //判断是否为推荐来完全删除滑动框
        if(id != 8){
            $scope.slideDelete = false; //在dom删除滑动
        }
        else{
            $scope.slideDelete = true; //在dom删除滑动
        }
        jQuery.$('newsBarSlide').removeClass('on');
        $timeout(function(){
            angular.element(event.srcElement).addClass('on');
        });
        promise.getArticles({'cid': id,'per_page': per_page}).success(function(data){
            newsBox = [];
            for(var i = 0;i < data.articles.length;i++){
                newsBox.push(data.articles[i]);
            }
            $scope.news = newsBox;
            if(data.articles.length < per_page){
                $scope.infiniteShow = false;
            }
            else{
                $scope.infiniteShow = true;
            }
            //初始化翻页
            page = 1;
            pageMove = true;
            stateSuccess = true;
            loadPop.stopAll();
        });
        scroll.resize(); //重载滚动条
    };
    scroll.resize(); //重载滚动条
});

//首页的翻页内容控制器
indexApp.controller('slideBarController',function($scope,jQuery,$animate,promise,scroll,$ionicSlideBoxDelegate){
    //首页的翻页内容
    promise.getArticles().success(function(data){
        if(data.articles.length >= 5){
            $scope.slideNews = data.articles.slice(0, 4);
            //重载
            $ionicSlideBoxDelegate.update();
            scroll.resize();
        }
        else{
            $scope.slideNews = data.articles;
            //重载
            $ionicSlideBoxDelegate.update();
            scroll.resize();
        }
    });
    //slide滑动时的动画
    $scope.slideFunc = function(index){
        jQuery.$('slideAbstractNews').removeClass('slideAbstractNews-add');
        jQuery.$('slideAbstractNews').removeClass('show');
        $animate['addClass'](
            jQuery.$('slideAbstractNews').eq(index),'slideAbstractNews-add',
            jQuery.$('slideAbstractNews').removeClass('slideAbstractNews-add'),
            jQuery.$('slideAbstractNews').removeClass('slideAbstractNewsDone'),
            jQuery.$('slideAbstractNews').eq(index).addClass('slideAbstractNewsDone')
        );
    };
});

//loadIn用户页面
indexApp.controller('userBox',function($scope,$rootScope,cookie,promise,NoSQL,jQuery,browser,popBox,$location){
    //查询新消息
    setInterval(function(){
        if(cookie.getCookie('access_token')){
            promise.getUserInformations(cookie.getCookie('access_token')).success(function(data){
                if(sql){
                    var dataBox = NoSQL.findBase(dataBase,-2,'user',1);
                    dataBox.onsuccess = function(e){

                    };
                }
            });
        }
        else{
            $scope.butNames = [
                {
                    sref: 'main.userComment',
                    name: '我的评论', //用户界面未登录时候按钮名字
                    point: false     // 是否显示红点
                },
                {
                    sref: 'main.userCollection',
                    name: '我的收藏',
                    point: false
                },
                {
                    sref: 'main.userInformation',
                    name: '我的消息',
                    point: false
                },
                {
                    sref: 'main.userSetUp',
                    name: '设置',
                    point: false
                }
            ];
        }
    },20000);
    $scope.butNames = [
        {
            sref: 'main.userComment',
            name: '我的评论', //用户界面未登录时候按钮名字
            point: false     // 是否显示红点
        },
        {
            sref: 'main.userCollection',
            name: '我的收藏',
            point: false
        },
        {
            sref: 'main.userInformation',
            name: '我的消息',
            point: false
        },
        {
            sref: 'main.userSetUp',
            name: '设置',
            point: false
        }
    ];
    $scope.$on('$stateChangeSuccess',function(){
        $rootScope.slideMenu = false;
        if(cookie.getCookie('access_token') == null || typeof cookie.getCookie('access_token') == 'undefined'){
            $scope.userHeadPic = '../web/mycompass/images/userOriginHead.png';  //用户头像
            $scope.userName = '用户登录'; //用户登录
            $scope.signOutBut = false;
            $scope.userHead = false;
        }
        else{
            promise.getUsers(cookie.getCookie('access_token')).success(function(data){
                if(data.avatar_url){
                    $scope.userHeadPic = data.avatar_url + '?' + Math.random();  //用户头像
                }
                else{
                    $scope.userHeadPic = '../web/mycompass/images/userOriginHead.png';  //用户默认头像
                }
                if(data.name){

                }
                else{
                    data.name = '点击编辑姓名';
                }
                $scope.userName = data.name;        //登录名称
                $scope.signOutBut = true;
                $scope.userHead = false;
            });
        }
        //退出
        $scope.signOut = function(){
            promise.invalidateToken(cookie.getCookie('access_token')).success(function(){
                cookie.delCookie('access_token');
                signIn = false;
                $scope.userHeadPic = '../web/mycompass/images/userOriginHead.png';  //用户头像
                $scope.userName = '用户登录'; //用户登录
                $scope.signOutBut = false;
                $scope.userHead = false;
                popBox.showConfirm('提示','退出登录成功！');
            });
        };
    });
    $rootScope.slideHide = function(){
        var transData = jQuery.$('menu-content')[0].style.cssText;
        var reg = /\-?[0-9]+\.?[0-9]*/g;
        var data = transData.match(reg);
        if(data[1] == 0 || (data[1] >= browser.factory()[0] * 4 / 5 - 1 && data[1] <= browser.factory()[0] * 4 / 5 + 1)){
            $rootScope.slideMenu = false;
        }
    };
    $rootScope.slideMenuHide = function(){
        //获取侧滑栏的css3的translate3d位置,拖拽小于160隐藏遮罩层
        var transData = jQuery.$('menu-content')[0].style.cssText;
        var reg = /\-?[0-9]+\.?[0-9]*/g;
        var data = transData.match(reg);
        if(data[1] <= browser.factory()[0] * 2 / 5 ){
            $rootScope.slideMenu = false;
        }
    };
    //$rootScope.openSlide = function(){
    //    $rootScope.slideMenu = true;
    //
    //};
});

//用户信息界面
indexApp.controller('userData',function($scope,promise,cookie,loadPop,$location){
    var upDate = function(){
        if($location.$$path == '/index/signIn'){
            loadPop.spinningBubbles();
        }
        promise.getUsers(cookie.getCookie('access_token')).success(function(data){
            $scope.userHead = true;
            if(data.avatar_url){
                $scope.userDataImg = data.avatar_url + '?' +Math.random();
            }
            else{
                $scope.userDataImg = '../web/mycompass/images/userOriginHead.png';  //用户默认头像
            }
            $scope.butNames = [
                {
                    name : '邮箱',
                    data: data.UserEmail,
                    sref:'main.userReviseMail'
                },
                {
                    name: '姓名',
                    data: data.name,
                    sref:'main.userReviseUserName'
                },
                {
                    name: '性别',
                    data: data.gender,
                    sref:'main.signIn'
                },
                {
                    name: '工作单位',
                    data: data.Company,
                    sref:'main.userReviseCompany'
                },
                {
                    name: '职位',
                    data: data.Post,
                    sref:'main.userReviseJob'
                }
            ];
            loadPop.stopAll();
        });
    };
    if(cookie.getCookie('access_token')){
        upDate();
    }
    $scope.$on('$stateChangeSuccess',function(){
        if(cookie.getCookie('access_token')){
            upDate();
        }
    });

});

//登录注册页面
indexApp.controller('signInContent',function($scope,$rootScope,promise,$location,cookie,NoSQL,jQuery,popBox,browser){
    $scope.userText = {
        'height': browser.factory()[5] * 0.098 + 'px'
    };
    var check = false;
    var thirdLoginShow = true;
    $rootScope.thirdLoginShow = thirdLoginShow;
    $scope.but1 = '登录';
    $scope.but2 = '注册';
    $scope.text1 = '   请输入用户名';
    $scope.text3 = '   请输入邮箱地址';
    $scope.text2 = '   请输入密码';
    $scope.register = function(event){
        $scope.user = '';
        thirdLoginShow = !thirdLoginShow;
        $rootScope.thirdLoginShow = thirdLoginShow;
        if(event.srcElement.innerText == '注册'){
            check = false;
            $rootScope.title = '注册';
            $rootScope.headerTitle = '注册';
            $scope.text1 = '   请输入用户名';
            $scope.text3 = '   请输入邮箱地址';
            $scope.text2 = '   请输入密码';
            $scope.but1 = '注册';
            $scope.but2 = '登录';
            $scope.myTop = {top: 0};
        }
        else{
            check = false;
            $rootScope.title = '登录';
            $rootScope.headerTitle = '登录';
            $scope.text1 = '   请输入用户名';
            $scope.text2 = '   请输入密码';
            $scope.but1 = '登录';
            $scope.but2 = '注册';
        }
    };
    $scope.checkTouch = function(){
        check =! check;
    };
    var key = true;
    $scope.land = function(event){
        if(event.srcElement.innerText == '注册'){
            if(key){
                key = false;
                if(check){
                    promise.postUsers($scope.user).success(function(){
                        promise.accessToken({
                            username: $scope.user.username,
                            password: $scope.user.password
                        }).success(function(data){
                            key = true;
                            cookie.setCookie('access_token',data.access_token, 's' + data.expires_in);
                            popBox.showConfirm('提示','注册成功!');
                            $location.path('/index/home');
                            signIn = false;
                            check = false;
                            $scope.user = '';
                        });

                    }).error(function(data){
                        key = true;
                        popBox.showConfirm('警告!',data.error_description);
                    });
                }
                else{
                    key = true;
                    popBox.showConfirm('警告','请先同意本站条款!');
                }
            }
            else{
                alert('服务器延迟请稍等!');
            }
        }
        else if(event.srcElement.innerText == '登录'){
            if(key){
                key = false;
                promise.accessToken($scope.user).success(function(data){
                    key = true;
                    cookie.setCookie('access_token',data.access_token, 's' + data.expires_in);
                    popBox.showConfirm('提示','登录成功!');
                    $scope.user = '';
                    if(sql){
                        var dataBaseRest = NoSQL.findBase(dataBase,-1,'user',1);
                        dataBaseRest.onsuccess = function(e){
                            var k = 0;
                            var localBase = [];  //数据表格数据
                            var selectedBox = [];
                            promise.getColumns().success(function(data) {
                                var forFun = function(){
                                    if(k < e.target.result.value.name.length){
                                        var dataBox = NoSQL.findBase(dataBase,data[k].cid,'user',1);
                                        dataBox.onsuccess = function(e){
                                            localBase.push(e.target.result.value);
                                            k++;
                                            forFun();
                                        };
                                    }
                                    else{
                                        for(var i = 0;i < localBase.length;i++){
                                            if(localBase[i].selected){
                                                selectedBox.push(localBase[i].cid);
                                            }
                                        }
                                        promise.putUserColumns(selectedBox,cookie.getCookie('access_token'));
                                    }
                                };
                                forFun();
                            });
                        };
                    }
                    signIn = false;
                    //个人消息写入数据库
                    promise.getUserInformations(cookie.getCookie('access_token')).success(function(data){
                        var base = [];
                        for(var i = 0;i < data.length;i++){
                            base.push(data[i].id);
                        }
                        base = [
                            {
                                cid: -2,
                                userInformation: base
                            }
                        ];
                        if(sql){
                            NoSQL.insert(dataBase,base,'user',1);
                        }
                    });
                    $location.path('/index/home');
                }).error(function(data){
                    key = true;
                    popBox.showConfirm('警告!',data.error_description);
                });
            }
            else{
                alert('服务器延迟请稍等!');
            }
        }
    };
});

//第三方页面控制器
indexApp.controller('userThirdBox',function($scope,promise){
    $scope.thirdBoxes = [
        {
            img: 'mycompass/images/weixing.png',
            content: '微信登录',
            href: ''
        },
        {
            img: 'mycompass/images/weibo.png',
            content: '微博登录',
            href: ''
        },
        {
            img: 'mycompass/images/qq.png',
            content: 'QQ登录',
            href: ''
        }
    ];
    promise.thirdPartyLogin('weiBo').success(function(weibo){
        promise.thirdPartyLogin('weiXin').success(function(weiXin){
            $scope.thirdBoxes = [
                {
                    img: 'mycompass/images/weixing.png',
                    content: '微信登录',
                    href: weiXin
                },
                {
                    img: 'mycompass/images/weibo.png',
                    content: '微博登录',
                    href: weibo
                },
                {
                    img: 'mycompass/images/qq.png',
                    content: 'QQ登录',
                    href: '/qq_login'
                }
            ];
        });
    });
});

//用户收藏页面控制器
indexApp.controller('userCollectionController',function($scope,$rootScope,promise,cookie,$timeout,$location,popBox,loadPop,jQuery){
    //相关文章
    var fun = function(){
        if($location.$$path == '/index/userCollection'){
            loadPop.spinningBubbles();
        }
        promise.getUserStars(cookie.getCookie('access_token')).success(function(data){
            $scope.news = data;
            loadPop.stopAll();
        }).error(function(data){
            popBox.showConfirm('警告!',data.error_description);
            loadPop.stopAll();
        });
    };
    $scope.collectNews = function(id){
        cookie.setCookie('newsId',id);
        comment = false;
        search = false;
        collectNews = true;
        jQuery.$('backdrop').css({background:'black',opacity:'0.5'});
    };
    $scope.$on('$stateChangeSuccess',function(){
        if(cookie.getCookie('access_token')){
            fun();
        }
        else{
            $timeout(function(){
                $location.path('/index/signIn');
            });
        }
    });
});

//用户设置控制器
indexApp.controller('userSetUp',function($scope){
    $scope.butNames = [
        {
            sref: 'main.aboutUs',
            name: '关于我们'
        },
        {
            sref: 'main.home',
            name: '清理缓存'
        }
    ];
});

//用户消息控制器
indexApp.controller('userInformationController',function($scope,$rootScope,promise,cookie,$location,$timeout,popBox,loadPop){
    $scope.$on('$stateChangeSuccess',function(){
        if(cookie.getCookie('access_token')){
            fun();
        }
        else{
            $timeout(function(){
                $location.path('/index/signIn');
            });
        }
    });
    var fun = function(){
        if($location.$$path == '/index/userInformation'){
            loadPop.spinningBubbles();
        }
        promise.getUserInformations(cookie.getCookie('access_token')).success(function(data){
            $scope.comments = data;
            loadPop.stopAll();
            var base = [];
            for(var i = 0;i < data.length;i++){
                base.push(data[i].id);
            }
            base = [
                {
                    cid: -2,
                    userInformation: base
                }
            ];
            if(sql) {
                var findBase = function(dataBase,searchData,name,IDBTransactionData){
                    var IDB;
                    if(IDBTransactionData == 0){
                        IDB = 'readonly';
                    }
                    else if(IDBTransactionData == 1){
                        IDB = 'readwrite';
                    }
                    else if(IDBTransactionData == 2){
                        IDB = 'versionchange';
                    }
                    var transaction = dataBase.transaction(name,IDB);
                    var store = transaction.objectStore(name);
                    var keyRange = IDBKeyRange.only(searchData);
                    return store.openCursor(keyRange);
                };
                var fun = function(cursor){
                    cursor.value.userInformation = base;
                    cursor.update(cursor.value);
                };
                var data = findBase(dataBase,-2,'user',1);
                data.onsuccess = function(event){
                    var cursor = event.target.result;
                    fun(cursor);
                };
            }
        }).error(function(data){
            popBox.showConfirm('警告!',data.error_description);
            loadPop.stopAll();
        });
    }
});

//我的评论页面控制器
indexApp.controller('userCommentController',function($scope,promise,cookie,$timeout,$location,popBox,loadPop){
    var fun = function(){
        if($location.$$path == '/index/userComment'){
            loadPop.spinningBubbles();
        }
        promise.getUserComments(cookie.getCookie('access_token')).success(function(data){
            $scope.comments = data;
            loadPop.stopAll();

        }).error(function(data){
            popBox.showConfirm('警告!',data.error_description);
            loadPop.stopAll();
        });
    };
    $scope.$on('$stateChangeSuccess',function(){
        if(cookie.getCookie('access_token')){
            fun();
        }
        else{
            $timeout(function(){
                $location.path('/index/signIn');
            });
        }
    });
});

//搜索控制器
indexApp.controller('searchController',function($scope,scroll,promise,cookie,popBox){
    $scope.search = function(){
        $scope.news = [];
        promise.getSearch({q: $scope.searchData}).success(function(data){
            $scope.news = data;
            scroll.resize();
        }).error(function(data){
            popBox.showConfirm('警告!',data.error_description);
        });
    };
});

//本文评论控制器
indexApp.controller('thisWriting',function($scope){
    $scope.origin = false;
});

//其他评论控制器
indexApp.controller('otherWriting',function($scope){
    $scope.origin = true;
});

//主页浮动框控制器
indexApp.controller('columnBox',function($scope,browser,promise,cookie,NoSQL){
    var addBase = [];  //数据表格数据
    var addBaseAll = []; //所有数据表格数据
    var floatBase ;    //数据表格参数
    $scope.boxArea = (browser.factory()[0] / 3) + 'px';
    $scope.boxAreaH = (browser.factory()[0] / 3) * 2 / 3 + 'px';
    //主页浮动模块处理json
    var tableFun = function(data){
        var len = data.length;
        var returnData = [];
        var returnDataBox = [];
        var mod = len % 3;
        var max = (len - mod) / 3;
        for(var i = 0;i < len;i++){
            returnDataBox.push(data[i]);
            //把json数据3组合成为一组
            if(returnDataBox.length == 3){
                returnData.push(returnDataBox);
                returnDataBox = [];
            }
        }
        returnDataBox = [];
        //处理剩余数组
        if(mod != 0){
            for(var i = 0;i < mod;i++){
                returnDataBox.push(data[len - mod + i]);
            }
            returnData.push(returnDataBox);
        }
        return returnData
    };
    promise.getColumns().success(function(data){
        for(var i = 0;i < data.length;i++){
            floatBase = {
                id: data[i].id,                  //键
                name: data[i].name,              //名称
                selected: data[i].selected,      //是否选择
                cid: data[i].cid
            };
            addBaseAll.push(floatBase);          //键 = -1
            addBase.push(floatBase);             //所有数据
        }
        //远程数据库数据本地化
        var clearBase = function(){
            addBaseAll = {
                cid: -1,
                name: addBaseAll
            };
            addBase.push(floatBase);
            addBase[addBase.length] = addBaseAll;
            if(sql){
                NoSQL.newData(dataBase,addBase,'user',1);
            }
            else{
                for(var i = 0;i < addBase.length;i++){
                    NoSQL.insert(dataBase,'user',addBase[i].cid,addBase[i]);
                }
            }
        };
        if(sql){
            var dataBaseRest = NoSQL.findBase(dataBase,-1,'user',1);
            dataBaseRest.onsuccess = function(e){
                //判断是否存在本地数据库
                if(e.target.result){
                    if(e.target.result.value.name.length != addBaseAll.length){
                        $scope.columnBoxes = tableFun(data);
                        clearBase();
                    }
                    else{
                        for(var i = 0;i < e.target.result.value.name.length;i++){
                            if(e.target.result.value.name[i].id != addBaseAll[i].id
                                || e.target.result.value.name[i].name != addBaseAll[i].name
                                || e.target.result.value.name[i].cid != addBaseAll[i].cid
                            ){
                                $scope.columnBoxes = tableFun(data);
                                clearBase();
                                break;
                            }
                            else{
                                var k = 0;
                                var localBase = [];
                                //异步处理增加外边框
                                var forFun = function(){
                                    if(k < e.target.result.value.name.length){
                                        var dataBox = NoSQL.findBase(dataBase,addBase[k].cid,'user',1);
                                        dataBox.onsuccess = function(e){
                                            localBase.push(e.target.result.value);
                                            k++;
                                            forFun();
                                        };
                                    }
                                    else{
                                        $scope.columnBoxes = tableFun(localBase);
                                    }
                                };
                                forFun();
                                break;
                            }
                        }
                    }
                }
                else{
                    $scope.columnBoxes = tableFun(data);
                    clearBase();
                }
            };
        }
        else{
            NoSQL.findBase(dataBase,'user',function(e){
                if(e[0].rows.length - 1 != addBaseAll.length){
                    $scope.columnBoxes = tableFun(data);
                    dataBase.transaction(function (tx) {
                        tx.executeSql('drop table user');
                    });
                    clearBase();
                }
                else{
                    for(var i = 0;i < e[1].length - 1;i++){
                        if(e[1][i].id != addBaseAll[i].id
                            || e[1][i].name != addBaseAll[i].name
                            || e[1][i].cid != addBaseAll[i].cid
                        ){
                            $scope.columnBoxes = tableFun(data);
                            dataBase.transaction(function (tx) {
                                tx.executeSql('drop table user');
                            });
                            clearBase();
                            break;
                        }
                        else{
                            var len = e[1].length;
                            e[1].splice(len - 1,1);
                            $scope.columnBoxes = tableFun(e[1]);
                            break;
                        }
                    }
                }
            },function(){
                //数据库不存在
                $scope.columnBoxes = tableFun(data);
                dataBase.transaction(function (tx) {
                    tx.executeSql('drop table user');
                });
                clearBase();
            });
        }
    });
    //用户添加栏目
    $scope.addColumns = function(ids){
        var columnBoxes = $scope.columnBoxes;
        for(var i = 0;i < columnBoxes.length;i++){
            for(var k = 0;k < columnBoxes[i].length;k++){
                if(columnBoxes[i][k].cid == ids){
                    columnBoxes[i][k].selected = !columnBoxes[i][k].selected;
                }
            }
        }
        $scope.columnBoxes = columnBoxes;
        //在线模式
        if(cookie.getCookie('access_token')){
            var localBase = [];
            var selectedBox = [];
            //判断之前是否登录,假如之前未登录那么用本地数据去同步远程数据
            if(!signIn){
                if(sql){
                    var dataBaseRest = NoSQL.findBase(dataBase,-1,'user',1);
                    dataBaseRest.onsuccess = function(e){
                        var k = 0;
                        var forFun = function(){
                            if(k < e.target.result.value.name.length){
                                var dataBox = NoSQL.findBase(dataBase,addBase[k].cid,'user',1);
                                dataBox.onsuccess = function(e){
                                    localBase.push(e.target.result.value);
                                    k++;
                                    forFun();
                                };
                            }
                            else{
                                for(var i = 0;i < localBase.length;i++){
                                    if(localBase[i].selected) {
                                        selectedBox.push(localBase[i].cid);
                                    }
                                }
                                promise.putUserColumns(selectedBox,cookie.getCookie('access_token'));

                            }
                        };
                        forFun();
                    }
                }
            }
            //同步一次
            signIn = false;
            //同步本地数据
            if(sql){
                NoSQL.findBaseUpdate(dataBase,ids,'user');
            }
        }
        //离线模式
        else{
            if(sql){
                NoSQL.findBaseUpdate(dataBase,ids,'user');
            }
            else{
                NoSQL.findBaseUpdate(dataBase,'user',ids);
            }
        }
    };
});

//点赞控制器
indexApp.controller('favours',function($scope,promise,cookie,popBox){
    $scope.favoursPut = function(articleId,commentId,event,flag){
        if(flag){
            cookie.setCookie('flag',flag);
        }
        if(cookie.getCookie('access_token')){
            promise.putFavours('PUT',articleId,commentId,cookie.getCookie('access_token'))
                .success(function(){
                    if(event.srcElement.nextElementSibling){
                        event.srcElement.nextElementSibling.innerText = parseInt(event.srcElement.nextElementSibling.innerText) + 1;
                    }
                    else{
                        event.srcElement.innerText = parseInt(event.srcElement.innerText) + 1;
                    }
                    $scope.comment.is_favoured = !$scope.comment.is_favoured;
                }).error(function(data){
                popBox.showConfirm('警告!',data.error_description);
            });
        }
        else{
            popBox.showConfirm('警告!','请先登录！');
        }
    };
    $scope.favoursDelete = function(articleId,commentId,event,flag){
        if(flag){
            cookie.setCookie('flag',flag);
        }
        if(cookie.getCookie('access_token')){
            promise.putFavours('DELETE',articleId,commentId,cookie.getCookie('access_token'))
                .success(function(){
                    if(event.srcElement.nextElementSibling){
                        event.srcElement.nextElementSibling.innerText = parseInt(event.srcElement.nextElementSibling.innerText) - 1;
                    }
                    else{
                        event.srcElement.innerText = parseInt(event.srcElement.innerText) - 1;
                    }
                    $scope.comment.is_favoured = !$scope.comment.is_favoured;
                }).error(function(data){
                popBox.showConfirm('警告!',data.error_description);
            });
        }
        else{
            popBox.showConfirm('警告!','请先登录！');
        }
    };
    $scope.favours = function(articleId,commentId,event){
        if(cookie.getCookie('access_token')){
            if(!articleId){
                articleId = 1;
            }
            promise.putFavours('PUT',articleId,commentId,cookie.getCookie('access_token'))
                .success(function(){
                    if(event.srcElement.nextElementSibling){
                        event.srcElement.nextElementSibling.innerText = parseInt(event.srcElement.nextElementSibling.innerText) + 1;
                    }
                    else{
                        event.srcElement.innerText = parseInt(event.srcElement.innerText) + 1;
                    }
                }).error(function(data){
                    if(data.error_description == '您已点赞！'){
                        promise.putFavours('DELETE',articleId,commentId,cookie.getCookie('access_token'))
                            .success(function(){
                                if(event.srcElement.nextElementSibling){
                                    event.srcElement.nextElementSibling.innerText = parseInt(event.srcElement.nextElementSibling.innerText) - 1;
                                }
                                else{
                                    event.srcElement.innerText = parseInt(event.srcElement.innerText) - 1;
                                }
                            }).error(function(data){
                                popBox.showConfirm('警告!',data.error_description);
                            });
                    }
                    else{
                        popBox.showConfirm('警告!',data.error_description);
                    }
                });
        }
        else{
            popBox.showConfirm('警告!','请先登录!');
        }
    };
});

//修改姓名控制器
indexApp.controller('userNameRevise',function($scope,$rootScope,promise,cookie,$location,popBox){
    promise.getUsers(cookie.getCookie('access_token')).success(function(data){
        $scope.nameData = data.name;
    }).error(function(data){
        popBox.showConfirm('警告!',data.error_description);
    });
    $rootScope.revise = function(){
        if($location.$$path == '/index/userReviseUserName') {
            promise.postUserRevise({
                name: $scope.nameData
            },cookie.getCookie('access_token')).success(function () {
                $location.path('/index/signIn');
            }).error(function (data) {
                popBox.showConfirm('警告!',data.error_description);
            });
        }
    }
});

//修改邮箱控制器
indexApp.controller('userMailRevise',function($scope,$rootScope,promise,cookie,$location,popBox){
    promise.getUsers(cookie.getCookie('access_token')).success(function(data){
        $scope.mailData = data.UserEmail;
    }).error(function(data){
        popBox.showConfirm('警告!',data.error_description);
    });
    $rootScope.revise = function(){
        if($location.$$path == '/index/userReviseMail') {
            promise.postUserRevise({
                email: $scope.mailData
            },cookie.getCookie('access_token')).success(function () {
                $location.path('/index/signIn');
            }).error(function (data) {
                popBox.showConfirm('警告!',data.error_description);
            });
        }
    }
});

//修改工作单位控制器
indexApp.controller('userCompanyRevise',function($scope,$rootScope,promise,cookie,$location,popBox){
    promise.getUsers(cookie.getCookie('access_token')).success(function(data){
        $scope.companyData = data.Company;
    }).error(function(data){
        popBox.showConfirm('警告!',data.error_description);
    });
    $rootScope.revise = function(){
        if($location.$$path == '/index/userReviseCompany'){
            promise.postUserRevise({company: $scope.companyData},
                cookie.getCookie('access_token')).success(function(){
                $location.path('/index/signIn');
            }).error(function(data){
                    popBox.showConfirm('警告!',data.error_description);
            });
        }
    }
});

//修改职位控制器
indexApp.controller('userJobRevise',function($scope,$rootScope,promise,cookie,$location,popBox){
    promise.getUsers(cookie.getCookie('access_token')).success(function(data){
        $scope.jobData = data.Post;
    }).error(function(data){
        popBox.showConfirm('警告!',data.error_description);
    });
    $rootScope.revise = function(){
        if($location.$$path == '/index/userReviseJob'){
            promise.postUserRevise({position: $scope.jobData},
                cookie.getCookie('access_token')).success(function(data){
                $location.path('/index/signIn');
            }).error(function(data){
                    popBox.showConfirm('警告!',data.error_description);
            });
        }
    }
});

//修改性别控制器
indexApp.controller('radio',function($scope,$rootScope,promise,cookie,$location,jQuery,popBox){
    $scope.serverSideChange = function(gen){
        var gender;
        if(gen == 0){
            gender = '女';
        }
        else{
            gender = '男';
        }
        promise.postUserRevise({gender: gender},
            cookie.getCookie('access_token')).success(function(){
                jQuery.$('arrow2')[2].innerText = gender;
            }).error(function(data){
                popBox.showConfirm('警告!',data.error_description);
            });
    }
});

//第三方登录控制器
indexApp.controller('thirdPartyLogin',function($scope,browser,jQuery,urlBox,promise,$location,popBox,cookie){
    var urlData = urlBox.getUrl('name');
    if(urlData){
        $scope.user = {
            username: urlData
        }
    }
    else{
        $scope.user = {
            username: ''
        }
    }
    $scope.thirdLoginShow = false;
    $scope.but1 = '登录';
    $scope.userText = {
        'height': browser.factory()[5] * 0.098 + 'px'
    };
    jQuery.$('forget').addClass('displayNone');
    $scope.text1 = '   请输入用户名';
    $scope.text3 = '   请输入邮箱地址';
    $scope.text2 = '   请输入密码';
    var check = false;
    $scope.checkTouch = function(){
        check =! check;
    };
    $scope.land = function(){
        if(urlBox.getUrl('token')){
            var url = '?avatar_url=' + urlBox.getUrl('avatar_url') + '&token=' + urlBox.getUrl('token');
            if(check){
                promise.thirdPostUsers($scope.user,url).success(function(){
                    promise.thirdAccessToken(
                        {
                            username: $scope.user.username,
                            password: $scope.user.password
                        },url

                    ).success(function(data){
                            cookie.setCookie('access_token',data.access_token, 's' + data.expires_in);
                            $location.path('/index/home');
                            signIn = false;
                            check = false;
                            $scope.user = '';
                        });

                }).error(function(data){
                    popBox.showConfirm('警告!',data.error_description);
                });
            }
            else{
                popBox.showConfirm('提示','请先同意本站条款!');
            }
        }
        else{
            popBox.showConfirm('提示','非法操作!');
        }

    };
});


//关于我们控制器
indexApp.controller('aboutUs',function($scope,popBox){
    $scope.update = function(){
        popBox.showConfirm('提示','此版本已为最新版本!');
    };
});
